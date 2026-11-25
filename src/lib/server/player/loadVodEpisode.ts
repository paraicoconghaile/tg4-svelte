import { error } from '@sveltejs/kit';
import { getGenre, getVideoWithTerritory, getSeriesVideos } from '$lib/api/tg4_1';
import { getGenreByKey } from '$lib/config/playerNav';
import type { RequestEvent } from '@sveltejs/kit';

type RelatedEpisode = {
    vid: string;
    displayTitle?: string;
    episodeNumber?: number;
    seasonNumber?: number;
    pCode?: string;
    customFields?: {
        s_prodcode?: string;
    };
    descriptionGa?: string;
    descriptionEn?: string;
    duration?: number;
    image?: {
        large?: string;
        original?: string;
        xLarge?: string;
    };
    poster?: string;
};

export async function loadVodEpisode({params}: RequestEvent) {
    //console.log("SHORT EPISODE ROUTE", params);

    const categoryMap: Record<string, string> = {
        faisneis: 'documentaries',
        documentaries: 'documentaries',
        ceol: 'music',
        music: 'music',
        dramaiocht: 'Drama',
        drama: 'Drama',
        'cursai-reatha': 'cursai-reatha',
        'current-affairs': 'cursai-reatha',
        siamsaiocht: 'entertainment',
        entertainment: 'entertainment',
        sport: 'Sport',
        saolchlar: 'lifestyle',
        lifestyle: 'lifestyle',
        cula4: 'Cula4'
    };

    //const rawVideo = await getVideo(params.episode);

    let result;

    if (!params.episode) {
        throw error(404, 'Video Not Found');
    }

    try {
        result = await getVideoWithTerritory(params.episode);
    } catch (err) {
        if (
            err instanceof Error &&
            (
                err.message === 'TG4 API Error: 400' ||
                err.message === 'TG4 API Error: 404' ||
                err.message === 'TG4 API Error: 410'
            )
        ) {
            error(404, 'Video Not Found');
        }

        throw err;
    }

    const rawVideo = result.data;
    const territory = result.territory;

    if (!rawVideo) {
        throw error(404, 'Video not found');
    }

    if (!rawVideo.video?.providerId) {
        throw error(404, 'Video Not Found');
    }

    //console.log('VIDEO DATA:', JSON.stringify(rawVideo, null, 2));

    const video = {
        videoId: rawVideo.video.providerId,
        referenceId: rawVideo.video.referenceId,
        title: rawVideo.video.customFields?.title ?? rawVideo.title,
        seriesTitle: rawVideo.video.customFields?.seriestitle ?? '',
        seriesNumber: rawVideo.video.customFields?.series ?? rawVideo.video.seasonNumber,
        episodeNumber: rawVideo.video.customFields?.episode ?? '',
        description: params.lang === 'ga' ? rawVideo.video.descriptionGa : rawVideo.video.descriptionEn,
        image: rawVideo.video.image?.large || rawVideo.video.image?.original || rawVideo.video.image?.xLarge || rawVideo.video.poster || 'https://res.cloudinary.com/tg4/image/upload/w_700,h_395,g_faces,c_fill,f_auto,q_auto/000000.jpg',
        poster: rawVideo.video.image?.large ?? '',
        prodCode: rawVideo.video.customFields?.p_prodcode ?? '',
        seriesCode: rawVideo.video.customFields?.s_prodcode ?? '',
        duration: rawVideo.video.duration,
        airDate: rawVideo.video.airDate,
        categories: rawVideo.categories,
        subtitles: rawVideo.video.subtitles,
        contentRating: rawVideo.video.contentRating,
        slug: rawVideo.series?.slug ?? null
    };

    const rawEpisodes =
        video.slug && video.seriesNumber != null
        ? await getSeriesVideos(video.slug, Number(video.seriesNumber))
        : null;

    //console.log('RAW EPISODES:', JSON.stringify(rawEpisodes, null, 2));

    const episodes: RelatedEpisode[] = rawEpisodes?.videos ?? [];

    const otherEpisodes = episodes
        .filter((ep) => {
            const episodeId = String(ep.vid).replace(/^BC-/, '');
            const currentId = String(video.videoId).replace(/^BC-/, '');

            return episodeId !== currentId;
        })
        .slice(0, 4)
        .map((ep) => ({
            title: ep.displayTitle,
            episodeID: ep.vid,
            episodeNumber: ep.episodeNumber,
            seriesNumber: ep.seasonNumber,
            prodCode: ep.pCode,
            seriesCode: ep.customFields?.s_prodcode,
            description: params.lang === 'ga' ? ep.descriptionGa : ep.descriptionEn,
            duration: ep.duration,
            image: ep.image?.large || ep.image?.original || ep.image?.xLarge || ep.poster || 'https://res.cloudinary.com/tg4/image/upload/w_700,h_395,g_faces,c_fill,f_auto,q_auto/000000.jpg',
            poster: ep.poster
        }));

    return {
        lang: params.lang,
        section: params.section,
        slug: params.slug,
        video,
        otherEpisodes,
        territory
    };
}