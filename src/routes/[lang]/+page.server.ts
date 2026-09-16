import { getRails } from '$lib/api/tg4_1';

export async function load({ params }) {
    //console.log('PAGE LOAD - getRails called');

    const rails = await getRails();

    return {
        lang: params.lang,
        rails
    };
}