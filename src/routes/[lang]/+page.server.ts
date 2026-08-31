import { getRails } from '$lib/api/tg4_1';

export async function load({ params }) {
    const rails = await getRails();

    //console.log(JSON.stringify(rails, null, 2));

    return {
        lang: params.lang,
        rails
    };
}