import { error } from '@sveltejs/kit';
import { getSportSchedule } from '$lib/api/schedule';

export async function load({ params }) {
    const validRoutes = {
        en: 'sport-schedule',
        ga: 'sceideal-spoirt'
    };

    if (
        validRoutes[params.lang as keyof typeof validRoutes] !==
        params.sportschedule
    ) {
        throw error(404, 'Page not found');
    }

    const schedule = await getSportSchedule();

    return {
        schedule
    };
}