import type { PageServerLoad } from './$types';
import { getRails } from '$lib/api/tg4_1';

export const load: PageServerLoad = async ({ params, setHeaders, fetch }) => {
    /* setHeaders({
        'cache-control': 'public, max-age=0, s-maxage=900'
    }); */

    setHeaders({
        'cache-control': 'no-store'
    });

    try {
        const response = await fetch(
            'https://staging.api.tg4dev.com/api/region',
            { cache: 'no-store' }
        );

        const regionData = await response.json();

        console.log('*** SERVER REGION TEST ***', regionData);
    } catch (error) {
        console.error('Region API test failed:', error);
    }

    const rails = await getRails();

    // Do not include personalised Continue Watching items in public HTML.
    const publicRails = {
        ...rails,
        rails: rails.rails.map((rail) =>
            rail.type === 'CONTINUE_WATCHING'
                ? { ...rail, items: [] }
                : rail
        )
    };

    return {
        lang: params.lang,
        rails: publicRails
    };
};