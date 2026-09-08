import { json } from '@sveltejs/kit';
import { loadSeason } from '$lib/player/loadSeries';

export async function GET({ url }) {
    const seriesSlug = url.searchParams.get('series');
    const seasonNumber = Number(url.searchParams.get('season'));
    const lang = url.searchParams.get('lang') ?? 'en';

    if (!seriesSlug || !seasonNumber) {
        return json(
            { error: 'Missing series or season' },
            { status: 400 }
        );
    }

    try {
        const season = await loadSeason(
            seriesSlug,
            seasonNumber,
            lang
        );

        return json(season);

    } catch (err) {
        console.error('Season API error:', err);

        return json(
            { error: 'Failed to load season' },
            { status: 500 }
        );
    }
}