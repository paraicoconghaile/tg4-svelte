import { env } from '$env/dynamic/private';
const API_KEY = env.TG4_API_KEY;
const NEW_API_KEY = env.TG4_NEW_API_KEY;

export type Tg4Territory = {
    region: string | null;
    countryCode: string | null;
    city: string | null;
};

export type Tg4ApiResponse<T> = {
    data: T;
    territory: Tg4Territory;
};

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
        throw new Error(`TG4 API Error: ${response.status}`);
    }

    const territory = getTg4Territory(response);
    const data = (await response.json()) as T;

    return { data, territory };
}

export async function getGenre(
    genre: string,
    skip = 0,
    limit = 24
) {
    const response = await fetch(
        `https://api.tg4dev.com/api/series?skip=${skip}&limit=${limit}&category=${genre}`,
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

export async function getSeriesVideos(seriesTitle: string, seasonNumber: number) {
    const url = `https://api.tg4dev.com/api/series/${seriesTitle}/${seasonNumber}`;

    //console.log('getSeriesVideos URL:', url);

    const response = await fetch(url,
        {
            headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY
            }
        }
    );

    const text = await response.text();
    /* console.log('getSeriesVideos status:', response.status);
    console.log('getSeriesVideos response:', text); */

    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }

    return JSON.parse(text);
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
    const url = `https://api.tg4dev.com/api/series/${slug}`;

    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY
        }
    });

    if (!response.ok) {
        throw new Error("Series not found");
    }

    return response.json();
}

export async function getRails() {
    const url = `https://api.tg4dev.com/api/rails/home?api_key=d3b8f0c1-2e4a-4f5b-9c6d-7e8f9a0b1c2d`;

    const response = await fetch(url);

    /* console.log('TG4 region:', response.headers.get('x-tg4-region'));
    console.log('TG4 country:', response.headers.get('x-tg4-country-code'));
    console.log('TG4 city:', response.headers.get('x-tg4-city')); */

    if (!response.ok) {
        const body = await response.text();

        console.error('TG4 API ERROR');
        console.error('URL:', url);
        console.error('Status:', response.status);
        console.error('Response:', body);

        throw new Error(
            `API Error: ${response.status}`
        );
    }

    return response.json();
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

    console.error('SESSION TOKEN', {peachSid});

    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            //'X-Peach-Authorization': peachSid
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
            'X-Peach-Authorization': peachSid
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
            'X-Peach-Authorization': peachSid
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