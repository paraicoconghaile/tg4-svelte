import { loadSeries } from '$lib/player/loadSeries';

export async function load({ params, locals, setHeaders }) {
    setHeaders({
        'cache-control': 'no-store'
    });

    const data = await loadSeries(params.slug, params.lang, locals.region);

    return {
        ...data,
        slug: params.slug,
        lang: params.lang
    };
}