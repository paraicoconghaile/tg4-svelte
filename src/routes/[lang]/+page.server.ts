import type { PageServerLoad } from './$types';
import { getRails } from '$lib/api/tg4_1';

export const load: PageServerLoad = async ({ params, setHeaders, fetch, request, getClientAddress }) => {
    /* setHeaders({
        'cache-control': 'public, max-age=0, s-maxage=900'
    }); */

    setHeaders({
        'cache-control': 'no-store'
    });

    console.log('*** X-FORWARDED-FOR ***', request.headers.get('x-forwarded-for'));
    console.log('*** CLOUDFRONT COUNTRY ***', request.headers.get('cloudfront-viewer-country'));
    console.log('*** SVELTEKIT CLIENT IP ***', getClientAddress());

    try {
        const forwardedFor = request.headers.get('x-forwarded-for');

        const clientIp = forwardedFor
            ?.split(',')[0]
            ?.trim();

        console.log('*** EXTRACTED CLIENT IP ***', clientIp);

        if (!clientIp) {
            throw new Error('Client IP unavailable');
        }

        const response = await fetch(
            'https://staging.api.tg4dev.com/api/region',
            {
                cache: 'no-store',
                headers: {
                    'X-TG4-IP': clientIp
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Region API returned ${response.status}`);
        }

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