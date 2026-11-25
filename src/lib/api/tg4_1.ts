import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';

const API_KEY = env.TG4_API_KEY;
const NEW_API_KEY = env.TG4_NEW_API_KEY;

const RAILS_CACHE_TTL = 60_000;
const RAILS_RETRY_DELAY = 30_000;
const RAILS_TIMEOUT = 5_000;

type Region = 'IOI' | 'WW';

interface RailsCache {
    cachedRails: any | null;
    cacheExpires: number;
    retryAfter: number;
    pendingRails: Promise<any> | null;
}

const railsCaches: Record<Region, RailsCache> = {
    IOI: {
        cachedRails: null,
        cacheExpires: 0,
        retryAfter: 0,
        pendingRails: null
    },
    WW: {
        cachedRails: null,
        cacheExpires: 0,
        retryAfter: 0,
        pendingRails: null
    }
};

export type Tg4Territory = {
    region: string | null;
    countryCode: string | null;
    city: string | null;
};

export type Tg4ApiResponse<T> = {
    data: T;
    territory: Tg4Territory;
};

export type Tg4VideoResponse = {
    title?: string;
    categories?: unknown[];
    series?: {
        slug?: string;
    };
    video: {
        providerId: string;
        referenceId?: string;
        customFields?: {
            title?: string;
            seriestitle?: string;
            series?: string | number;
            episode?: string | number;
            p_prodcode?: string;
            s_prodcode?: string;
        };
        seasonNumber?: number;
        descriptionGa?: string;
        descriptionEn?: string;
        image?: {
            large?: string;
            original?: string;
            xLarge?: string;
        };
        poster?: string;
        duration?: number;
        airDate?: string;
        subtitles?: unknown;
        contentRating?: string;
    };
};

export class Tg4ApiError extends Error {
    constructor(
        public status: number,
        message = `TG4 API Error: ${status}`
    ) {
        super(message);
        this.name = 'Tg4ApiError';
    }
}

function getTg4Territory(response: Response): Tg4Territory {
    return {
        region: response.headers.get('x-tg4-region'),
        countryCode: response.headers.get('x-tg4-country-code'),
        city: response.headers.get('x-tg4-city')
    };
}

async function fetchTg4Api<T>(url: string, init?: RequestInit): Promise<Tg4ApiResponse<T>> {
    const response = await fetch(url, init);

    if (!response.ok) {
        if ([400, 404, 410].includes(response.status)) {
            throw error(404, 'Content not found');
        }

        throw new Error(`TG4 API Error: ${response.status}`);
    }

    const territory = getTg4Territory(response);
    const data = (await response.json()) as T;

    return { data, territory };
}

const apiCache = new Map<string, {
    data: any;
    expires: number;
    retryAfter: number;
}>();

const pendingRequests = new Map<string, Promise<any>>();

async function getCachedApiData(key: string, url: string, ttl: number, notFoundOn400 = false, region?: Region) {
    const now = Date.now();
    const cached = apiCache.get(key);

    if (cached && now < cached.expires) {
        return structuredClone(cached.data);
    }

    if (cached && now < cached.retryAfter) {
        return structuredClone(cached.data);
    }

    let pending = pendingRequests.get(key);

    if (!pending) {
        pending = (async () => {
            try {
                const response = await fetch(url, {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': API_KEY,
                        ...(region ? { 'X-TG4-Region': region } : {})
                    },
                    signal: AbortSignal.timeout(5000)
                });

                if (!response.ok) {
                    if (notFoundOn400 && [400, 404, 410].includes(response.status)) {
                        return null;
                    }

                    throw new Error(`API Error: ${response.status}`);
                }

                const data = await response.json();

                apiCache.set(key, {
                    data,
                    expires: Date.now() + ttl,
                    retryAfter: 0
                });

                return data;
            } catch (error) {
                console.error(`API request failed: ${key}`, error);

                if (cached) {
                    apiCache.set(key, {
                        ...cached,
                        retryAfter: Date.now() + 30_000
                    });

                    console.warn(`Serving stale cache: ${key}`);
                    return cached.data;
                }

                throw error;
            }
        })().finally(() => {
            pendingRequests.delete(key);
        });

        pendingRequests.set(key, pending);
    }

    return structuredClone(await pending);
}

export async function getGenre(genre: string, skip = 0, limit = 24, region: Region = 'WW') {
    const url =
        `https://api.tg4dev.com/api/series?skip=${skip}&limit=${limit}&category=${encodeURIComponent(genre)}&sites=TG4`;

    return getCachedApiData(
        `genre:${region}:${genre}:${skip}:${limit}`,
        url,
        5 * 60_000,
        false,
        region
    );
}

export async function getSeriesVideos(seriesTitle: string, seasonNumber: number, region: Region = 'WW') {
    const url =
        `https://api.tg4dev.com/api/series/${encodeURIComponent(seriesTitle)}/${seasonNumber}`;

    return getCachedApiData(
        `episodes:${region}:${seriesTitle}:${seasonNumber}`,
        url,
        2 * 60_000,
        true,
        region
    );
}

export async function getVideo(videoId: string) {
    const url = `https://api.tg4dev.com/api/videos/${videoId}`;

    const result = await fetchTg4Api(url,
        {
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY
            }
        }
    );

    //console.log('Video territory:', result.territory);

    return result.data;
}

export async function getVideoWithTerritory(videoId: string, region: Region = 'WW') {
    const url = `https://api.tg4dev.com/api/videos/${videoId}`;

    return fetchTg4Api<Tg4VideoResponse>(url, {
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
            'X-TG4-Region': region
        },
        signal: AbortSignal.timeout(5000)
    });
}

export async function getSeries(slug: string, region: Region = 'WW') {
    const url = `https://api.tg4dev.com/api/series/${encodeURIComponent(slug)}`;

    return getCachedApiData(
        `series:${region}:${slug}`,
        url,
        5 * 60_000,
        true,
        region
    );
}

export async function getRails(region: Region = 'WW') {
    const cache = railsCaches[region];
    const now = Date.now();

    console.log('*** GET RAILS CALLED ***', {
        region,
        cached: !!cache.cachedRails,
        pending: !!cache.pendingRails
    });

    // Return valid cached rails while fresh
    if (cache.cachedRails && now < cache.cacheExpires) {
        return structuredClone(cache.cachedRails);
    }

    // During an API outage, avoid repeated retries
    if (now < cache.retryAfter) {
        return structuredClone(cache.cachedRails ?? { rails: [] });
    }

    // Share one API request between simultaneous callers in the same region
    if (!cache.pendingRails) {
        cache.pendingRails = (async () => {
            const url = 'https://api.tg4dev.com/api/rails/home?api_key=d3b8f0c1-2e4a-4f5b-9c6d-7e8f9a0b1c2d';

            try {
                console.log('*** TG4 RAILS API REQUEST ***', {region, header: region});

                const response = await fetch(url, {
                    headers: {
                        'X-TG4-Region': region
                    },
                    signal: AbortSignal.timeout(RAILS_TIMEOUT)
                });

                if (!response.ok) {
                    throw new Error(`Rails API Error: ${response.status}`);
                }

                const data = await response.json();

                if (!data || !Array.isArray(data.rails)) {
                    throw new Error('Invalid Rails API response');
                }

                // Cache only successful, valid API responses
                cache.cachedRails = data;
                cache.cacheExpires = Date.now() + RAILS_CACHE_TTL;
                cache.retryAfter = 0;

                return data;

            } catch (error) {
                console.error(`Rails API failed (${region}):`, error);

                cache.retryAfter = Date.now() + RAILS_RETRY_DELAY;

                if (cache.cachedRails) {
                    console.warn(`Serving last-known-good Rails data (${region})`);
                    return cache.cachedRails;
                }

                console.warn(`No Rails cache available (${region}) — serving empty rails`);

                // Cold-start fallback; never store as valid cache
                return { rails: [] };
            }
        })().finally(() => {
            cache.pendingRails = null;
        });
    }

    // Return an independent copy for every request
    return structuredClone(await cache.pendingRails);
}

export async function getCurrentEPG() {
    const url = `https://api.tg4dev.com/api/epg/current`;

    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY
        }
    });

    if (!response.ok) {
        const body = await response.text();

        console.error('TG4 EPG API ERROR');
        console.error('URL:', url);
        console.error('Status:', response.status);
        console.error('Response:', body);

        throw new Error(
            `API Error: ${response.status}`
        );
    }

    const territory = getTg4Territory(response);
    const epg = await response.json();

    return { epg, territory };
}

export async function getCategoryRails(category: string, region: Region = 'WW') {
    const url = `https://api.tg4dev.com/api/rails/category/${encodeURIComponent(category)}`;

    return getCachedApiData(
        `category-rails:${region}:${category}`,
        url,
        60_000,
        false,
        region
    );
}

export async function getContinueWatching(peachSid: string, region: Region = 'WW') {
    const url = `https://api.tg4dev.com/api/user/continue-watching`;

    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'X-Peach-Authorization': `sessionToken ${peachSid}`
        }
    });

    if (response.status === 401) {
        return [];
    }

    if (!response.ok) {
        const body = await response.text();

        console.error('TG4 CONTINUE WATCHING API ERROR');
        console.error('URL:', url);
        console.error('Status:', response.status);
        console.error('Response:', body);

        throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
}

export async function getBookmarks(peachSid: string, skip = 0, limit = 20) {
    const url = new URL('https://api.tg4dev.com/api/user/bookmarks');

    url.searchParams.set('skip', String(skip));
    url.searchParams.set('limit', String(limit));

    const response = await fetch(url.toString(), {
        headers: {
            'Content-Type': 'application/json',
            'X-Peach-Authorization': `sessionToken ${peachSid}`
        }
    });

    if (response.status === 401) {
        return [];
    }

    if (!response.ok) {
        const body = await response.text();

        console.error('TG4 BOOKMARKS API ERROR');
        console.error('URL:', url.toString());
        console.error('Status:', response.status);
        console.error('Response:', body);

        throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
}

export async function getHistory(peachSid: string) {
    const url = `https://api.tg4dev.com/api/user/history`;

    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'X-Peach-Authorization': `sessionToken ${peachSid}`
        }
    });

    if (response.status === 401) {
        return [];
    }

    if (!response.ok) {
        const body = await response.text();

        console.error('TG4 HISTORY API ERROR');
        console.error('URL:', url);
        console.error('Status:', response.status);
        console.error('Response:', body);

        throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
}

export async function getDiscoverRails(region: Region = 'WW') {
    const url = 'https://api.tg4dev.com/api/rails/discover';

    return getCachedApiData(
        `discover-rails:${region}`,
        url,
        60_000,
        false,
        region
    );
}