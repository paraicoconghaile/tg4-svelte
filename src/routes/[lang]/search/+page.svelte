<script lang="ts">
    let { data } = $props();

    const isIrish = $derived(data.lang === 'ga');

    //console.log('Search Data:', data);
</script>

<svelte:head>
    <title>
        {isIrish ? 'Cuardach' : 'Search'}{data.query ? ` - ${data.query}` : ''}
    </title>
</svelte:head>

<section class="search-page">
    <section class="episodes">
        <h1>{isIrish ? 'Cuardach' : 'Search'}</h1>

        {#if data.query}
            <p class="search-query">
                {isIrish ? 'Torthaí do' : 'Results for'}:
                <strong>{data.query}</strong>
            </p>
        {/if}

        {#if data.results.length === 0}
            <p>
                {isIrish
                    ? 'Níor aimsíodh aon torthaí.'
                    : 'No results found.'}
            </p>
        {:else}
            <div class="search-results">
                {#each data.results as result}
                    {#if result.type === 'VIDEO'}
                        <article class="search-result">
                            <img
                                src={result.video.image.large}
                                alt={result.video.displayName}
                            />

                            <div>
                                <h2>{result.video.displayName}</h2>

                                {#if result.video.customFields?.seriestitle}
                                    <p class="series">
                                        {result.video.customFields.seriestitle}
                                    </p>
                                {/if}

                                <p>
                                    {isIrish
                                        ? result.video.descriptionGa
                                        : result.video.descriptionEn}
                                </p>
                            </div>
                        </article>
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
}

.search-page h1 {
    margin-bottom: 10px;
}

.search-query {
    margin-bottom: 30px;
}

.search-results {
    display: grid;
    gap: 20px;
}

.search-result {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 20px;
}

.search-result img {
    width: 100%;
    display: block;
}

.search-result h2 {
    margin: 0 0 8px;
}

.search-result .series {
    font-weight: 700;
}
</style>

<!-- <pre>
    {JSON.stringify(data, null, 2)}
</pre> -->