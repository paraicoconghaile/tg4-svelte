import { goto } from '$app/navigation';
import { loadPeachUser } from './peach';
import { getAccountPath } from '$lib/utils/accountRoutes';

export async function requireAuthentication(lang: string) {
    const pu = await loadPeachUser();

    let authorized = false;

    try {
        authorized = (await pu.isAuthorized()) === true;
    } catch (err) {
        console.warn('Peach authentication check failed:', err);
    }

    if (!authorized) {
        await goto(getAccountPath(lang, 'login'), {
            replaceState: true
        });

        return null;
    }

    return pu;
}