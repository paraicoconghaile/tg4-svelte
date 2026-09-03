import { error } from '@sveltejs/kit';
import { getSchedule } from '$lib/api/schedule';

export async function load({ params }) {
    const validRoutes = {
        en: 'cula4-schedule',
        ga: 'sceideal-cula4'
    };

    if (
        validRoutes[params.lang as keyof typeof validRoutes] !==
        params.cula4schedule
    ) {
        throw error(404, 'Page not found');
    }

    const today = new Date().toISOString().split('T')[0];
    const schedule = await getSchedule(today, 'C4');

    return {
        schedule
    };
}