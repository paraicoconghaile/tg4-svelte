import { error } from '@sveltejs/kit';
import { loadSearchCollection } from '$lib/api/search';

export async function load({ params, fetch }) {
    try {
        const collection = await loadSearchCollection(fetch);

        return {
            lang: params.lang,
            collection,
            results: collection.items ?? []
        };
    } catch (err) {
        console.error('Search collection error:', err);

        throw error(
            500,
            'Unable to load search collection'
        );
    }
}