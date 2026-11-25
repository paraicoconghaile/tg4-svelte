import { getHistory } from '$lib/api/tg4_1';
import type { RequestEvent } from '@sveltejs/kit';

export async function loadHistory({ cookies }: RequestEvent) {
    const peachSid = cookies.get('identity.provider.sid');

    if (!peachSid) {
        return {
            history: [],
            error: 'Your session has expired. Please log in again.'
        };
    }

    try {
        const result = await getHistory(peachSid);

        return {
            history: Array.isArray(result)
                ? result
                : result?.data ?? [],
            error: ''
        };
    } catch (error) {
        console.error('Failed to load history:', error);

        return {
            history: [],
            error: 'Unable to load your history. Please try again.'
        };
    }
}