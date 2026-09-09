import { error } from '@sveltejs/kit';
import { getSeries, getSeriesVideos } from '$lib/api/tg4_1';

export async function loadSeries(slug: string, lang: string) {
    const series = await getSeries(slug);

    if (!series) {
        throw error(404, 'Series not found');
    }

    /* console.log("POCO");
    console.log("Raw Series:", series); */

    // Get latest season only
    const latestSeason = series.seasons[0];

    if (!latestSeason) {
        throw error(404, 'Seasons not found');
    }

    const seasonNumber = latestSeason.number;
    //console.log("Loading latest season:", seasonNumber);

    const rawEpisodes = await getSeriesVideos(
        series.series.slug,
        seasonNumber
    );

    //console.log("Raw Episodes:", rawEpisodes);

    const episodes = rawEpisodes?.videos?.map((ep) => ({
        title: ep.displayName,
        episodeID: ep.vid,
        episodeNumber: ep.episodeNumber,
        seriesNumber: ep.seasonNumber,
        duration: ep.duration,
        geoRestricted: ep.geoRestricted,
        contentRating: ep.contentRating,
        prodCode: ep.pCode,
        seriesCode: ep.customFields.s_prodcode,
        seriesDescription: lang === 'ga' ? ep.customFields.seriesdescg : ep.customFields.seriesdesce,
        episodeDescription: lang === 'ga' ? ep.descriptionGa : ep.descriptionEn
    })) ?? [];

    return {
        series,
        seasons: [
            {
                seasonNumber,
                episodes
            }
        ]
    };
}

export async function loadSeason(
    seriesSlug: string,
    seasonNumber: number,
    lang: string
) {
    const rawEpisodes = await getSeriesVideos(
        seriesSlug,
        seasonNumber
    );

    const episodes = rawEpisodes?.videos?.map((ep) => ({
        title: ep.displayName,
        episodeID: ep.vid,
        episodeNumber: ep.episodeNumber,
        seriesNumber: ep.seasonNumber,
        prodCode: ep.pCode,
        seriesCode: ep.customFields.s_prodcode,
        seriesDescription: lang === 'ga' ? ep.customFields.seriesdescg : ep.customFields.seriesdesce,
        episodeDescription: lang === 'ga' ? ep.descriptionGa : ep.descriptionEn
    })) ?? [];

    return {
        seasonNumber,
        episodes
    };
}