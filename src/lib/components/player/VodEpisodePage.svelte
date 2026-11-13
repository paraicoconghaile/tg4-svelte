<script lang="ts">
    import { genres } from '$lib/config/playerNav';
    import { tick, onDestroy } from 'svelte';
    import { withBase } from '$lib/utils/paths';
    import { page } from '$app/state';
    import { loadPeachUser } from '$lib/sso/peach';
    import { loadNielsenSdk } from '$lib/analytics/nielsen';
    import BookmarkButton from '$lib/components/sso/BookmarkButton.svelte';

    let { data } = $props();
    let isIrish = $derived(data.lang === 'ga');

    let openBookmarkModal: (() => void) | undefined;

    function registerBookmarkModal(openModal: () => void) {
        openBookmarkModal = openModal;
    }
    
    let playerElement = $state<HTMLVideoElement | undefined>(undefined);
    let playing = $state(false);
    let playerID = $state("HJlOg6KUz");

    let lastHistoryUpdate = 0;
    let historyUpdateInProgress = false;
    let historyAuthenticated = false;
    let pendingHistoryPosition: number | null = null;
    let historyVideoId: string | number | null = null;

    let activePlayer: any = null;
    let currentVideoId = $state<string | undefined>(undefined);

    let npawPromise: Promise<void> | null = null;

    function loadNpaw(): Promise<void> {
        if ((window as any).youbora?.adapters?.BrightcoveVideojs) {
            return Promise.resolve();
        }

        if (npawPromise) {
            return npawPromise;
        }

        npawPromise = new Promise((resolve, reject) => {
            const script = document.createElement('script');

            script.src = 'https://smartplugin.youbora.com/v6/js/adapters/videojs-brightcove/6.8.4/sp.min.js';

            script.onload = () => {
                console.log('VOD NPAW script loaded');
                resolve();
            };

            script.onerror = () => {
                npawPromise = null;
                reject(new Error('Failed to load VOD NPAW'));
            };

            document.head.appendChild(script);
        });

        return npawPromise;
    }

    let npawPlugin: any = null;

    let nSdkInstance: any = null;
    let nielsenLoaded = false;
    let nielsenEnded = false;
    let lastNielsenPlayhead: number | null = null;

    let lastAdMode: boolean | null = null;

    function buildNielsenMetadata(video: any) {
        const programmeTitle = [
            video.seriesTitle,
            video.seriesNumber ? `S${video.seriesNumber}` : '',
            video.episodeNumber ? `E${video.episodeNumber}` : ''
        ].filter(Boolean).join(' ');

        const airdate = video.airDate
            ? video.airDate
                .replace(/-/g, '')
                .replace('T', ' ')
                .split('.')[0]
                .replace('Z', '')
            : '';

        return {
            type: 'content',
            assetid: video.prodCode || video.videoId,
            program: programmeTitle,
            title: video.title || '',
            length: Math.round(Number(video.duration) || 0),
            airdate,
            isfullepisode: 'y',
            adloadtype: '2',
            segB: data.territory?.countryCode || '',
            segC: 'TG4 Player'
        };
    }

    function initialiseNielsen() {
        if (nSdkInstance) return;

        loadNielsenSdk();

        const win = window as any;

        if (!win.NOLBUNDLE?.nlsQ) {
            console.error('Nielsen SDK queue not available');
            return;
        }

        nSdkInstance = win.NOLBUNDLE.nlsQ('PFB9C2DE1-27DD-4852-8460-20BEB7AF4C96', 'TG4 Vod');

        console.log('*** VOD NIELSEN INITIALISED ***');
    }

    function loadNielsenContent(video: any) {
        if (!nSdkInstance) return;

        const metadata = buildNielsenMetadata(video);

        nSdkInstance.ggPM('loadMetadata', metadata);

        nielsenLoaded = true;
        nielsenEnded = false;
        lastNielsenPlayhead = null;

        console.log('*** VOD NIELSEN CONTENT LOADED ***', metadata);
    }

    async function initialiseNpaw(player: any) {
        try {
            await loadNpaw();

            if (player.isDisposed?.()) return;

            const youbora = (window as any).youbora;

            if (!youbora?.adapters?.BrightcoveVideojs) {
                console.error('NPAW Youbora adapter not available');
                return;
            }

            npawPlugin?.fireStop?.();
            npawPlugin?.removeAdapter?.();

            npawPlugin = new youbora.Plugin({
                accountCode: 'tg4prod',
                username: 'TG4 Website',
                'content.channel': 'TG4',
                'content.isLive': false
            });

            npawPlugin.setAdapter(
                new youbora.adapters.BrightcoveVideojs(player)
            );

            console.log('*** VOD NPAW INITIALISED ***');

        } catch (error) {
            console.error('VOD NPAW initialisation failed:', error);
        }
    }
    
    function updateNpawMetadata(player: any, video: any) {
        if (!npawPlugin) {
            console.warn('VOD NPAW plugin not available');
            return;
        }

        const referenceId = video.referenceId;

        npawPlugin.setOptions({
            'content.id': referenceId,
            'content.title': video.seriesTitle,
            'content.episodeTitle': video.title,
            'content.season': video.seriesNumber,
            'content.program': video.episodeNumber,
            'content.genre': video.categories?.[0]?.displayEn ?? '',
            'content.customDimension.1': video.seriesCode,
            'content.customDimension.2': video.prodCode
        });

        console.log('*** VOD NPAW METADATA UPDATED ***', {
            referenceId,
            seriesTitle: video.seriesTitle,
            episodeTitle: video.title,
            seriesCode: video.seriesCode,
            prodCode: video.prodCode
        });
    }

    $effect(() => {
        const nextVideoId = data.video.videoId;

        if (nextVideoId === currentVideoId) return;

        currentVideoId = nextVideoId;

        const player = activePlayer;

        if (player && !player.isDisposed?.()) {
            void savePlaybackPosition(player);

            player.pause();
            player.dispose();
        }

        activePlayer = null;
        playing = false;
        lastHistoryUpdate = 0;
        historyVideoId = null;
        pendingHistoryPosition = null;
    });

    const startAt = $derived(
        Math.max(0, Number(page.url.searchParams.get('startAt')) || 0)
    );

    async function savePlaybackPosition(player: any) {
        if (!historyAuthenticated || historyVideoId == null) return;

        try {
            const playbackPosition = Math.floor(player.currentTime());

            if (playbackPosition <= 0 || playbackPosition === lastHistoryUpdate) return;

            // Remember the newest position, even if a save is in progress
            pendingHistoryPosition = playbackPosition;

            if (historyUpdateInProgress) return;

            historyUpdateInProgress = true;

            try {
                const pu = await loadPeachUser();

                while (pendingHistoryPosition !== null) {
                    const positionToSave = pendingHistoryPosition;
                    pendingHistoryPosition = null;

                    if (positionToSave === lastHistoryUpdate) continue;

                    await pu.updateMediaPlaybackPosition(
                        0,
                        historyVideoId,
                        positionToSave
                    );

                    //console.log('History position saved:', positionToSave);
                    lastHistoryUpdate = positionToSave;
                }
            } finally {
                historyUpdateInProgress = false;
            }
        } catch (error) {
            console.error('Failed to update playback history:', error);
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
    
    async function shouldShowAds(): Promise<boolean> {
        // Ads are only available to viewers in Ireland
        if (data.territory?.countryCode !== 'IE') {
            return false;
        }

        try {
            const pu = await loadPeachUser();
            const profile = await pu.getCombinedSessionAndPreferenceProfile();

            // An unauthenticated visitor gets the Ads player
            const unauthorized =
                profile?.profile?.error === 'Unauthorized' ||
                profile?.preferences?.error === 'Unauthorized';

            if (unauthorized) {
                return true;
            }

            // If the visitor has a saved preference, respect it.
            // Otherwise, default to Ads.
            const adsPreference = profile?.preferences?.extraPref?.ads;

            return adsPreference === false ? false : true;
        } catch (error) {
            console.error('Could not retrieve ad preference:', error);

            // Default to Ads for visitors in Ireland
            return true;
        }
    }

    async function startPlayer() {
        const showAds = await shouldShowAds();

        playerID = showAds ? 'vJxvEpuW2' : 'HJlOg6KUz';
        playing = true;

        await tick();

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

            activePlayer = player;

            if (!player) {
                console.error('Brightcove player not found');
                return;
            }

            player.ready(async () => {
                if (player.isDisposed?.()) return;

                console.log('*** BRIGHTCOVE ADS DEBUG ***', {
                    playerID,
                    ads: !!player.ads,
                    ssai: typeof player.ssai,
                    ima3: !!player.ima3,
                    currentTime: player.currentTime(),
                    duration: player.duration()
                });

                // Temporary debugging for Nielsen advertisement tracking
                const adEvents = [
                    'ads-ad-started',
                    'ads-ad-ended',
                    'ads-adbreak-started',
                    'ads-adbreak-ended',
                    'ads-pause',
                    'ads-play'
                ];

                for (const eventName of adEvents) {
                    player.on(eventName, () => {
                        if (eventName === 'adtimeupdate') return;

                        console.log('*** BRIGHTCOVE AD EVENT ***', {
                            event: eventName,
                            currentTime: player.currentTime(),
                            inAdMode: player.ads?.isInAdMode?.() ?? false
                        });
                    });
                }

                player.on('ads-ad-ended', () => {
                    setTimeout(() => {
                        if (player.isDisposed?.()) return;

                        console.log('*** SSAI STATE AFTER AD ***', {
                            currentTime: player.currentTime(),
                            inAdMode: player.ads?.isInAdMode?.(),
                            paused: player.paused(),
                            ended: player.ended()
                        });
                    }, 500);
                });

                historyVideoId = data.video.videoId;

                // Initialise Nielsen VOD
                initialiseNielsen();

                // Load Nielsen metadata when content starts playing
                player.one('playing', () => {
                    if (player.isDisposed?.()) return;

                    loadNielsenContent(data.video);
                });

                // Initialise NPAW VOD
                await initialiseNpaw(player);

                if (player.isDisposed?.()) return;

                if (npawPlugin) {
                    updateNpawMetadata(player, data.video);
                }

                await checkHistoryAuthentication();

                if (player.isDisposed?.()) return;

                if (startAt > 0) {
                    player.one('loadedmetadata', () => {
                        if (!player.isDisposed?.()) {
                            player.currentTime(startAt);
                        }
                    });
                }

                // Save playback position every 10 seconds
                player.on('timeupdate', () => {
                    const inAdMode = player.ads?.isInAdMode?.() ?? false;

                    if (inAdMode !== lastAdMode) {
                        console.log('*** BRIGHTCOVE MODE CHANGED ***', {
                            from: lastAdMode,
                            to: inAdMode,
                            currentTime: player.currentTime(),
                            ended: player.ended()
                        });

                        lastAdMode = inAdMode;
                    }

                    const playbackPosition = Math.floor(player.currentTime());

                    // Nielsen VOD playhead tracking
                    if (
                        nielsenLoaded &&
                        !nielsenEnded &&
                        nSdkInstance &&
                        !inAdMode &&
                        Number.isFinite(playbackPosition) &&
                        playbackPosition >= 0 &&
                        playbackPosition !== lastNielsenPlayhead
                    ) {
                        nSdkInstance.ggPM('setPlayheadPosition', playbackPosition);
                        lastNielsenPlayhead = playbackPosition;

                        console.log('*** VOD NIELSEN PLAYHEAD ***', playbackPosition);
                    }

                    if (
                        playbackPosition > 0 &&
                        playbackPosition % 10 === 0 &&
                        playbackPosition !== lastHistoryUpdate
                    ) {
                        void savePlaybackPosition(player);
                    }
                });

                player.on('waiting', () => {
                    const videoElement = player.el()?.querySelector('video');

                    console.log('*** BRIGHTCOVE WAITING ***', {
                        currentTime: player.currentTime(),
                        duration: player.duration(),
                        remaining: player.duration() - player.currentTime(),
                        inAdMode: player.ads?.isInAdMode?.() ?? false,
                        ended: player.ended(),

                        nativeCurrentTime: videoElement?.currentTime,
                        nativeDuration: videoElement?.duration,
                        nativeEnded: videoElement?.ended,
                        nativeReadyState: videoElement?.readyState
                    });

                    const duration = player.duration();
                    const currentTime = player.currentTime();

                    if (
                        Number.isFinite(duration) &&
                        duration > 0 &&
                        duration - currentTime <= 0.25 &&
                        !player.ads?.isInAdMode?.() &&
                        !player.ended()
                    ) {
                        setTimeout(() => {
                            if (player.isDisposed?.() || playbackCompleted) return;

                            const remaining = player.duration() - player.currentTime();

                            if (
                                Number.isFinite(remaining) &&
                                remaining >= 0 &&
                                remaining <= 0.25 &&
                                !player.ads?.isInAdMode?.() &&
                                !player.ended() &&
                                !player.paused()
                            ) {
                                console.log('*** VOD END-OF-STREAM STALL CONFIRMED ***');

                                // Prevent Brightcove continuing to wait at the end of the stream.
                                player.pause();

                                // Complete our application-level playback handling.
                                completePlayback();
                            }
                        }, 3000);
                    }
                });

                player.on('error', () => {
                    console.log('*** BRIGHTCOVE PLAYER ERROR ***', {
                        error: player.error(),
                        currentTime: player.currentTime(),
                        duration: player.duration(),
                        paused: player.paused(),
                        ended: player.ended(),
                        inAdMode: player.ads?.isInAdMode?.() ?? false
                    });

                    const ssai = player.ssai?.();

                    console.log('*** BRIGHTCOVE PLAYER ERROR ***', {
                        error: player.error(),
                        currentTime: player.currentTime(),
                        duration: player.duration(),
                        paused: player.paused(),
                        ended: player.ended(),
                        inAdMode: player.ads?.isInAdMode?.() ?? false,
                        ssaiState: ssai?.state,
                        ssaiAdPlaying: ssai?.adPlaying,
                        remaining: player.duration() - player.currentTime()
                    });
                });

                // Save immediately when playback pauses
                player.on('pause', () => {
                    void savePlaybackPosition(player);
                });

                let playbackCompleted = false;

                function completePlayback() {
                    if (playbackCompleted || player.isDisposed?.()) return;

                    playbackCompleted = true;

                    // End Nielsen VOD tracking
                    if (nielsenLoaded && !nielsenEnded && nSdkInstance) {
                        nSdkInstance.ggPM('end', Math.floor(player.currentTime()));

                        nielsenEnded = true;
                        nielsenLoaded = false;

                        console.log('*** VOD NIELSEN ENDED ***');
                    }

                    void savePlaybackPosition(player);

                    console.log('*** VOD PLAYBACK COMPLETED ***', {
                        currentTime: player.currentTime(),
                        duration: player.duration(),
                        inAdMode: player.ads?.isInAdMode?.() ?? false
                    });
                }

                player.on('ended', () => {
                    //void savePlaybackPosition(player);

                    console.log('*** BRIGHTCOVE ENDED ***', {
                        currentTime: player.currentTime(),
                        duration: player.duration(),
                        inAdMode: player.ads?.isInAdMode?.() ?? false
                    });

                    completePlayback();
                });

                // Start playback automatically
                const playPromise = player.play();

                if (playPromise !== undefined) {
                    playPromise.catch((error: Error) => {
                        console.log('Autoplay was blocked:', error.message);
                    });
                }
            });
        };

        playerElement.insertAdjacentElement('afterend', script);
    }

    onDestroy(() => {
        const player = activePlayer;

        if (!player || player.isDisposed?.()) return;

        void savePlaybackPosition(player);

        player.off('timeupdate');
        player.off('pause');

        player.pause();
        player.dispose();

        activePlayer = null;

        npawPlugin?.fireStop?.();
        npawPlugin?.removeAdapter?.();
        npawPlugin = null;
    });

    function getOtherImageUrl(data: any) {
        return data?.image || 'https://res.cloudinary.com/tg4/image/upload/w_700,h_395,g_faces,c_fill,f_auto,q_auto/000000.jpg';
    }

    function getImageUrl(data: any) {
        return data.video?.image || 'https://res.cloudinary.com/tg4/image/upload/w_700,h_395,g_faces,c_fill,f_auto,q_auto/000000.jpg';
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
            <img src={getImageUrl(data)} alt={data.video.seriesTitle} onerror={(e) => {const img = e.currentTarget as HTMLImageElement; img.src = 'https://res.cloudinary.com/tg4/image/upload/w_700,h_395,g_faces,c_fill,f_auto,q_auto/000000.jpg';}} />

            <button type="button" class="play-button" onclick={startPlayer} aria-label="Play video">
                <svg viewBox="18 0 38 56" width="30" height="38" aria-hidden="true" class="svelte-y23m4k"><path d="M55.9383 27.9696L46.9742 19.3235L35.2362 30.6515L18.6702 46.6389L27.6318 55.2875L55.9383 27.9696Z" fill="#FFFFFF" class="svelte-y23m4k"></path><path d="M46.9354 36.6571L55.8945 28.0061L44.1565 16.6781L27.5905 0.690705L18.6289 9.33929L46.9354 36.6571Z" fill="#FFFFFF" class="svelte-y23m4k"></path></svg>
            </button>
        </div>
    {:else}
        <div class="player-container">
            <!-- Brightcove player goes here -->
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
                <h1>{data.video.seriesTitle}.+.+.***</h1>

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
            <h2>{data.lang === 'ga' ? 'Tuilleadh Eipeasóid...' : 'More episodes...'}</h2>

            <div class="episode-grid">
                {#each data.otherEpisodes as ep}
                    <a class="episode-card" href={withBase(`/${data.lang}/player/${data.slug}/${ep.episodeID}`)}>
                        <img src={getOtherImageUrl(ep)} alt={ep.title} onerror={(e) => {const img = e.currentTarget as HTMLImageElement; img.src = 'https://res.cloudinary.com/tg4/image/upload/w_700,h_395,g_faces,c_fill,f_auto,q_auto/000000.jpg';}} />

                        <h3>{ep.title}</h3>

                        <p>{data.lang === 'ga' ? `Sraith ${ep.seriesNumber}, Eipeasóid ${ep.episodeNumber}` : `Series ${ep.seriesNumber}, Episode ${ep.episodeNumber}`}</p>
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