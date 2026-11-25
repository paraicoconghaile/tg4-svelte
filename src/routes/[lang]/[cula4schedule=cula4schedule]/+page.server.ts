import { error } from '@sveltejs/kit';
import { getSchedule } from '$lib/api/schedule';

export async function load({ params, setHeaders }) {
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

    //const today = new Date().toISOString().split('T')[0];

    const now = new Date();

    const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Dublin',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        hourCycle: 'h23'
    }).formatToParts(now);

    const getPart = (type: string) =>
        Number(parts.find((part) => part.type === type)?.value);

    const hour = getPart('hour');

    const today = new Date(Date.UTC(
        getPart('year'),
        getPart('month') - 1,
        getPart('day') - (hour < 5 ? 1 : 0)
    )).toISOString().split('T')[0];

    const schedule = await getSchedule(today, 'C4');

    // Calculate seconds until the next 5 AM in Ireland
    const currentTime = new Date();

    const timeParts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Dublin',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23'
    }).formatToParts(currentTime);

    const timePart = (type: string) =>
        Number(timeParts.find((part) => part.type === type)?.value);

    const secondsNow =
        timePart('hour') * 3600 +
        timePart('minute') * 60 +
        timePart('second');

    const secondsUntilFive =
        (5 * 3600 - secondsNow + 86400) % 86400 || 86400;

    const cacheSeconds = Math.min(900, secondsUntilFive);

    setHeaders({
        'Cache-Control': `public, max-age=0, s-maxage=${cacheSeconds}`
    });

    return {
        schedule
    };
}