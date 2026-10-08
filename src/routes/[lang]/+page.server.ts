import { getRails, getContinueWatching } from '$lib/api/tg4_1';

export const load: PageServerLoad = async ({ params, cookies }) => {
    console.log('Homepage cookies:', cookies.getAll());

    const peachSid = cookies.get('identity.provider.sid');
    //const peachSid = '89b401df-38f4-4142-ad2e-b4f6a2a2564e';
    //console.log('Peach SID:', peachSid ? 'FOUND' : 'NOT FOUND');

    const rails = await getRails();
    //console.log('Rails loaded');

    try {
        const continueWatching = await getContinueWatching(peachSid);

        //console.log('Continue Watching returned:', continueWatching?.length);

        const continueWatchingRail = rails.rails.find(
            (rail) => rail.type === 'CONTINUE_WATCHING'
        );

        if (continueWatchingRail) {
            continueWatchingRail.items = continueWatching;

            //console.log('Continue Watching rail populated:', continueWatchingRail.items.length);
        }
    } catch (error) {
        //console.error('CONTINUE WATCHING FAILED:', error);
    }

    return {
        lang: params.lang,
        rails
    };
};