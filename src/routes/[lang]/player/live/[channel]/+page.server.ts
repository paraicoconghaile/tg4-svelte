import { error } from '@sveltejs/kit';
import { getCurrentEPG } from '$lib/api/tg4_1';

export async function load({ params }) {
    setHeaders({
        'cache-control': 'public, max-age=0, s-maxage=60'
    });
    
    const data = await getCurrentEPG();

    const stream = data.streams?.find(
        (stream: any) =>
            stream.stream === params.channel
    );

    if (!stream) {
        throw error(404, 'Live channel not found');
    }

    return {
        lang: params.lang,
        channel: params.channel,
        stream,
        liveStreams: data.streams
    };
}