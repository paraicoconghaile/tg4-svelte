
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
        const response = await fetch(
            'https://api.tg4dev.com/api/user/bookmarks',
            {
                headers: {
                    'X-Peach-Authorization': peachSid
                }
            }
        );

        if (!response.ok) {
            return {
                bookmarks: [],
                error: `Unable to load bookmarks (HTTP ${response.status}).`
            };
        }

        const result = await response.json();

        return {
            bookmarks: result?.data ?? [],
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