<script lang="ts">
    import { tick } from 'svelte';
    import { onDestroy } from 'svelte';

    let { data } = $props();

    let player: any = null;
    let brightcovePromise: Promise<void> | null = null;

    function loadBrightcove(): Promise<void> {
        if ((window as any).bc) {
            return Promise.resolve();
        }

        if (brightcovePromise) {
            return brightcovePromise;
        }

        brightcovePromise = new Promise((resolve, reject) => {
            const script = document.createElement('script');

            script.src =
                'https://players.brightcove.net/1555966122001/D0RgRVjpd_default/index.min.js';

            script.onload = () => resolve();

            script.onerror = () => {
                reject(
                    new Error(
                        'Failed to load Brightcove'
                    )
                );
            };

            document.head.appendChild(script);
        });

        return brightcovePromise;
    }

    async function initialisePlayer() {
        await tick();

        const video = document.getElementById(
            'tg4-live-player'
        ) as HTMLElement;

        if (!video) {
            console.error(
                'Brightcove video element not found'
            );
            return;
        }

        video.setAttribute(
            'data-account',
            '1555966122001'
        );

        video.setAttribute(
            'data-player',
            'D0RgRVjpd'
        );

        video.setAttribute(
            'data-embed',
            'default'
        );

        video.setAttribute(
            'data-video-id',
            data.stream.streamId
        );

        video.setAttribute(
            'data-live-playback-token',
            data.stream.liveToken
        );

        await loadBrightcove();

        const bc = (window as any).bc;

        if (!bc) {
            console.error(
                'Brightcove bc() not available'
            );
            return;
        }

        console.log(
            'Initialising Brightcove:',
            data.channel
        );

        player = bc(video);

        player.ready(() => {
            console.log(
                'Brightcove player ready:',
                data.channel
            );

            if (data.channel !== 'TG4PLUSONE') {
                return;
            }

            const liveTracker = player.liveTracker;

            if (!liveTracker) {
                console.error(
                    'Brightcove LiveTracker not available'
                );
                return;
            }

            const checkLiveTracker = () => {
                const liveCurrentTime =
                    liveTracker.liveCurrentTime();

                const seekableStart =
                    liveTracker.seekableStart();

                const seekableEnd =
                    liveTracker.seekableEnd();

                console.log(
                    'LiveTracker values:',
                    {
                        liveCurrentTime,
                        seekableStart,
                        seekableEnd
                    }
                );

                if (
                    liveCurrentTime === 0 ||
                    seekableEnd === 0
                ) {
                    setTimeout(checkLiveTracker, 500);
                    return;
                }

                const offsetSeconds =
                    data.stream.offsetSeconds ?? 3600;

                const targetTime =
                    liveCurrentTime - offsetSeconds;

                if (
                    targetTime < seekableStart ||
                    targetTime > seekableEnd
                ) {
                    console.error(
                        'TG4+1 target is outside seekable range'
                    );
                    return;
                }

                console.log(
                    'TG4+1 waiting for player to start before seeking:',
                    targetTime
                );

                const seekToOffset = () => {
                    console.log(
                        'Seeking TG4+1 to:',
                        targetTime
                    );

                    player.currentTime(targetTime);
                };

                //player.one('playing', seekToOffset);
                player.one('loadedmetadata', seekToOffset);
            };

            checkLiveTracker();
        });

        player.on('error', () => {
            console.error(
                'Brightcove error:',
                player.error()
            );
        });
    }

    $effect(() => {
        const streamId = data.stream?.streamId;

        if (!streamId) {
            return;
        }

        initialisePlayer();
    });

    onDestroy(() => {
        if (player) {
            console.log('Disposing Brightcove player');

            try {
                player.dispose();
            } catch (error) {
                console.error(
                    'Error disposing Brightcove player:',
                    error
                );
            }

            player = null;
        }
    });
</script>

<section class="live-page">
    <div class="player-container">
        {#key data.stream.streamId}
            <video-js
                id="tg4-live-player"
                class="video-js vjs-big-play-centered"
                controls
                preload="auto"
                autoplay
                playsinline
            ></video-js>
        {/key}
    </div>
</section>

<style>
    .live-page {
        max-width: var(--page-width);
        margin: 0 auto;
        background-color: var(--genre-background);
    }

    .player-container :global(.video-js),
    .player-container :global(.vjs-tech) {
        width: 100%;
        height: 100%;
    }
</style>