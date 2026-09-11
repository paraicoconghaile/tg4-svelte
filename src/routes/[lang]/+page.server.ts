import { getRails } from '$lib/api/tg4_1';

export async function load({ params }) {
    const rails = await getRails();

    return {
        lang: params.lang,
        rails
    };
}