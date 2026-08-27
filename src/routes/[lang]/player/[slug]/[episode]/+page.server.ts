import { error } from '@sveltejs/kit';
import { getGenre, getVideo } from '$lib/api/tg4_1';
import { getGenreByKey } from '$lib/config/playerNav';

export async function load({ params }) {
    //console.log("SHORT EPISODE ROUTE", params);

    const categoryMap: Record<string, string> = {
        faisneis: 'documentaries',
        'top-documentaries': 'documentaries',
        ceol: 'music',
        'irish-music-series': 'music',
        dramaiocht: 'Drama',
        'drama-tv-shows': 'Drama',
        nuacht: 'news',
        'news-stories': 'news',
        siamsaiocht: 'entertainment',
        'entertainment-shows': 'entertainment',
        sport: 'Sport',
        'sport-tv-player': 'Sport',
        saolchlar: 'lifestyle',
        'lifestyle-tv-shows': 'lifestyle',
        gasuir: 'Cula4',
        'childrens-tv-shows': 'Cula4'
    };

    /* const currentGenre = getGenreByKey(params.section);

    if (!currentGenre) {
        throw error(404, 'Unknown category');
    } */

    const rawVideo = await getVideo(params.episode);
    console.log(JSON.stringify(rawVideo, null, 2));

    if (!rawVideo) {
        throw error(404, 'Video not found');
    }

    const video = {
        videoId: rawVideo.video.providerId,
        title: rawVideo.video.customFields?.title ?? rawVideo.title,
        seriesTitle: rawVideo.video.customFields.seriestitle,
        seriesNumber: rawVideo.video.customFields.series,
        episodeNumber: rawVideo.video.customFields.episode,
        description:
            params.lang === 'ga'
                ? rawVideo.video.customFields?.longdescgaeilge
                : rawVideo.description,
        //poster: rawVideo.video.poster,
        poster: rawVideo.video.image.xLarge,
        prodCode: rawVideo.video.customFields.p_prodcode,
        seriesCode: rawVideo.video.customFields.s_prodcode
    };

    return {
        lang: params.lang,
        section: params.section,
        slug: params.slug,
        //backRoute: currentGenre.key[params.lang],
        backLabel: params.lang === 'ga' ? 'SIAR' : 'BACK',
        //routeGa: currentGenre.key.ga,
        //routeEn: currentGenre.key.en,
        video
    };
}