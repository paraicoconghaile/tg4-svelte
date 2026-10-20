<script lang="ts">
    import { withBase } from '$lib/utils/paths';

    let { data } = $props();

    const isIrish = $derived(data.lang === 'ga');
</script>

<svelte:head>
    <title>{isIrish ? 'Mo Leabharmharcanna' : 'My Bookmarks'} | TG4</title>
</svelte:head>

<section class="account-page-content">
    <div class="bookmarks">
        <p class="frmTitle">{isIrish ? 'Mo Leabharmharcanna' : 'My Bookmarks'}</p>

        {#if data.error}
            <p class="message">{data.error}</p>
        {:else if data.bookmarks?.length}
            <div class="bookmarks-grid">
                {#each data.bookmarks as bookmark (bookmark.bookmarkId)}
                    {#if bookmark.type === 'SERIES' && bookmark.series}
                        <a
                            class="bookmark-card"
                            href={withBase(`/${data.lang}/player/${bookmark.series.slug}`)}
                        >
                            <img
                                src={bookmark.series.mainImage?.large
                                    ?? bookmark.series.mainImage?.original
                                    ?? bookmark.series.poster}
                                alt={bookmark.series.name ?? ''}
                                loading="lazy"
                                onerror={(e) => {
                                    e.currentTarget.src = 'https://res.cloudinary.com/tg4/image/upload/w_700,h_395,g_faces,c_fill,f_auto,q_auto/000000.jpg';
                                }}
                            />
                            <h3>{bookmark.series.name}</h3>
                        </a>

                    {:else if bookmark.type === 'VIDEO' && bookmark.video}
                        <a
                            class="bookmark-card"
                            href={withBase(`/${data.lang}/player/${bookmark.video.vid}`)}
                        >
                            <img
                                src={bookmark.video.image?.large
                                    ?? bookmark.video.image?.original
                                    ?? bookmark.video.poster}
                                alt={bookmark.video.displayTitle ?? ''}
                                loading="lazy"
                                onerror={(e) => {
                                    e.currentTarget.src = 'https://res.cloudinary.com/tg4/image/upload/w_700,h_395,g_faces,c_fill,f_auto,q_auto/000000.jpg';
                                }}
                            />
                            <h3>{bookmark.video.displayTitle ?? ''}</h3>
                        </a>
                    {/if}
                {/each}
            </div>
            <div class="bookmarks-pagination">
                {#if data.page > 1}
                    <a href={`?page=${data.page - 1}`} class="pagination-link">
                        {isIrish ? 'Roimhe Seo' : 'Previous'}
                    </a>
                {/if}

                <span>
                    {isIrish ? 'Leathanach' : 'Page'} {data.page}
                </span>

                {#if data.hasMore}
                    <a href={`?page=${data.page + 1}`} class="pagination-link">
                        {isIrish ? 'Ar Aghaidh' : 'Next'}
                    </a>
                {/if}
            </div>
        {:else}
            <p class="message">{isIrish ? 'Níl aon leabharmharcanna agat fós.' : 'You have no bookmarks yet.'}</p>
        {/if}
    </div>
</section>

<style>
.bookmarks {
    width: 100%;
}

.bookmarks-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 6px;
}

.bookmark-card {
    text-decoration: none;
    color: var(--text-primary);
}

.bookmark-card img  {
    width: 100%;
    aspect-ratio: 16 / 9;
    overflow: hidden;
    border-radius: 0px;
}

.bookmark-card h3 {
    margin-top: 12px;
    font-size: 1.1rem;
}

.bookmark-info p {
    margin: 0;
    line-height: 1.5;
}

.bookmarks-pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 24px;
    margin-top: 32px;
}

.pagination-link {
    color: var(--text-primary);
    text-decoration: none;
    padding: 10px 16px;
    border: 1px solid var(--text-primary);
}

.pagination-link:hover {
    opacity: 0.7;
}

@media(max-width:1000px){
    .bookmarks-grid {
        grid-template-columns: repeat(3,1fr);
    }
}

@media(max-width:900px){
    .bookmarks-grid {
        grid-template-columns: repeat(2,1fr);
    }
}

@media(max-width:450px){
    .bookmarks-grid {
        grid-template-columns: 1fr;
    }
}
</style>

<!-- <pre>
    {JSON.stringify(data, null, 2)}
</pre> -->