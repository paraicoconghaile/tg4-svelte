import { error } from '@sveltejs/kit';
import { getGenre, getCategoryRails, getDiscoverRails } from '$lib/api/tg4_1';
import { slugify } from '$lib/utils/slugify';
import { genres, getGenreByKey } from '$lib/config/playerNav';

export async function load({ params }) {
    const categoryMap: Record<string, string> = {
        faisneis: 'faisneis',
        documentaries: 'faisneis',
        ceol: 'ceol',
        music: 'ceol',
        dramaiocht: 'drama',
        drama: 'drama',
        'cursai-reatha': 'cursai-reatha',
        'current-affairs': 'cursai-reatha',
        siamsaiocht: 'siamsaiocht',
        entertainment: 'siamsaiocht',
        sport: 'sport',
        saolchlar: 'saolchlar',
        lifestyle: 'saolchlar',
        cula4: 'cula4'
    };

    if (params.section === 'discover' || params.section === 'aimsigh') {
        const rails = await getDiscoverRails();

        return {
            lang: params.lang,
            section: params.section,
            rails,
            labelEn: 'Discover',
            labelGa: 'Aimsigh',
            routeEn: 'discover',
            routeGa: 'aimsigh',
            series: []
        };
    }

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