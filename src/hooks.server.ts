import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    const pathname = event.url.pathname;

    const lang = /^\/ga(?:\/|$)/.test(pathname) ? 'ga' : 'en';

    return resolve(event, {
        transformPageChunk: ({ html }) => {
            return html.replace('%lang%', lang);
        }
    });
};