export interface SearchFilters {
    query: string;
    category?: string;
    types?: string;
    contentRating?: string;
    subtitleLanguage?: string;
}

export async function loadSearchCollection(fetchFn: typeof fetch) {
    const response = await fetchFn(
        'https://api.tg4dev.com/api/collection/search'
    );

    if (!response.ok) {
        throw new Error('Unable to load search collection');
    }

    return response.json();
}

export async function searchAdvanced(
    fetchFn: typeof fetch,
    filters: SearchFilters
) {
    const params = new URLSearchParams({
        query: filters.query,
        site: 'TG4'
    });

    if (filters.category) {
        params.set('category', filters.category);
    }

    if (filters.types) {
        params.set('types', filters.types);
    }

    if (filters.contentRating) {
        params.set('contentRating', filters.contentRating);
    }

    if (filters.subtitleLanguage) {
        params.set('subtitleLanguage', filters.subtitleLanguage);
    }

    const response = await fetchFn(
        `https://api.tg4dev.com/api/search/advanced?${params}`
    );

    if (!response.ok) {
        throw new Error('Unable to search TG4 programmes');
    }

    return response.json();
}