import { redirect } from '@sveltejs/kit';

export function load({ params }) {
    // If slug exists → redirect to new structure
    if (params.slug) {
        throw redirect(
            301,
            `/${params.lang}/player/${params.section}/${params.slug}`
        );
    }

    // If only category page → redirect to clean category route
    throw redirect(
        301,
        `/${params.lang}/player/${params.section}`
    );
}