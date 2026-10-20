<script lang="ts">
    import { withBase } from '$lib/utils/paths';

    let { data } = $props();

    const isIrish = $derived(data.lang === 'ga');
</script>

<svelte:head>
    <title>{isIrish ? 'Stair' : 'History'} | TG4</title>
</svelte:head>

<section class="account-page-content">
    <div class="bookmarks">
        <p class="frmTitle">{isIrish ? 'Stair' : 'History'}</p>

        {#if data.error}
            <p class="message">{data.error}</p>
        {:else if data.history?.length}
            <div class="bookmarks-grid">
                {#each data.history as history}
                    <a class="bookmark-card" href={withBase(`/${data.lang}/player/${history.vid}?startAt=${history.playbackLastPosition ?? 0}`)}>
                        <div class="history-card-image">
                            <img src={history?.image?.large
                                        ?? history?.image?.original
                                        ?? history?.poster}
                                alt={history?.displayTitle ?? history?.displayName}
                                loading="lazy"
                                onerror={(e) => {
                                    e.currentTarget.src = 'https://res.cloudinary.com/tg4/image/upload/w_700,h_395,g_faces,c_fill,f_auto,q_auto/000000.jpg';
                                }}
                            />

                            {#if history.playbackProgress > 0}
                                <div class="playback-progress">
                                    <div
                                        class="playback-progress-fill"
                                        style={`width: ${Math.min(100, Math.max(0, history.playbackProgress * 100))}%`}
                                    ></div>
                                </div>
                            {/if}
                        </div>
                        {#if history.seriesTitle === history.displayTitle}
                            <h3>{history.seriesTitle}</h3>
                            <p>
                            {#if history.seasonNumber}
                                S{history.seasonNumber}
                            {/if}
                            {#if history.episodeNumber}
                                E{history.episodeNumber}
                            {/if}</p>
                        {:else}
                            <h3>{history.seriesTitle}</h3>
                            <p>
                            {#if history.seasonNumber}
                                S{history.seasonNumber}
                            {/if}
                            {#if history.episodeNumber}
                                E{history.episodeNumber}
                            {/if}
                            {#if history.displayTitle}
                                : {history.displayTitle}
                            {/if}</p>
                        {/if}
                    </a>
                {/each}
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

.bookmark-card p {
    margin-top: -15px;
}

.bookmark-info p {
    margin: 0;
    line-height: 1.5;
}

.history-card-image {
    position: relative;
    width: 100%;
    overflow: hidden;
}

.history-card-image img {
    display: block;
    width: 100%;
    height: auto;
}

.playback-progress {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: rgba(255, 255, 255, 0.45);
}

.playback-progress-fill {
    height: 100%;
    background: #ff126c;
}

@media(max-width:1000px){
    .bookmarks-grid {
        grid-template-columns: repeat(3,1fr);
    }
}

@media(max-width:700px){
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