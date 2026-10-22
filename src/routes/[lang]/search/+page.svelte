
<script lang="ts">
    import { withBase } from '$lib/utils/paths';
    import { searchAdvanced } from '$lib/api/search';

    let { data } = $props();

    const isIrish = $derived(data.lang === 'ga');
    const collection = $derived(data.collection);

    let searchText = $state('');
    let results = $state(data.results ?? []);
    let loading = $state(false);
    let searchError = $state('');

    $effect(() => {
        const query = searchText.trim();
        let cancelled = false;

        if (!query) {
            results = data.results ?? [];
            loading = false;
            searchError = '';
            return;
        }

        loading = true;
        searchError = '';

        const timer = setTimeout(async () => {
            try {
                const response = await searchAdvanced(fetch, {
                    query
                });

                if (!cancelled) {
                    results = response.results ?? [];
                }
            } catch (err) {
                if (!cancelled) {
                    console.error('Search failed:', err);
                    searchError = isIrish
                        ? 'Níorbh fhéidir an cuardach a dhéanamh.'
                        : 'Unable to perform search.';
                }
            } finally {
                if (!cancelled) {
                    loading = false;
                }
            }
        }, 300);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    });
</script>

<svelte:head>
    <title>
        {isIrish ? 'Cuardach' : 'Search'}
    </title>
</svelte:head>

<section class="search-page">
    <section class="episodes">
        <div class="search-input-wrapper">
            <!-- <label for="search-input">
                {isIrish ? 'Cuardaigh cláir' : 'Search programmes'}
            </label> -->

            <div class="search-input">
                <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-4-4" />
                </svg>

                <input
                    id="search-input"
                    type="search"
                    bind:value={searchText}
                    placeholder={isIrish
                        ? 'Cuardaigh cláir agus físeáin...'
                        : 'Search programmes and videos...'}
                    autocomplete="off"
                />
            </div>
        </div>

        <header class="search-header">
            {#if searchText.trim()}
                <h1>{isIrish ? 'Torthaí cuardaigh' : 'Search results'}</h1>
            {:else}
                <h1>{isIrish ? collection.titleGa : collection.titleEn}</h1>
                <p class="subtitle">
                    {isIrish ? collection.subtitleGa : collection.subtitleEn}
                </p>
            {/if}
        </header>

        {#if loading}
            <p class="search-status" role="status">
                {isIrish ? 'Ag cuardach...' : 'Searching...'}
            </p>
        {:else if searchError}
            <p class="search-status" role="alert">
                {searchError}
            </p>
        {:else if results.length === 0}
            <p>
                {isIrish
                    ? 'Níor aimsíodh aon torthaí.'
                    : 'No results found.'}
            </p>
        {:else}
            <!-- Keep your existing search-results grid here -->
        {/if}

        {#if results.length === 0}
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

.search-input-wrapper {
    margin-bottom: 28px;
}

.search-input-wrapper label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
}

.search-input {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 16px;
    border: 1px solid #888;
    border-radius: 6px;
    background: var(--background, #fff);
    color: var(--foreground, #222);
}

.search-input:focus-within {
    outline: 2px solid currentColor;
    outline-offset: 2px;
}

.search-input input {
    width: 100%;
    min-width: 0;
    padding: 14px 0;
    border: 0;
    outline: none;
    background: transparent;
    color: inherit;
    font: inherit;
}

.search-status {
    margin: 20px 0;
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