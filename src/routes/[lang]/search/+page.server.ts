import { loadSearchCollection } from '$lib/api/search';

export async function load({ params, fetch, setHeaders }) {
    try {
        const collection = await loadSearchCollection(fetch);

        setHeaders({'Cache-Control': 'public, max-age=0, s-maxage=900'});

        return {
            lang: params.lang,
            collection,
            results: collection.items ?? []
        };
    } catch (err) {
        console.error('Search collection error:', err);

        setHeaders({'Cache-Control': 'no-store'});

        // Keep the Search page available if the API fails
        return {
            lang: params.lang,
            collection: { items: [] },
            results: []
        };
    }
}