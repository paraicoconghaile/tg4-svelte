import { error } from '@sveltejs/kit';
import { getGenre, getCategoryRails } from '$lib/api/tg4_1';
import { slugify } from '$lib/utils/slugify';
import { genres, getGenreByKey } from '$lib/config/playerNav';

export async function load({ params }) {
    const categoryMap: Record<string, string> = {
        faisneis: 'faisneis',
        'top-documentaries': 'faisneis',
        ceol: 'ceol',
        'irish-music-series': 'ceol',
        dramaiocht: 'drama',
        'drama-tv-shows': 'drama',
        nuacht: 'cursai-reatha',
        'news-stories': 'cursai-reatha',
        siamsaiocht: 'siamsaiocht',
        'entertainment-shows': 'siamsaiocht',
        sport: 'sport',
        'sport-tv-player': 'sport',
        saolchlar: 'saolchlar',
        'lifestyle-tv-shows': 'saolchlar',
        gasuir: 'cula4',
        'childrens-tv-shows': 'cula4'
    };

    const currentGenre = getGenreByKey(params.section);

    if (!currentGenre) {
        throw new Error(`Unknown category: ${params.section}`);
    }

    const genre = categoryMap[params.section];

    if (!genre) {
        throw new Error(`Unknown category: ${params.section}`);
    }

    // Get the existing series/programme data
    const rawProgrammes = await getGenre(genre);

    // Get the rails for this category
    const rails = await getCategoryRails(genre);
    
    const seriesMap = new Map();

    //console.log(rawProgrammes);

    rawProgrammes.forEach((p) => {
        //console.log("Prog", p);
        const slug = p.slug;

        if (!seriesMap.has(slug)) {
            seriesMap.set(slug, {
                title: p.name,
                slug,
                description: params.lang === 'ga' ? p.descGa : p.descEn,
                programme: p
            });
        }
    });

    return {
        series: Array.from(seriesMap.values()),
        // Category rails
        rails,
        section: params.section,
        genre,
        lang: params.lang,
        routeGa: currentGenre.key.ga,
        routeEn: currentGenre.key.en,
        labelGa: currentGenre.label.ga,
        labelEn: currentGenre.label.en
    };
}