import { error } from '@sveltejs/kit';
import { getSeries, getSeriesVideos, Tg4ApiError } from '$lib/api/tg4_1';

async function getSeriesVideosOr404(slug: string, seasonNumber: number) {
    try {
        return await getSeriesVideos(slug, seasonNumber);
    } catch (err) {
        if (
            err instanceof Tg4ApiError &&
            [400, 404, 410].includes(err.status)
        ) {
            error(404, 'Season not found');
        }

        throw err;
    }
}

export async function loadSeries(slug: string, lang: string) {
    let series;

    try {
        series = await getSeries(slug);
    } catch (err) {
        if (
            err instanceof Tg4ApiError &&
            [400, 404, 410].includes(err.status)
        ) {
            error(404, 'Series not found');
        }

        throw err;
    }

    if (!series) {
        throw error(404, 'Series not found');
    }

    /* console.log('========== SERIES JSON ==========');
    console.log("Raw Series:", series);
    console.log('================================'); */

    // Get latest season only
    const latestSeason = series.seasons[0];

    if (!latestSeason) {
        throw error(404, 'Seasons not found');
    }

    const seasonNumber = latestSeason.number;
    //console.log("Loading latest season:", seasonNumber);

    const rawEpisodes = await getSeriesVideosOr404(series.series.slug, seasonNumber);

    if (!rawEpisodes) {
        error(404, 'Season not found');
    }

    const episodes = rawEpisodes?.videos?.map((ep) => ({
        title: ep.displayTitle,
        episodeID: ep.vid,
        episodeNumber: ep.episodeNumber,
        seriesNumber: ep.seasonNumber,
        duration: ep.duration,
        geoRestricted: ep.geoRestricted,
        contentRating: ep.contentRating,
        prodCode: ep.pCode,
        seriesCode: ep.customFields.s_prodcode,
        image:
            ep.image?.original ||
            ep.image?.large ||
            ep.image?.xLarge ||
            ep.poster ||
            'https://res.cloudinary.com/tg4/image/upload/w_700,h_395,g_faces,c_fill,f_auto,q_auto/000000.jpg',
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

export async function loadSeason(seriesSlug: string, seasonNumber: number, lang: string) {
    /* const rawEpisodes = await getSeriesVideos(
        seriesSlug,
        seasonNumber
    ); */

    const rawEpisodes = await getSeriesVideosOr404(seriesSlug, seasonNumber);

    if (!rawEpisodes) {
        error(404, 'Season not found');
    }

    const episodes = rawEpisodes?.videos?.map((ep) => ({
        title: ep.displayTitle,
        episodeID: ep.vid,
        episodeNumber: ep.episodeNumber,
        seriesNumber: ep.seasonNumber,
        duration: ep.duration,
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