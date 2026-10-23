<script lang="ts">
    /* import { withBase } from '$lib/utils/paths';

    let { data } = $props();

    let isIrish = $derived(data.lang === 'ga');
    let item = $derived(data.luckyDip);

    let isSeries = $derived(item?.type === 'SERIES');

    // VIDEO fields are at the top level in the Lucky Dip response.
    let title = $derived(
        isSeries
            ? (item.series?.seriesTitle ?? item.series?.name ?? item.displayName ?? '')
            : (item.displayName ?? item.video?.customFields?.title ?? item.name ?? '')
    );

    let description = $derived(
        isIrish
            ? (item.video?.descriptionGa ?? item.series?.descriptionGa ?? item.descriptionGa ?? '')
            : (item.video?.descriptionEn ?? item.series?.descriptionEn ?? item.descriptionEng ?? '')
    );

    let image = $derived(
        isSeries
            ? (item.series?.mainImage?.large ?? item.series?.image?.large ?? item.image?.large ?? '')
            : (item.image?.large ?? item.poster ?? item.video?.image?.large ?? '')
    );

    let subtitles = $derived(isSeries ? (item.series?.subtitles ?? '') : (item.video?.subtitles ?? ''));
    
    let contentRating = $derived(isSeries ? (item.series?.contentRating ?? '') : (item.video?.contentRating ?? ''));

    let playerUrl = $derived(
        isSeries
            ? withBase(`/${data.lang}/player/${item.series?.slug ?? item.slug ?? ''}`)
            : withBase(`/${data.lang}/player/${item.video?.vid ?? item.video?.videoId ?? item.videoId ?? item.id ?? ''}`)
    );

    const subtitleLanguages: Record<string, Record<string, string>> = {
        en: {
            en: 'English',
            ga: 'Irish'
        }, ga: {
            en: 'Béarla',
            ga: 'Gaeilge'
        }
    };

    function getLanguageName(code: string, lang: string) {
        return subtitleLanguages[lang]?.[code] ?? code;
    } */

    import { onMount } from 'svelte';
    import { luckyDip } from '$lib/stores/luckyDip';
    import { withBase } from '$lib/utils/paths';

    let { data } = $props();

    let isIrish = $derived(data.lang === 'ga');
    let item = $state<Record<string, any> | null>(null);
    let isLoading = $state(true);
    let loadError = $state('');

    let isSeries = $derived(item?.type === 'SERIES');

    let title = $derived(
        isSeries
            ? (item?.series?.seriesTitle ?? item?.series?.name ?? item?.displayName ?? '')
            : (item?.displayName ?? item?.video?.customFields?.title ?? item?.name ?? '')
    );

    let description = $derived(
        isIrish
            ? (item?.video?.descriptionGa ?? item?.series?.descriptionGa ?? item?.descriptionGa ?? '')
            : (item?.video?.descriptionEn ?? item?.series?.descriptionEn ?? item?.descriptionEng ?? '')
    );

    let image = $derived(
        isSeries
            ? (item?.series?.mainImage?.large ?? item?.series?.image?.large ?? item?.image?.large ?? '')
            : (item?.image?.large ?? item?.poster ?? item?.video?.image?.large ?? '')
    );

    let subtitles = $derived(
        isSeries ? (item?.series?.subtitles ?? '') : (item?.video?.subtitles ?? '')
    );

    let contentRating = $derived(
        isSeries ? (item?.series?.contentRating ?? '') : (item?.video?.contentRating ?? '')
    );

    let playerUrl = $derived(
        isSeries
            ? withBase(`/${data.lang}/player/${item?.series?.slug ?? item?.slug ?? ''}`)
            : withBase(`/${data.lang}/player/${item?.video?.vid ?? item?.video?.videoId ?? item?.videoId ?? item?.id ?? ''}`)
    );

    const subtitleLanguages: Record<string, Record<string, string>> = {
        en: {
            en: 'English',
            ga: 'Irish'
        },
        ga: {
            en: 'Béarla',
            ga: 'Gaeilge'
        }
    };

    function getLanguageName(code: string, lang: string) {
        return subtitleLanguages[lang]?.[code] ?? code;
    }
    
    onMount(async () => {
        const params = new URLSearchParams(window.location.search);
        const forceNew = params.get('new') === 'true';
        const cached = $luckyDip;

        if (cached && !forceNew) {
            item = cached;
            isLoading = false;
            return;
        }

        try {
            const response = await fetch(withBase('/api/lucky-dip'));

            if (!response.ok) {
                throw new Error(`Lucky Dip request failed: ${response.status}`);
            }

            const result = await response.json();

            luckyDip.set(result);
            item = result;

            // Remove the flag so switching languages reuses this recommendation.
            if (forceNew) {
                const url = new URL(window.location.href);
                url.searchParams.delete('new');
                window.history.replaceState({}, '', url);
            }
        } catch (error) {
            console.error('Unable to load Lucky Dip:', error);
            loadError = 'Unable to load Lucky Dip. Please try again.';
        } finally {
            isLoading = false;
        }
    });
</script>

<svelte:head>
    <title>{title ?? (isIrish ? 'Léim Ádhúil' : 'Lucky Dip')} | TG4</title>
    <meta name="description" content={description} />
</svelte:head>

<section class="episode-page">
    <!-- Hero -->
    <section class="episode-hero">
        {#if image}
            <img class="hero-image" src={image} alt={title} />
        {/if}
        
        <div class="hero-overlay">
            <div class="hero-content">
                <p class="eyebrow">{isIrish ? 'Léim Ádhúil' : 'Lucky Dip'}</p>

                <h1>{title ?? (isIrish ? 'Clár molta' : 'Recommended programme')}</h1>

                {#if description}
                    <p class="hero-description">{description}</p>
                {/if}

                <p>
                    {#each subtitles as subtitle}
                        <!-- <span class="subtitles-icon" title="Subtitles">CC</span> -->
                        <span class="languages">{getLanguageName(subtitle, data.lang)}</span>
                    {/each}
                    {#if contentRating}
                        <span class="content-rating">{contentRating}</span>
                    {/if}
                </p>

                <div class="hero-buttons">
                    <div class="hero-button">
                        <a aria-label={isIrish ? 'Féach' : 'Watch Now'} class="hero-button-icon" href={playerUrl}>
                            <svg width="20" height="29" viewBox="0 0 20 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19.6164 14.3439L14.903 9.79771L0.020813 24.1602L4.73281 28.7076L19.6164 14.3439Z" fill="#2B2A2A"/>
                                <path d="M14.8835 18.9111L19.5942 14.3624L4.712 0L0 4.54743L14.8835 18.9111Z" fill="#2B2A2A"/>
                            </svg>
                        </a>

                        {#if playerUrl}
                            <a class="hero-button-text" href={playerUrl}>
                                {data.lang === 'ga' ? 'Féach' : 'Watch now'}
                            </a>
                        {/if}
                    </div>
                </div>
            </div>
        </div>
    </section>

    {#if description}
        <div class="mobile-description">
            <p>{description}</p>
        </div>
    {/if}
</section>

<style>
.eyebrow {
    color: #ff126c;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
}
</style>

<pre>
{JSON.stringify(data.luckyDip, null, 2)}
</pre>