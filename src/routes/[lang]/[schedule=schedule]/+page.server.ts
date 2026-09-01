import { error } from '@sveltejs/kit';
import { getSchedule } from '$lib/api/schedule';

export async function load({ params }) {
    const validRoutes = {
        en: 'daily-schedule',
        ga: 'sceideal-an-lae'
    };

    if (validRoutes[params.lang as keyof typeof validRoutes] !== params.schedule) {
        throw error(404, 'Page not found');
    }

    const schedule = await getSchedule();

    return {
        schedule,
        lang: params.lang
    };
}