const API_BASE = 'https://api.tg4dev.com';

export async function loadLuckyDip(fetchFn: typeof fetch = fetch) {
    const response = await fetchFn(
        `${API_BASE}/api/recommendations/luckydip`
    );

    if (!response.ok) {
        throw new Error(
            `Lucky Dip API failed: ${response.status} ${response.statusText}`
        );
    }

    return response.json();
}