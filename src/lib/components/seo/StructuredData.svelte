<script lang="ts">
    let {
        series,
        lang = 'en'
    } = $props();

    const baseUrl = 'https://www.tg4.ie';

    let programme = $derived(series.series);

    let schema = $derived({
        '@context': 'https://schema.org',
        '@type': 'TVSeries',

        name: programme.name,

        description: lang === 'ga'
            ? programme.descGa
            : programme.descEn,

        inLanguage: lang === 'ga' ? 'ga' : 'en',

        url: `${baseUrl}/${lang}/player/${programme.slug}`,

        image: programme.mainImage?.large
            ?? programme.poster,

        identifier: programme.sCode,

        contentRating: programme.contentRating,

        genre: series.categories?.map(
            (category) => lang === 'ga'
                ? category.displayGa
                : category.displayEn
        ),

        publisher: {
            '@type': 'Organization',
            name: 'TG4',
            url: baseUrl
        }
    });

    let jsonLd = $derived(
        JSON.stringify(schema).replace(/</g, '\\u003c')
    );
</script>

<svelte:head>
    {@html `<script type="application/ld+json">${jsonLd}</script>`}
</svelte:head>