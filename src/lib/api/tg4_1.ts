import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';

const API_KEY = env.TG4_API_KEY;
const NEW_API_KEY = env.TG4_NEW_API_KEY;

const RAILS_CACHE_TTL = 60_000;
const RAILS_RETRY_DELAY = 30_000;
const RAILS_TIMEOUT = 5_000;

let cachedRails: any = null;
let cacheExpires = 0;
let retryAfter = 0;
let pendingRails: Promise<any> | null = null;

export type Tg4Territory = {
    region: string | null;
    countryCode: string | null;
    city: string | null;
};

export type Tg4ApiResponse<T> = {
    data: T;
    territory: Tg4Territory;
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

async function fetchTg4Api<T>(
    url: string,
    init?: RequestInit
): Promise<Tg4ApiResponse<T>> {
    const response = await fetch(url, init);

    if (!response.ok) {
        if (response.status === 404) {
            throw error(404, 'Video not found');
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

async function getCachedApiData(
    key: string,
    url: string,
    ttl: number,
    notFoundOn400 = false
) {
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
                        'x-api-key': API_KEY
                    },
                    signal: AbortSignal.timeout(5000)
                });

                if (!response.ok) {
                    if (notFoundOn400 && [400, 404].includes(response.status)) {
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

export async function getGenre(
    genre: string,
    skip = 0,
    limit = 24
) {
    const response = await fetch(
        `https://api.tg4dev.com/api/series?skip=${skip}&limit=${limit}&category=${genre}&sites=TG4`,
        {
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY
            }
        }
    );

    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
}

export async function getSeriesVideos(
    seriesTitle: string,
    seasonNumber: number
) {
    const url =
        `https://api.tg4dev.com/api/series/${encodeURIComponent(seriesTitle)}/${seasonNumber}`;

    return getCachedApiData(
        `episodes:${seriesTitle}:${seasonNumber}`,
        url,
        2 * 60_000,
        true
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

    console.log('Video territory:', result.territory);

    return result.data;
}

export async function getVideoWithTerritory(videoId: string) {
    const url = `https://api.tg4dev.com/api/videos/${videoId}`;

    return fetchTg4Api(url, {
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY
        }
    });
}


export async function getSeries(slug: string) {
    const url = `https://api.tg4dev.com/api/series/${encodeURIComponent(slug)}`;

    return getCachedApiData(
        `series:${slug}`,
        url,
        5 * 60_000,
        true
    );
}

export async function getRails() {
    const now = Date.now();

    // Return valid cached rails while fresh
    if (cachedRails && now < cacheExpires) {
        return structuredClone(cachedRails);
    }

    // During an API outage, avoid repeated retries
    if (now < retryAfter) {
        return structuredClone(cachedRails ?? { rails: [] });
    }

    // Share one API request between simultaneous callers
    if (!pendingRails) {
        pendingRails = (async () => {
            const url = 'https://api.tg4dev.com/api/rails/home?api_key=d3b8f0c1-2e4a-4f5b-9c6d-7e8f9a0b1c2d';

            try {
                const response = await fetch(url, {
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
                cachedRails = data;
                cacheExpires = Date.now() + RAILS_CACHE_TTL;
                retryAfter = 0;

                return data;

            } catch (error) {
                console.error('Rails API failed:', error);

                retryAfter = Date.now() + RAILS_RETRY_DELAY;

                if (cachedRails) {
                    console.warn('Serving last-known-good Rails data');
                    return cachedRails;
                }

                console.warn('No Rails cache available — serving empty rails');

                // Cold-start fallback; never store as valid cache
                return { rails: [] };
            }
        })().finally(() => {
            pendingRails = null;
        });
    }

    // Return an independent copy for every request
    return structuredClone(await pendingRails);
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

    return response.json();
}

export async function getCategoryRails(category: string) {
    const url = `https://api.tg4dev.com/api/rails/category/${category}`;

    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch category rails: ${response.status}`);
    }

    return await response.json();
}

export async function getContinueWatching(peachSid: string) {
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

export async function getBookmarks(
    peachSid: string,
    skip = 0,
    limit = 20
) {
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


export async function getDiscoverRails() {
    const url = `https://api.tg4dev.com/api/rails/discover?api_key=d3b8f0c1-2e4a-4f5b-9c6d-7e8f9a0b1c2d`;

    const response = await fetch(url);

    if (!response.ok) {
        const body = await response.text();

        console.error('TG4 DISCOVER API ERROR');
        console.error('URL:', url);
        console.error('Status:', response.status);
        console.error('Response:', body);

        throw new Error(`Discover API Error: ${response.status}`);
    }

    return response.json();
}