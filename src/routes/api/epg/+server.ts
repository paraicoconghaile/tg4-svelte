import { json } from '@sveltejs/kit';
import { getCurrentEPG } from '$lib/api/tg4_1';

export async function GET({ setHeaders }) {
    const epg = await getCurrentEPG();

    setHeaders({
        'cache-control': 'public, max-age=0, s-maxage=60'
    });

    return json(epg);
}