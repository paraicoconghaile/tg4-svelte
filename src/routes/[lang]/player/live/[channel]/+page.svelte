<script lang="ts">
    import { onMount } from 'svelte';

    let { data } = $props();

    onMount(() => {
        const video = document.getElementById(
            'Subtitles'
        ) as HTMLElement;

        if (!video) {
            console.error('Brightcove video element not found');
            return;
        }

        // Brightcove configuration
        video.setAttribute('data-account', '1555966122001');
        video.setAttribute('data-player', 'D0RgRVjpd');
        video.setAttribute('data-embed', 'default');
        video.setAttribute('data-video-id', data.stream.streamId);
        video.setAttribute('data-live-playback-token', data.stream.liveToken);

        function initialisePlayer() {
            const bc = (window as any).bc;

            if (!bc) {
                console.error('Brightcove bc() not available');
                return;
            }

            console.log(
                'Initialising Brightcove:', data.channel
            );

            // Pass the actual element to bc()
            const player = bc(video);

            player.ready(() => {
                console.log('Brightcove player ready');
            });

            player.on('error', () => {
                console.error(
                    'Brightcove error:',
                    player.error()
                );
            });
        }

        // Brightcove already loaded
        if ((window as any).bc) {
            initialisePlayer();
            return;
        }

        // Load Brightcove dynamically
        const script = document.createElement('script');

        script.src =
            'https://players.brightcove.net/1555966122001/D0RgRVjpd_default/index.min.js';

        script.onload = () => {
            console.log('Brightcove script loaded');
            initialisePlayer();
        };

        script.onerror = () => {
            console.error(
                'Failed to load Brightcove player'
            );
        };

        document.head.appendChild(script);
    });
</script>

<section class="live-page">
    <div class="player-container">

        <video-js
            id="Subtitles"
            class="video-js vjs-big-play-centered"
            controls
            preload="auto"
            autoplay
            playsinline
        ></video-js>

    </div>
</section>

<style>
    .live-page {
        max-width: var(--page-width);
        margin: 0 auto;
        background-color: var(--genre-background);
    }

    .player-container :global(.video-js) {
        width: 100%;
        height: auto;
        aspect-ratio: 16 / 9;
    }
</style>