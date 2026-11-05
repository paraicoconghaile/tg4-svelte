import type { PageServerLoad } from './$types';
import { getRails } from '$lib/api/tg4_1';

export const load: PageServerLoad = async ({ params, setHeaders }) => {
    /* setHeaders({
        'cache-control': 'public, max-age=0, s-maxage=900'
    }); */

    setHeaders({
        'cache-control': 'private, no-store, max-age=0'
    });

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