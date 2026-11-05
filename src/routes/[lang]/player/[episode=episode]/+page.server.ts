import { error } from '@sveltejs/kit';
import { getGenre, getVideoWithTerritory, getSeriesVideos } from '$lib/api/tg4_1';
import { getGenreByKey } from '$lib/config/playerNav';

export async function load({ params }) {
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

    try {
        result = await getVideoWithTerritory(params.episode);

        //console.log('VIDEO API RESPONSE:', JSON.stringify(result.data, null, 2));
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
        title: rawVideo.video.customFields?.title ?? rawVideo.title,
        seriesTitle: rawVideo.video.customFields.seriestitle,
        seriesNumber: rawVideo.video.customFields?.series ?? rawVideo.video.seasonNumber,
        episodeNumber: rawVideo.video.customFields.episode,
        description: params.lang === 'ga' ? rawVideo.video.descriptionGa : rawVideo.video.descriptionEn,
        poster: rawVideo.video.image.xLarge,
        prodCode: rawVideo.video.customFields.p_prodcode,
        seriesCode: rawVideo.video.customFields.s_prodcode,
        duration: rawVideo.video.duration,
        airDate: rawVideo.video.airDate,
        categories: rawVideo.categories,
        subtitles: rawVideo.video.subtitles,
        contentRating: rawVideo.video.contentRating,
        slug: rawVideo.series?.slug ?? null
    };

    /* const rawEpisodes = await getSeriesVideos(
        video.slug,
        Number(video.seriesNumber)
    ); */

    const rawEpisodes =
        video.slug && video.seriesNumber != null
        ? await getSeriesVideos(
            video.slug,
            Number(video.seriesNumber)
        )
        : null;

    const otherEpisodes = (rawEpisodes?.videos ?? [])
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
            description:
                params.lang === 'ga'
                    ? ep.descriptionGa
                    : ep.descriptionEn,
            duration: ep.duration
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