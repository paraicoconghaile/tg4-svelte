import { error } from '@sveltejs/kit';
import { getSeries, getSeriesVideos } from '$lib/api/tg4_1';

export async function loadSeries(slug:string, lang:string) {
    const series = await getSeries(slug);

    if (!series) {
        throw error(404, 'Series not found');
    }

    //console.log(series);

    const seasonNumber = series.seasons?.[0]?.number;
    const rawEpisodes = await getSeriesVideos(series.series.slug, seasonNumber);

    /* console.log("Raw Episodes:", rawEpisodes);
    console.log("Type:", typeof rawEpisodes);
    console.log("Is Array:", Array.isArray(rawEpisodes)); */

    if (!rawEpisodes) {
        throw error(404, 'Episodes not found');
    }

    const episodes = rawEpisodes.videos.map((ep) => ({
        title: ep.displayName,
        episodeID: ep.vid,
        episodeNumber: ep.episodeNumber,
        seriesNumber: ep.seasonNumber,
        prodCode: ep.pCode,
        seriesCode: ep.customFields.s_prodcode,
        seriesDescription:
            lang === 'ga'
                ? ep.customFields.seriesdescg
                : ep.customFields.seriesdesce,
        episodeDescription:
            lang === 'ga'
                ? ep.customFields.longdescgaeilge
                : ep.description
    }));

    return {
        series,
        episodes
    };
}