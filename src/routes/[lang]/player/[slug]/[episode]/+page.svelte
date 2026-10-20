<script lang="ts">
    import { genres } from '$lib/config/playerNav';
    import { tick } from 'svelte';
    import { withBase } from '$lib/utils/paths';
    import { page } from '$app/state';
    import { loadPeachUser } from '$lib/sso/peach';
    import BookmarkButton from '$lib/components/sso/BookmarkButton.svelte';

    let { data } = $props();
    let isIrish = $derived(data.lang === 'ga');

    let openBookmarkModal: (() => void) | undefined;

    function registerBookmarkModal(openModal: () => void) {
        openBookmarkModal = openModal;
    }
    
    let playerElement: HTMLVideoElement;
    let playing = $state(false);
    let playerID = "HJlOg6KUz";

    let lastHistoryUpdate = 0;
    let historyUpdateInProgress = false;
    let historyAuthenticated = false;

    const startAt = $derived(
        Math.max(0, Number(page.url.searchParams.get('startAt')) || 0)
    );

    async function savePlaybackPosition(player: any) {
        if (!historyAuthenticated || historyUpdateInProgress) return;

        const playbackPosition = Math.floor(player.currentTime());

        // Don't overwrite useful history with zero or an older position
        if (playbackPosition <= 0 || playbackPosition <= lastHistoryUpdate) return;

        historyUpdateInProgress = true;

        try {
            const pu = await loadPeachUser();

            await pu.updateMediaPlaybackPosition(
                0,
                data.video.videoId,
                playbackPosition
            );

            console.log('History position saved:', playbackPosition);

            lastHistoryUpdate = playbackPosition;
        } catch (error) {
            console.error('Failed to update playback history:', error);
        } finally {
            historyUpdateInProgress = false;
        }
    }

    async function checkHistoryAuthentication() {
        try {
            const pu = await loadPeachUser();
            const result = await pu.getPlaylists();

            historyAuthenticated = result?.error !== 'Unauthorized'
                && !result?.error;
        } catch (error) {
            historyAuthenticated = false;
            console.error('History authentication check failed:', error);
        }
    }

    async function startPlayer() {
        //console.log('1. PLAY CLICKED');

        playing = true;

        //console.log('2. playing =', playing);

        await tick();

        //console.log('3. AFTER TICK');
        //console.log('4. playerElement =', playerElement);

        if (!playerElement) {
            console.error('VIDEO ELEMENT NOT FOUND');
            return;
        }

        const script = document.createElement('script');

        script.src = `https://players.brightcove.net/1555966122001/${playerID}_default/index.min.js`;

        script.async = true;

        script.onload = () => {
            const videojs = (window as any).videojs;
            const player = videojs?.getPlayer?.('Subtitles');

            if (!player) {
                console.error('Brightcove player not found');
                return;
            }

            player.ready(async () => {
                await checkHistoryAuthentication();

                if (startAt > 0) {
                    player.one('loadedmetadata', () => {
                        player.currentTime(startAt);
                    });
                }

                // Save playback position every 10 seconds
                player.on('timeupdate', () => {
                    const playbackPosition = Math.floor(player.currentTime());

                    if (
                        playbackPosition > 0 &&
                        playbackPosition % 10 === 0 &&
                        playbackPosition !== lastHistoryUpdate
                    ) {
                        void savePlaybackPosition(player);
                    }
                });

                // Save immediately when playback pauses
                player.on('pause', () => {
                    void savePlaybackPosition(player);
                });
            });

        };

        //console.log('5. Loading Brightcove:', script.src);

        playerElement.insertAdjacentElement('afterend', script);

        //console.log('6. SCRIPT INSERTED');
    }

    function getImageUrl(data: any) {
        /* if (data.video?.prodCode) {
            return `https://res.cloudinary.com/tg4/image/upload/w_700,h_395,g_faces,c_fill,f_auto,q_auto:eco/${data.video.prodCode}.jpg`;
        }

        if (data.video?.seriesCode) {
            return `https://res.cloudinary.com/tg4/image/upload/w_700,h_395,g_faces,c_fill,f_auto,q_auto:eco/${data.video.seriesCode}.jpg`;
        } */

        return (data.video.poster || 'https://res.cloudinary.com/tg4/image/upload/w_700,h_395,g_faces,c_fill,f_auto,q_auto/000000.jpg');
    }

    const irishMonths: Record<number, string> = {
        0: 'Eanáir',
        1: 'Feabhra',
        2: 'Márta',
        3: 'Aibreán',
        4: 'Bealtaine',
        5: 'Meitheamh',
        6: 'Iúil',
        7: 'Lúnasa',
        8: 'Meán Fómhair',
        9: 'Deireadh Fómhair',
        10: 'Samhain',
        11: 'Nollaig'
    };

    const englishMonths: Record<number, string> = {
        0: 'January',
        1: 'February',
        2: 'March',
        3: 'April',
        4: 'May',
        5: 'June',
        6: 'July',
        7: 'August',
        8: 'September',
        9: 'October',
        10: 'November',
        11: 'December'
    };

    function formatDate(dateString: string) {
        const date = new Date(dateString);

        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = data.lang === 'ga'
            ? irishMonths[date.getUTCMonth()]
            : englishMonths[date.getUTCMonth()];
        const year = date.getUTCFullYear();

        return `${day} ${month} ${year}`;
    }

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

    //console.log("Episode Data", JSON.stringify(data, null, 2));
</script>

<section class="episode-page">
    {#if !playing}
        <div class="poster">
            <img src={getImageUrl(data)} alt={data.video.seriesTitle} onerror={(e) => {
                    e.currentTarget.src =
                        'https://res.cloudinary.com/tg4/image/upload/w_700,h_395,g_faces,c_fill,f_auto,q_auto/000000.jpg';
                }}
            />

            <button type="button" class="play-button" onclick={startPlayer} aria-label="Play video">
                ▶
            </button>
        </div>
    {:else}
        <div class="player-container">
            <!-- Brightcove player goes here -->
            <!-- <video id="Subtitles" class="video-js vjs-big-play-centered"
                controls preload="auto"
                data-account="1555966122001"
                data-player={playerID}
                data-embed="default"
                data-video-id={data.video.providerId}>
                <p class="vjs-no-js">To view this video please enable JavaScript, and consider upgrading to a web browser that <a href="https://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a></p> 
            </video>
            <script src="https://players.brightcove.net/1555966122001/HJlOg6KUz_default/index.min.js"></script> -->

            <video
                bind:this={playerElement}
                id="Subtitles"
                class="video-js vjs-big-play-centered"
                controls
                preload="auto"
                data-account="1555966122001"
                data-player={playerID}
                data-embed="default"
                data-video-id={data.video.videoId}
            >
                <p class="vjs-no-js">To view this video please enable JavaScript.</p>
            </video>
        </div>
    {/if}

    <section class="episodes">
        <section class="video-info">
            <div class="video-details">
                <h1>{data.video.seriesTitle}...</h1>

                <h2>
                    {data.lang === 'ga' ? 'Seasúr' : 'Season'}
                    {data.video.seriesNumber},
                    {data.lang === 'ga' ? 'Eipeasóid' : 'Episode'}
                    {data.video.episodeNumber}<br />{data.video.title}
                </h2>

                <p>
                    S{data.video.seriesNumber}
                    E{data.video.episodeNumber}
                    {#if data.video.duration >= 3600}
                        {Math.floor(data.video.duration / 3600)}{data.lang === 'ga' ? 'h' : 'h'}
                        {#if Math.floor((data.video.duration % 3600) / 60) > 0}
                            {Math.floor((data.video.duration % 3600) / 60)}{data.lang === 'ga' ? 'm' : 'm'}
                        {/if}
                    {:else}
                        {Math.floor(data.video.duration / 60)}{data.lang === 'ga' ? 'm' : 'm'}
                    {/if}
                </p>

                <p>{data.video.description}</p>

                <p>
                    {#if data.video.subtitles?.length}
                        {#each data.video.subtitles as subtitle}
                            <!-- <span class="subtitles-icon" title="Subtitles">
                                CC
                            </span> -->
                            <span class="languages">
                                {getLanguageName(subtitle, data.lang)}
                            </span>
                        {/each}
                    {/if}
                    {#if data.video.contentRating}
                        <span class="content-rating">
                            {data.video.contentRating}
                        </span>
                    {/if}
                </p>

                {#if data.video.categories?.length}
                    <div class="categories">
                        {#each data.video.categories as category}
                            <span>
                                {data.lang === 'ga' ? category.displayGa : category.displayEn}
                            </span>
                        {/each}
                    </div>
                {/if}

                <p>{formatDate(data.video.airDate)}</p>
            </div>

            <div class="bookmark">
                <button class="bookmark-icon" type="button" onclick={() => openBookmarkModal?.()} aria-label={isIrish ? 'Cuir leabharmharc leis' : 'Add bookmark'}>
                    <svg width="27" height="26" viewBox="0 0 27 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8.9079 10.0013V25.6H15.6689V15.6169H23.5105L26.4 10.0013H8.9079Z" fill="#2B2A2A"/>
                        <path d="M15.6586 15.5987L15.6586 0L8.89755 5.64766e-07L8.89755 9.98315H0L5.13447e-07 15.5987L15.6586 15.5987Z" fill="#2B2A2A"/>
                    </svg>
                </button>

                <button class="bookmark-text" type="button" onclick={() => openBookmarkModal?.()}>
                    {isIrish ? 'Leabharmharc' : 'Bookmark'}
                </button>

                <BookmarkButton bookmark={data.video.videoId} lang={data.lang} onReady={registerBookmarkModal} showButton={false}
                />
            </div>
        </section>
    </section>

    {#if data.otherEpisodes?.length}
        <section class="episodes">
            <h2>{data.lang === 'ga' ? 'Tuilleadh Eipeasóid...' : 'More episodes'}</h2>

            <div class="episode-grid">
                {#each data.otherEpisodes as ep}
                    <a class="episode-card" href={withBase(`/${data.lang}/player/${data.slug}/${ep.episodeID}`)}>
                        <img
                            src={ep.prodCode
                                ? `https://res.cloudinary.com/tg4/image/upload/w_700,h_395,g_faces,c_fill,f_auto,q_auto:eco/${ep.prodCode}.jpg`
                                : 'https://res.cloudinary.com/tg4/image/upload/w_700,h_395,g_faces,c_fill,f_auto,q_auto/000000.jpg'}
                            alt={ep.title}
                        />

                        <h3>{ep.title}</h3>

                        <p>
                            {data.lang === 'ga'
                                ? `Sraith ${ep.seriesNumber}, Eipeasóid ${ep.episodeNumber}`
                                : `Series ${ep.seriesNumber}, Episode ${ep.episodeNumber}`}
                        </p>
                    </a>
                {/each}
            </div>
        </section>
    {/if}
</section>

<style>
.player-container :global(video),
.player-container :global(.video-js),
.player-container :global(.video-js video),
.player-container :global(.vjs-tech) {
    width: 100%;
    height: 100%;
}

.bookmark {
    display: inline-flex;
    width: fit-content;
    gap: 4px;
}

.bookmark-icon {
    width: 48px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0;
    border: 0;
    background: white;
    cursor: pointer
}

.bookmark-text {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 12px;
    border: 0;
    background: white;
    color: var(--tg4-grey-2);
    font-family: inherit;
    font-size: inherit;
    font-weight: 700;
    line-height: inherit;
    text-decoration: none;
    cursor: pointer;
}

.bookmark:hover .bookmark-text {
    color: var(--tg4-pink);
}

.bookmark-icon {
    width: 34px;
    height: 34px;
    font-size: 24px;
}

.bookmark-text {
    min-height: 34px;
    padding: 0 20px;
    font: inherit;
}

@media (max-width: 1346px) {
    .episodes {
        padding-left: 20px;
        padding-right: 20px;
        box-sizing: border-box;
    }
}

@media (max-width: 800px) {
    .episode-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 500px) {
    .episode-grid {
        grid-template-columns: 1fr;
    }
}
</style>

<!-- <pre>
    {JSON.stringify(data, null, 2)}
</pre> -->