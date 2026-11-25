/* import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    const pathname = event.url.pathname;

    const lang = /^\/ga(?:\/|$)/.test(pathname) ? 'ga' : 'en';

    return resolve(event, {
        transformPageChunk: ({ html }) => {
            return html.replace('%lang%', lang);
        }
    });
}; */

import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { geoCookieHandle } from '$lib/server/geoCookie';

const languageHandle: Handle = async ({ event, resolve }) => {
    const pathname = event.url.pathname;

    const lang = /^\/ga(?:\/|$)/.test(pathname) ? 'ga' : 'en';

    return resolve(event, {
        transformPageChunk: ({ html }) => {
            return html.replace('%lang%', lang);
        }
    });
};

export const handle = sequence(geoCookieHandle, languageHandle);