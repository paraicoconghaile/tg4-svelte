const baseUrl = 'https://www.tg4.ie';

export function getWebsiteSchema(lang: string) {
    const isIrish = lang === 'ga';

    return {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'Organization',
                '@id': `${baseUrl}/#organization`,
                name: 'TG4',
                url: baseUrl,
                sameAs: [
                    'https://www.facebook.com/TG4TV'
                ]
            },
            {
                '@type': 'WebSite',
                '@id': `${baseUrl}/#website`,
                name: 'TG4',
                url: baseUrl,
                inLanguage: ['ga', 'en'],
                publisher: {
                    '@id': `${baseUrl}/#organization`
                }
            },
            {
                '@type': 'WebPage',
                '@id': `${baseUrl}/${lang}#webpage`,
                url: `${baseUrl}/${lang}`,
                name: isIrish
                    ? 'TG4 | Teilifís Gaeilge'
                    : 'TG4 | Irish Language Television',
                description: isIrish
                    ? 'Féach ar chláir TG4, sraitheanna, cláir faisnéise, spórt agus siamsaíocht ar líne ar Sheinnteoir TG4.'
                    : 'Watch TG4 programmes, series, documentaries, sport and entertainment online on the TG4 Player.',
                inLanguage: lang,
                isPartOf: {
                    '@id': `${baseUrl}/#website`
                }
            }
        ]
    };
}