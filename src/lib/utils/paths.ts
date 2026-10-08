import { base } from '$app/paths';

export function withBase(path: string): string {
    return `${base}${path}`;
}

export function stripBase(pathname: string): string {
    if (!base) {
        return pathname;
    }

    if (pathname === base) {
        return '/';
    }

    if (pathname.startsWith(`${base}/`)) {
        return pathname.slice(base.length);
    }

    return pathname;
}