import { json } from '@sveltejs/kit';
import { getContinueWatching } from '$lib/api/tg4_1';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies, setHeaders }) => {
    setHeaders({
        'cache-control': 'private, no-store'
    });

    const peachSid = cookies.get('identity.provider.sid');

    if (!peachSid) {
        return json([]);
    }

    try {
        const continueWatching = await getContinueWatching(peachSid);
        return json(continueWatching);
    } catch (error) {
        console.error('Continue Watching API error:', error);
        return json(
            { error: 'Continue Watching temporarily unavailable' },
            { status: 502 }
        );
    }
};