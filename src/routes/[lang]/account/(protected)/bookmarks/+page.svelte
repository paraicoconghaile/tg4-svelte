```svelte
<script lang="ts">
    let { data } = $props();

    const isIrish = $derived(data.lang === 'ga');
</script>

<svelte:head>
    <title>{isIrish ? 'Mo Leabharmharcanna' : 'My Bookmarks'} | TG4</title>
</svelte:head>

<section class="bookmarks">
    <h1>{isIrish ? 'Mo Leabharmharcanna' : 'My Bookmarks'}</h1>

    {#if data.error}
        <p class="message">{data.error}</p>
    {:else if data.bookmarks?.length}
        <div class="bookmarks-grid">
            {#each data.bookmarks as bookmark (bookmark.bookmarkId)}
                <article class="bookmark">
                    <div class="bookmark-image">
                        <img
                            src={bookmark.video?.image?.large
                                ?? bookmark.video?.image?.original
                                ?? bookmark.video?.poster}
                            alt={bookmark.video?.displayName ?? ''}
                            loading="lazy"
                        />
                    </div>

                    <div class="bookmark-info">
                        <h2>{bookmark.video?.displayName ?? ''}</h2>

                        <p>
                            {isIrish
                                ? bookmark.video?.descriptionGa
                                : bookmark.video?.descriptionEn}
                        </p>
                    </div>
                </article>
            {/each}
        </div>
    {:else}
        <p class="message">
            {isIrish
                ? 'Níl aon leabharmharcanna agat fós.'
                : 'You have no bookmarks yet.'}
        </p>
    {/if}
</section>

<style>
.bookmarks {
    width: 100%;
}

h1 {
    margin: 0 0 2rem;
}

.bookmarks-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.5rem;
}

.bookmark {
    min-width: 0;
}

.bookmark-image {
    aspect-ratio: 16 / 9;
    overflow: hidden;
    border-radius: 8px;
}

.bookmark-image img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.bookmark-info h2 {
    margin: 0.75rem 0 0.5rem;
    font-size: 1.1rem;
}

.bookmark-info p {
    margin: 0;
    line-height: 1.5;
}

.message {
    margin: 1rem 0;
}

@media (max-width: 900px) {
    .bookmarks-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (max-width: 600px) {
    .bookmarks-grid {
        grid-template-columns: 1fr;
    }
}
</style>