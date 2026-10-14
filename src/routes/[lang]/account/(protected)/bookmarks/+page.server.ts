import { getBookmarks } from '$lib/api/tg4_1';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
    const peachSid = cookies.get('identity.provider.sid');

    if (!peachSid) {
        return {
            bookmarks: [],
            error: 'Your session has expired. Please log in again.'
        };
    }

    try {
        const bookmarks = await getBookmarks(peachSid);
        console.log('Bookmarks API response:', JSON.stringify(bookmarks, null, 2));

        return {
            bookmarks: Array.isArray(bookmarks)
                ? bookmarks
                : bookmarks?.bookmarks ?? [],
            error: ''
        };
    } catch (error) {
        console.error('Failed to load bookmarks:', error);

        return {
            bookmarks: [],
            error: 'Unable to load your bookmarks. Please try again.'
        };
    }
};