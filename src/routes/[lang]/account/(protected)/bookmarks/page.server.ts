import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    return {
        bookmarks: [
            { video: { displayName: 'LOADER TEST WORKS' } }
        ],
        error: '',
        diagnostics: {
            cookiePresent: true,
            apiStatus: 200,
            bookmarkCount: 1
        }
    };
};