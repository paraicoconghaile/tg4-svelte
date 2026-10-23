import { json } from '@sveltejs/kit';
import { loadLuckyDip } from '$lib/api/luckyDip';

export async function GET({ fetch }) {
    try {
        const result = await loadLuckyDip(fetch);
        return json(result);
    } catch (error) {
        console.error('Lucky Dip API error:', error);

        return json(
            { error: 'Unable to load Lucky Dip' },
            { status: 502 }
        );
    }
}