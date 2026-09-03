import { json } from '@sveltejs/kit';
import { getSchedule } from '$lib/api/schedule';

export async function GET({ url }) {
    const date = url.searchParams.get('date');
    const channel = url.searchParams.get('channel');

    if (!date) {
        return json(
            { error: 'Date is required' },
            { status: 400 }
        );
    }

    try {
        const schedule = await getSchedule(date, channel ?? undefined);

        return json(schedule);
    } catch (err) {
        console.error('Schedule API error:', err);

        return json(
            { error: 'Failed to load schedule' },
            { status: 500 }
        );
    }
}