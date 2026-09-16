import { error } from '@sveltejs/kit';
import { getRails } from '$lib/api/tg4_1';

export async function load({ params }) {
    const data = await getRails();

    const liveRail = data.rails?.find(
        (rail: any) => rail.type === 'LIVE'
    );

    const item = liveRail?.items?.find(
        (item: any) =>
            item.type === 'LIVE_STREAM' &&
            item.stream?.stream === params.channel
    );

    if (!item?.stream) {
        throw error(404, 'Live channel not found');
    }

    return {
        lang: params.lang,
        channel: params.channel,
        stream: item.stream
    };
}