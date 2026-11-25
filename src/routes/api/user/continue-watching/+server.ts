import { json } from '@sveltejs/kit';
import { getContinueWatching } from '$lib/api/tg4_1';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies, setHeaders, url }) => {
    setHeaders({
        'cache-control': 'private, no-store'
    });

    // Continue Watching is currently supported on production only
    if (url.hostname !== 'www.tg4.ie') {
        return json([]);
    }

    const peachSid = cookies.get('identity.provider.sid');

    if (!peachSid) {
        return json([]);
    }

    try {
        const continueWatching = await getContinueWatching(peachSid);
        return json(continueWatching);
    } catch (error) {
        console.warn(
            'Continue Watching unavailable:',
            error instanceof Error ? error.message : error
        );

        return json([]);
    }
};