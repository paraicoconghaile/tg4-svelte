import { navigation, type NavItem } from '$lib/config/siteNav';

const baseUrl = 'https://www.tg4.ie';

export function getAlternateUrls(pathname: string) {
    const normalize = (path: string) =>
        path.replace(/\/+$/, '').toLowerCase();

    function findItem(items: NavItem[]): NavItem | undefined {
        for (const item of items) {
            if (
                (item.hrefEn && normalize(item.hrefEn) === normalize(pathname)) ||
                (item.hrefGa && normalize(item.hrefGa) === normalize(pathname))
            ) {
                return item;
            }

            if (item.children) {
                const match = findItem(item.children);

                if (match) return match;
            }
        }

        return undefined;
    }

    const item = findItem(navigation);

    if (!item?.hrefEn || !item?.hrefGa) {
        return null;
    }

    return {
        alternateGaUrl: `${baseUrl}${item.hrefGa}/`,
        alternateEnUrl: `${baseUrl}${item.hrefEn}/`
    };
}