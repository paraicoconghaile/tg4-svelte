import { withBase } from '$lib/utils/paths';

const accountRoutes = {
    en: {
        account: 'account',
        profile: 'profile',
        preferences: 'preferences',
        bookmarks: 'bookmarks',
        history: 'history',
        login: 'login',
        signup: 'sign-up',
        forgotPassword: 'forgot-password',
        deleteAccount: 'delete-account'
    },
    ga: {
        account: 'cuntas',
        profile: 'proifil',
        preferences: 'sainroghanna',
        bookmarks: 'leabharmharcanna',
        history: 'stair-feachana',
        login: 'logail-isteach',
        signup: 'claraigh',
        forgotPassword: 'pasfhocal-dearmadta',
        deleteAccount: 'scrios-cuntas'
    }
} as const;

export type AccountPage = keyof typeof accountRoutes.en;

export function getAccountPath(lang: string, page: AccountPage) {
    const locale = lang === 'ga' ? 'ga' : 'en';
    const section = locale === 'ga' ? 'cuntas' : 'account';

    return withBase(`/${locale}/${section}/${accountRoutes[locale][page]}`);
}