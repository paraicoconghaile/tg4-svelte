<script lang="ts">
    let {
        title,
        description,
        canonicalUrl,
        imageUrl,
        lang = 'en'
    }: {
        title: string;
        description: string;
        canonicalUrl: string;
        imageUrl: string;
        lang?: string;
    } = $props();

    const locale = $derived(lang === 'ga' ? 'ga_IE' : 'en_IE');
</script>

<svelte:head>
    <title>{title}</title>

    <meta name="description" content={description} />

    <link rel="canonical" href={canonicalUrl} />

    <meta property="og:locale" content={locale} />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="TG4" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonicalUrl} />
    <meta property="og:image" content={imageUrl} />
    <meta property="og:image:width" content="640" />
    <meta property="og:image:height" content="360" />
    <meta property="article:publisher" content="https://www.facebook.com/TG4TV" />
    <meta property="fb:app_id" content="200713837721888" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={imageUrl} />
    <meta name="twitter:site" content="@TG4TV" />
</svelte:head>