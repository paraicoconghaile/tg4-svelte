const baseUrl = 'https://www.tg4.ie';

interface CategorySchemaOptions {
    lang: string;
    section: string;
    title: string;
    description: string;
    discoverSlug: string;
}

export function getCategorySchema({
    lang,
    section,
    title,
    description,
    discoverSlug
}: CategorySchemaOptions) {
    const isIrish = lang === 'ga';
    const url = `${baseUrl}/${lang}/player/${section}/`;

    const isDiscover = section === discoverSlug;

    const breadcrumbs = [
        {
            '@type': 'ListItem',
            position: 1,
            name: isIrish ? 'Baile' : 'Home',
            item: `${baseUrl}/${lang}`
        }
    ];

    if (!isDiscover) {
        breadcrumbs.push({
            '@type': 'ListItem',
            position: 2,
            name: isIrish ? 'Aimsigh' : 'Discover',
            item: `${baseUrl}/${lang}/player/${discoverSlug}/`
        });
    }

    breadcrumbs.push({
        '@type': 'ListItem',
        position: breadcrumbs.length + 1,
        name: title,
        item: url
    });

    return {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'CollectionPage',
                '@id': `${url}#webpage`,
                url,
                name: `${title} | TG4`,
                description,
                inLanguage: lang,
                isPartOf: {
                    '@id': `${baseUrl}/#website`
                },
                publisher: {
                    '@id': `${baseUrl}/#organization`
                }
            },
            {
                '@type': 'BreadcrumbList',
                '@id': `${url}#breadcrumb`,
                itemListElement: breadcrumbs
            }
        ]
    };
}