import { error } from '@sveltejs/kit';

export async function load({ url, params, fetch }) {
    const query = url.searchParams.get('q')?.trim() ?? '';

    if (!query) {
        return {
            lang: params.lang,
            query: '',
            results: []
        };
    }

    const response = await fetch(
        `https://staging.api.tg4dev.com/api/search/advanced?query=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
        throw error(
            response.status,
            'Unable to load search results'
        );
    }

    const data = await response.json();

    return {
        lang: params.lang,
        query,
        results: data.results ?? []
    };
}