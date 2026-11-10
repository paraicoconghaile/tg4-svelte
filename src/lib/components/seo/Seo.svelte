<script lang="ts">
    let {
        title,
        description,
        canonicalUrl,
        imageUrl,
        lang = 'en',
        alternateGaUrl,
        alternateEnUrl
    }: {
        title: string;
        description: string;
        canonicalUrl: string;
        imageUrl?: string;
        lang?: string;
        alternateGaUrl?: string;
        alternateEnUrl?: string;
    } = $props();

    const locale = $derived(lang === 'ga' ? 'ga_IE' : 'en_IE');
</script>

<svelte:head>
    <title>{title}</title>

    {#if alternateGaUrl && alternateEnUrl}
        <link rel="alternate" hreflang="ga-IE" href={alternateGaUrl} />
        <link rel="alternate" hreflang="en-IE" href={alternateEnUrl} />
    {/if}

    <meta name="description" content={description} />

    <link rel="canonical" href={canonicalUrl} />

    <meta property="og:locale" content={locale} />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="TG4" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonicalUrl} />
    {#if imageUrl}
        <meta property="og:image" content={imageUrl} />
        <meta property="og:image:width" content="640" />
        <meta property="og:image:height" content="360" />
    {/if}
    <meta property="article:publisher" content="https://www.facebook.com/TG4TV" />
    <meta property="fb:app_id" content="200713837721888" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    {#if imageUrl}
        <meta name="twitter:image" content={imageUrl} />
    {/if}
    <meta name="twitter:site" content="@TG4TV" />
</svelte:head>