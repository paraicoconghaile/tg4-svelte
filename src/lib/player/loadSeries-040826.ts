import { error } from '@sveltejs/kit';
import { getSeries, getSeriesVideos } from '$lib/api/tg4_1';

export async function loadSeries(slug:string, lang:string) {
    const series = await getSeries(slug);

    if (!series) {
        throw error(404, 'Series not found');
    }

    //console.log(series);

    const rawEpisodes = await getSeriesVideos(series.series.name);

    if (!rawEpisodes) {
        throw error(404, 'Episodes not found');
    }

    const episodes = rawEpisodes.map((ep) => ({
        title: ep.custom_fields.title,
        episodeID: ep.id,
        episodeNumber: ep.custom_fields.episode,
        seriesNumber: ep.custom_fields.series,
        prodCode: ep.custom_fields.p_prodcode,
        seriesCode: ep.custom_fields.s_prodcode,
        seriesDescription:
            lang === 'ga'
                ? ep.custom_fields.seriesdescg
                : ep.custom_fields.seriesdesce,
        episodeDescription:
            lang === 'ga'
                ? ep.custom_fields.longdescgaeilge
                : ep.description
    }));

    return {
        series,
        episodes
    };
}