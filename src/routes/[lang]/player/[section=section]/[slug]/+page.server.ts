import { loadSeries } from '$lib/player/loadSeries';

export async function load({ params }) {
    const data = await loadSeries(params.slug, params.lang);

    return {
        ...data,
        slug: params.slug,
        lang: params.lang
    };
}