import { json } from '@sveltejs/kit';
import { getGenre } from '$lib/api/tg4_1';

export async function GET({ url }) {
    const genre = url.searchParams.get('category');
    const skip = Number(url.searchParams.get('skip') ?? 0);
    const limit = Number(url.searchParams.get('limit') ?? 24);

    if (!genre) {
        return json({ error: 'Missing category' }, { status: 400 });
    }

    if (
        !Number.isInteger(skip) ||
        skip < 0 ||
        !Number.isInteger(limit) ||
        limit < 1 ||
        limit > 50
    ) {
        return json({ error: 'Invalid pagination parameters' }, { status: 400 });
    }

    const rawProgrammes = await getGenre(genre, skip, limit);

    const seriesMap = new Map();

    rawProgrammes.forEach((p) => {
        if (!seriesMap.has(p.slug)) {
            seriesMap.set(p.slug, {
                title: p.name,
                slug: p.slug,
                programme: p
            });
        }
    });

    return json({
        series: Array.from(seriesMap.values()),
        hasMore: rawProgrammes.length === limit
    });
}