import { goto } from '$app/navigation';
import { loadPeachUser } from './peach';

export async function requireAuthentication(lang: string) {
    const pu = await loadPeachUser();

    // Check whether Peach considers the user authenticated
    try {
        await pu.isAuthorized();
    } catch {
        await goto(`/${lang}/account/login`);
        return null;
    }

    return pu;
}