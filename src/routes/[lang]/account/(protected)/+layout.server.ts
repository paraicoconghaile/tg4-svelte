export function load({ setHeaders }) {
    setHeaders({
        'Cache-Control': 'private, no-store'
    });

    return {};
}