import { error } from '@sveltejs/kit';

const validChannels = new Set([
    'TG4',
    'TG4PLUSONE',
    'CULA4',
    'ONDEMAND'
]);

export async function load({ params, setHeaders }) {
    if (!validChannels.has(params.channel)) {
        throw error(404, 'Live channel not found');
    }

    setHeaders({
        'cache-control': 'public, max-age=0, s-maxage=900'
    });

    return {
        lang: params.lang,
        channel: params.channel
    };
}