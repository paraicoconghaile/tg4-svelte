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
        const result = await getBookmarks(peachSid);

        return {
            bookmarks: Array.isArray(result)
                ? result
                : result?.data ?? [],
            error: '',
            diagnostics: {
                isArray: Array.isArray(result),
                keys: result && typeof result === 'object'
                    ? Object.keys(result)
                    : [],
                dataCount: result?.data?.length,
                firstTitle: result?.data?.[0]?.video?.displayName
            }
        };

        /* return {
            bookmarks: Array.isArray(result)
                ? result
                : result?.data ?? [],
            error: ''
        }; */
    } catch (error) {
        console.error('Failed to load bookmarks:', error);

        return {
            bookmarks: [],
            error: 'Unable to load your bookmarks. Please try again.'
        };
    }
};