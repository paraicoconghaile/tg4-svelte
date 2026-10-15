import { getBookmarks } from '$lib/api/tg4_1';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
    const peachSid = cookies.get('identity.provider.sid');

    const diagnostics = {
        cookiePresent: !!peachSid,
        apiStatus: 0,
        bookmarkCount: 0
    };

    if (!peachSid) {
        return {
            bookmarks: [],
            error: 'Your session has expired. Please log in again.',
            diagnostics
        };
    }

    try {
        const response = await fetch(
            'https://api.tg4dev.com/api/user/bookmarks',
            {
                headers: {
                    'X-Peach-Authorization': peachSid
                }
            }
        );

        diagnostics.apiStatus = response.status;

        if (!response.ok) {
            return {
                bookmarks: [],
                error: `Bookmarks API returned status ${response.status}.`,
                diagnostics
            };
        }

        const result = await response.json();

        console.log('Bookmarks response type:', Array.isArray(result) ? 'array' : typeof result);
        console.log('Bookmarks response keys:', result && typeof result === 'object' ? Object.keys(result) : []);
        console.log('Bookmarks response:', JSON.stringify(result, null, 2));

        const responseSummary = {
            isArray: Array.isArray(result),
            keys: result && typeof result === 'object' ? Object.keys(result) : [],
            preview: JSON.stringify(result, null, 2)?.slice(0, 4000)
        };

        const bookmarks = Array.isArray(result)
            ? result
            : result?.data ?? [];

        diagnostics.bookmarkCount = bookmarks.length;

        return {
            bookmarks,
            error: '',
            diagnostics,
            responseSummary
        };
    } catch {
        return {
            bookmarks: [],
            error: 'Unable to reach the bookmarks API.',
            diagnostics
        };
    }
};