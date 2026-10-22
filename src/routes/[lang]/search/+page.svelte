<script lang="ts">
    import { withBase } from '$lib/utils/paths';

    let { data } = $props();

    const isIrish = $derived(data.lang === 'ga');

    const collection = $derived(data.collection);
    const results = $derived(data.results ?? []);
</script>

<svelte:head>
    <title>
        {isIrish ? 'Cuardach' : 'Search'}
    </title>
</svelte:head>

<section class="search-page">
    <section class="episodes">
        <header class="search-header">
            <h1>{isIrish ? collection.titleGa : collection.titleEn}</h1>

            <p class="subtitle">{isIrish ? collection.subtitleGa : collection.subtitleEn}</p>
        </header>

        {#if results.length === 0}
            <p>{isIrish ? 'Níor aimsíodh aon torthaí.' : 'No results found.'}</p>
        {:else}
            <div class="search-results">
                {#each results as result, i (`${result.type}-${result.video?.vid ?? result.series?.id ?? i}`)}
                    {@const item = result.type === 'VIDEO'
                        ? result.video
                        : result.series}

                    {#if item}
                        <a
                            class="search-card"
                            href={result.type === 'VIDEO'
                                ? withBase(`/${data.lang}/player/${item.vid}`)
                                : withBase(`/${data.lang}/player/${item.slug}`)}
                        >
                            <img
                                src={result.type === 'VIDEO'
                                    ? item.image?.large
                                    : item.mainImage?.large}
                                alt={result.type === 'VIDEO'
                                    ? item.image?.altTextEn ?? item.displayTitle ?? ''
                                    : item.mainImage?.altTextEn ?? item.name ?? ''}
                                loading="lazy"
                            />

                            <div class="card-content">
                                {#if result.type === 'VIDEO'}
                                    {#if item.seriesTitle === item.displayTitle}
                                        <h3>{item.seriesTitle}</h3>
                                        <p>
                                            {#if item.seasonNumber}
                                                S{item.seasonNumber}
                                            {/if}
                                            {#if item.episodeNumber}
                                                E{item.episodeNumber}
                                            {/if}
                                        </p>
                                    {:else}
                                        <h3>{item.seriesTitle}</h3>
                                        <p>
                                            {#if item.seasonNumber}
                                                S{item.seasonNumber}
                                            {/if}
                                            {#if item.episodeNumber}
                                                E{item.episodeNumber}
                                            {/if}
                                            {#if item.displayTitle}
                                                : {item.displayTitle}
                                            {/if}
                                        </p>
                                    {/if}
                                {:else}
                                    <h3>{item.name}</h3>
                                {/if}

                                <!-- {#if item.contentRating}
                                    <span class="rating">
                                        {item.contentRating}
                                    </span>
                                {/if} -->
                            </div>
                        </a>
                    {/if}
                {/each}
            </div>
        {/if}
    </section>
</section>

<style>
.search-page {
    max-width: var(--page-width);
    margin: 0 auto;
    padding: 20px;
    background-color: var(--genre-background);
    min-height: 70vh;
}

.search-header {
    margin-bottom: 28px;
}

.search-header h1 {
    margin-bottom: 10px;
}

.subtitle {
    font-size: 1rem;
}

.search-results {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 24px 16px;
}

.search-card {
    display: block;
    color: inherit;
    text-decoration: none;
    min-width: 0;
}

.search-card img {
    display: block;
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
    border-radius: 4px;
}

.card-content h3 {
    font-size: 1.2rem;
    margin: 15px 0 0;
}

.card-content p {
    margin: 0;
    font-size: 1rem;
}

.rating {
    display: inline-block;
    font-size: 0.75rem;
    padding: 3px 6px;
    border: 1px solid currentColor;
    border-radius: 3px;
}

.search-card:hover h3 {
}

@media (max-width: 1000px) {
    .search-results {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
}

@media (max-width: 700px) {
    .search-results {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 20px 12px;
    }
}

@media (max-width: 400px) {
    .search-results {
        grid-template-columns: 1fr;
    }
}
</style>

<!-- <pre>
    {JSON.stringify(data, null, 2)}
</pre> -->