/* import { error } from '@sveltejs/kit';
import { loadLuckyDip } from '$lib/api/luckyDip';

export async function load({ fetch, params }) {
    try {
        const luckyDip = await loadLuckyDip(fetch);

        return {
            luckyDip,
            lang: params.lang
        };
    } catch (err) {
        console.error('Lucky Dip collection error:', err);

        throw error(
            500,
            'Unable to load Lucky Dip'
        );
    }
} */

export async function load({ params }) {
    return {
        lang: params.lang
    };
}