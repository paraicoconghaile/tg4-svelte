import { env } from '$env/dynamic/private';
const API_KEY = env.TG4_API_KEY;
const NEW_API_KEY = env.TG4_NEW_API_KEY;

export async function getGenre(genre: string) {
    const response = await fetch(`https://staging.api.tg4dev.com/api/series?limit=150&category=${genre}`,
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

export async function getSeriesVideos(seriesTitle: string) {
    //const url = `https://playerapi.tg4tech.com/series/videos` + `?seriesTitle=${encodeURIComponent(seriesTitle)}` + `&seriesNumber=` + `&sort=desc`;
    const url = `https://staging.api.tg4dev.com/api/series/${seriesTitle}/1`;

    const response = await fetch(url,
        {
            headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY
            }
        }
    );

    /* console.log("Status:", response.status);
    const body = await response.text();
    console.log("Response:", body); */

    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
}

export async function getVideo(videoId: string) {
    const url = `https://staging.api.tg4dev.com/api/videos/${videoId}`;

    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY
        }
    });


    /* console.log('Status:', response.status);
    console.log('Response:', response); */

    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
}

export async function getRails() {
    const url = `https://staging.api.tg4dev.com/api/rails/home?api_key=d3b8f0c1-2e4a-4f5b-9c6d-7e8f9a0b1c2d`;

    const response = await fetch(url, {
        /* headers: {
            'Content-Type': 'application/json',
            'x-api-key': NEW_API_KEY
        } */
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
}

export async function getSeries(slug: string) {
    const url = `https://staging.api.tg4dev.com/api/series/${slug}`;

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