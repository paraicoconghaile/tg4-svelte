import { json } from '@sveltejs/kit';
import { getCurrentEPG } from '$lib/api/tg4_1';

export async function GET() {
    const { territory } = await getCurrentEPG();

    return json(territory, {
        headers: {
            'Cache-Control': 'private, no-store'
        }
    });
}