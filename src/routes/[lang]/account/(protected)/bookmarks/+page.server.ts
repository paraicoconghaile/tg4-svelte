import { getBookmarks } from '$lib/api/tg4_1';
import type { PageServerLoad } from './$types';

const PAGE_SIZE = 3;

export const load: PageServerLoad = async ({ cookies, url }) => {
    const peachSid = cookies.get('identity.provider.sid');
    //const peachSid = '6ccb99f1-3ff2-4986-b9f9-3b3f7c518d67';

    const requestedPage = Number(url.searchParams.get('page') ?? 1);
    const page = Number.isInteger(requestedPage) && requestedPage > 0
        ? requestedPage
        : 1;

    if (!peachSid) {
        return {
            bookmarks: [],
            page,
            hasMore: false,
            error: 'Your session has expired. Please log in again.'
        };
    }

    try {
        const skip = (page - 1) * PAGE_SIZE;
        const result = await getBookmarks(peachSid, skip, PAGE_SIZE);

        const bookmarks = Array.isArray(result)
            ? result
            : result?.data?.data ?? [];

        const hasMore = Array.isArray(result)
            ? bookmarks.length === PAGE_SIZE
            : result?.data?.hasMore ?? false;

        return {
            bookmarks,
            page,
            hasMore,
            error: ''
        };
    } catch (error) {
        console.error('Failed to load bookmarks:', error);

        return {
            bookmarks: [],
            page,
            hasMore: false,
            error: 'Unable to load your bookmarks. Please try again.'
        };
    }
};