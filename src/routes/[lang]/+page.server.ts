import { getRails, getContinueWatching } from '$lib/api/tg4_1';

export async function load({ params, cookies }) {
    const rails = await getRails();
    const peachSid = cookies.get('identity.provider.sid');

    let continueWatching = [];
    if (peachSid) {
        const continueWatching = await getContinueWatching(peachSid);

        const continueWatchingRail = rails.rails.find(
            (rail) => rail.type === 'CONTINUE_WATCHING'
        );

        if (continueWatchingRail) {
            continueWatchingRail.items = continueWatching;
        }
    }

    return {
        lang: params.lang,
        rails
    };
}