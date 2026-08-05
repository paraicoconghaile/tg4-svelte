import { error } from '@sveltejs/kit';
import { getSeries } from '$lib/api/tg4_1';

export async function load({ params }) {

    const series = await getSeries(params.slug);
    /* console.log('Series:');
    console.log(JSON.stringify(series, null, 2));
    console.log('Series Name:', series.series.name); */

    if (!series) {
        throw error(404, 'Series not found');
    }

    const rawEpisodes = await getSeriesVideos(series.series.name);
    /* console.log('Episodes:');
    console.log(JSON.stringify(rawEpisodes, null, 2)); */

    if (!rawEpisodes) {
        throw error(404, 'Episode not found');
    }

    const episodes = rawEpisodes.map((ep) => ({
        title: ep.custom_fields.title,
        episodeID: ep.id,
        episodeNumber: ep.custom_fields.episode,
        seriesNumber: ep.custom_fields.series,
        prodCode: ep.custom_fields.p_prodcode,
        seriesCode: ep.custom_fields.s_prodcode,
        seriesDescription:
            params.lang === 'ga'
                ? ep.custom_fields.seriesdescg
                : ep.custom_fields.seriesdesce,
        episodeDescription:
            params.lang === 'ga'
                ? ep.custom_fields.longdescgaeilge
                : ep.description
    }));

    return {
        section: params.section,
        slug: params.slug,
        lang: params.lang,
        series,
        episodes
    };
}