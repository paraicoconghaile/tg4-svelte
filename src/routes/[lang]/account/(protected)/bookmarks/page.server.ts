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
        const bookmarks = result?.data ?? [];

        diagnostics.bookmarkCount = bookmarks.length;

        return {
            bookmarks,
            error: '',
            diagnostics
        };
    } catch {
        return {
            bookmarks: [],
            error: 'Unable to reach the bookmarks API.',
            diagnostics
        };
    }
};