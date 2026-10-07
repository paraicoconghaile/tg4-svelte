import { getRails, getContinueWatching } from '$lib/api/tg4_1';

export const load: PageServerLoad = async ({ params, cookies }) => {

    //console.log('Homepage cookies:', cookies.getAll());

    const peachSid = cookies.get('identity.provider.sid');

    //console.log('Peach SID:', peachSid ? 'FOUND' : 'NOT FOUND');

    const rails = await getRails();

    // temporarily don't call Continue Watching yet

    return {
        lang: params.lang,
        rails
    };
};