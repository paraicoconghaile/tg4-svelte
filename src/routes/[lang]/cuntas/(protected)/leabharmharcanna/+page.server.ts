import { loadBookmarks } from '$lib/server/account/loadBookmarks';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = loadBookmarks;