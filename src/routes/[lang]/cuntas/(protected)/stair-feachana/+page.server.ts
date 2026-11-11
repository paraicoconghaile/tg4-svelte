import { loadHistory } from '$lib/server/account/loadHistory';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = loadHistory;