<script lang="ts">
    import { tick } from 'svelte';
    import { onDestroy } from 'svelte';
    import LiveCarousel from '$lib/components/rails/LiveCarousel.svelte';

    let { data } = $props();
    let videoElement: HTMLElement | null = null;
    let player: any = null;
    let brightcovePromise: Promise<void> | null = null;
    let initId = 0;
    let destroyed = false;

    function loadBrightcove(): Promise<void> {
        if ((window as any).bc) {
            return Promise.resolve();
        }

        if (brightcovePromise) {
            return brightcovePromise;
        }

        brightcovePromise = new Promise((resolve, reject) => {
            const script = document.createElement('script');

            script.src = 'https://players.brightcove.net/1555966122001/D0RgRVjpd_default/index.min.js';

            script.onload = () => resolve();

            script.onerror = () => {
                reject(new Error('Failed to load Brightcove'));
            };

            document.head.appendChild(script);
        });

        return brightcovePromise;
    }

    async function initialisePlayer() {
        const thisInit = ++initId;

        if (player) {
            console.log('Disposing previous Brightcove player:', data.channel);

            try {
                player.dispose();
            } catch (error) {
                console.error ('Error disposing previous player:', error);
            }

            player = null;
        }

        await tick();

        if (destroyed || thisInit !== initId) {
            return;
        }

        const video = videoElement;

        if (!video) {
            console.error ('Brightcove video element not found');
            return;
        }

        video.setAttribute('data-account', '1555966122001');
        video.setAttribute('data-player', 'D0RgRVjpd');
        video.setAttribute('data-embed', 'default');
        video.setAttribute('data-video-id', data.stream.streamId);
        video.setAttribute('data-live-playback-token', data.stream.liveToken);

        await loadBrightcove();

        if (destroyed || thisInit !== initId) {
            return;
        }

        const bc = (window as any).bc;

        if (!bc) {
            console.error ('Brightcove bc() not available');
            return;
        }

        console.log('Initialising Brightcove:', data.channel);

        player = bc(video);

        player.ready(() => {
            if (destroyed || thisInit !== initId) {
                return;
            }
            
            console.log('Brightcove player ready:', data.channel);

            if (data.channel !== 'TG4PLUSONE') {
                return;
            }

            const liveTracker = player.liveTracker;

            if (!liveTracker) {
                console.error ('Brightcove LiveTracker not available');
                return;
            }

            const checkLiveTracker = () => {
                const liveCurrentTime = liveTracker.liveCurrentTime();
                const seekableStart = liveTracker.seekableStart();
                const seekableEnd = liveTracker.seekableEnd();

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

                const offsetSeconds = data.stream.offsetSeconds ?? 3600;
                const targetTime = liveCurrentTime - offsetSeconds;

                if (
                    targetTime < seekableStart ||
                    targetTime > seekableEnd
                ) {
                    console.error ('TG4+1 target is outside seekable range');
                    return;
                }

                console.log('TG4+1 waiting for player to start before seeking:', targetTime);

                const seekToOffset = () => {
                    console.log('Seeking TG4+1 to:', targetTime);

                    player.currentTime(targetTime);
                };

                //player.one('playing', seekToOffset);
                player.one('loadedmetadata', seekToOffset);
            };

            checkLiveTracker();
        });

        player.on('error', () => {
            console.error ('Brightcove error:', player.error());
        });
    }

    let lastStreamKey = '';

    $effect(() => {
        const streamId = data.stream?.streamId;
        const channel = data.channel;

        if (!streamId || !channel) {
            return;
        }

        const streamKey = `${channel}-${streamId}`;

        if (streamKey === lastStreamKey) {
            return;
        }

        lastStreamKey = streamKey;

        initialisePlayer();
    });

    onDestroy(() => {
        destroyed = true;
        initId++;

        if (player) {
            console.log('Disposing Brightcove player');

            try {
                player.dispose();
            } catch (error) {
                console.error ('Error disposing Brightcove player:', error);
            }

            player = null;
        }

        videoElement = null;
    });
</script>

<section class="live-page">
    <LiveCarousel
        rail={{
            type: 'LIVE',
            items: data.liveStreams.map((stream: any) => ({
                type: 'LIVE_STREAM',
                stream
            }))
        }}
        isIrish={data.lang === 'ga'}
        showNext={false}
    />

    <div class="player-container">
        {#key data.channel + '-' + data.stream.streamId}
            <video-js
                bind:this={videoElement}
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