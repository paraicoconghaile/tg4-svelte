import type { Handle } from '@sveltejs/kit';

const COOKIE_NAME = 'tg4-region';
const COOKIE_MAX_AGE_SECONDS = 60 * 60;
const API_TIMEOUT_MS = 2000;

type Region = 'IOI' | 'WW';

const FALLBACK_REGION: Region = 'WW';

function isRegion(value: unknown): value is Region {
    return value === 'IOI' || value === 'WW';
}

export const geoCookieHandle: Handle = async ({ event, resolve }) => {
    // Check for an existing region cookie
    const cachedRegion = event.cookies.get(COOKIE_NAME);

    if (isRegion(cachedRegion)) {
        event.locals.region = cachedRegion;
        return resolve(event);
    }

    try {
        // Header supplied by our CloudFront Function
        const clientIp = event.request.headers.get('x-tg4-client-ip');

        console.log('*** TG4 REGION LOOKUP ***', {path: event.url.pathname, hasClientIp: Boolean(clientIp)});

        if (!clientIp) {
            throw new Error('Client IP unavailable');
        }

        const response = await event.fetch(
            'https://api.tg4dev.com/api/region',
            {
                headers: {
                    'X-TG4-IP': clientIp
                },
                signal: AbortSignal.timeout(API_TIMEOUT_MS)
            }
        );

        if (!response.ok) {
            throw new Error(`Region API returned ${response.status}`);
        }

        const data = await response.json();

        if (!isRegion(data.region)) {
            throw new Error('Invalid region returned by API');
        }

        event.locals.region = data.region;

        event.cookies.set(COOKIE_NAME, data.region, {
            path: '/',
            httpOnly: true,
            secure: !import.meta.env.DEV,
            sameSite: 'lax',
            maxAge: COOKIE_MAX_AGE_SECONDS
        });

        console.log('*** REGION RESOLVED ***', data.region);

    } catch (error) {
        if (!import.meta.env.DEV) {
            console.warn(
                'Region lookup failed, using fallback:',
                error instanceof Error ? error.message : error
            );
        }

        event.locals.region = FALLBACK_REGION;
    }

    console.log('*** TG4 ACTIVE REGION ***', event.locals.region);

    return resolve(event);
};