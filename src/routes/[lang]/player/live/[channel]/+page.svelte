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

    type LiveProgramme = Record<string, string>;

    let currentProgramme = $state<LiveProgramme | null>(null);
    let currentProgrammeKey = $state('');

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

    function decodeHtmlEntities(value: string): string {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = value;
        return textarea.value;
    }

    function decodeId3Cue(text: string): LiveProgramme | null {
        try {
            const numbers = text
                .split(',')
                .map(value => Number(value.trim()))
                .filter(value =>
                    Number.isInteger(value) &&
                    value >= 0 &&
                    value <= 255
                );

            if (!numbers.length) {
                return null;
            }

            const bytes = new Uint8Array(numbers);

            let decoded = '';

            // TG4 ID3 payload:
            // 1, 255, 254, 123, 0, 34, 0, ...
            //
            // The JSON itself is UTF-16LE.
            if (
                bytes.length >= 5 &&
                bytes[1] === 0xff &&
                bytes[2] === 0xfe
            ) {
                decoded = new TextDecoder('utf-16le')
                    .decode(bytes.slice(3));
            } else {
                decoded = new TextDecoder().decode(bytes);
            }

            decoded = decoded
                .replace(/\0+$/, '')
                .trim();

            if (!decoded) {
                return null;
            }

            const parsed = JSON.parse(decoded) as Record<string, unknown>;

            const metadata: LiveProgramme = {};

            for (const [key, value] of Object.entries(parsed)) {
                metadata[key] = decodeHtmlEntities(
                    String(value ?? '')
                );
            }

            return metadata;

        } catch (error) {
            console.error('Failed to decode TG4 ID3:', error);
            return null;
        }
    }

    function processMetadataTrack(track: TextTrack) {
        const cues = track.activeCues;

        if (!cues) {
            return;
        }

        for (let i = 0; i < cues.length; i++) {
            const cue: any = cues[i];

            if (!cue?.text) {
                continue;
            }

            const metadata = decodeId3Cue(cue.text);

            if (!metadata) {
                continue;
            }

            // Only accept TG4 programme metadata.
            if (!metadata.scode || !metadata.pcode) {
                continue;
            }

            const programmeKey =
                `${metadata.scode}-${metadata.pcode}`;

            const isNewProgramme =
                programmeKey !== currentProgrammeKey;

            if (isNewProgramme) {
                console.log('*** NEW TG4 PROGRAMME ***');

                console.log({
                    programmeKey,
                    scode: metadata.scode,
                    pcode: metadata.pcode,
                    series: metadata.series_title,
                    title: metadata.prog_title,
                    episodeNumber: metadata.episode_number,
                    seriesNumber: metadata.series_number
                });

                currentProgrammeKey = programmeKey;
            } else {
                console.log('TG4 programme metadata update:', programmeKey);
            }

            // Always keep the latest metadata.
            //
            // This is important for multi-part programmes:
            // Part 1 -> ad -> Part 2
            // will retain the same programme key but can have
            // different timing information.
            currentProgramme = metadata;
        }
    }

    function attachId3Track() {
        const textTracks = player.textTracks();

        for (let i = 0; i < textTracks.length; i++) {
            const track = textTracks[i];

            console.log('TRACK', i, {
                kind: track.kind,
                label: track.label,
                language: track.language,
                mode: track.mode,
                cues: track.cues?.length
            });

            if (
                track.kind === 'metadata' &&
                track.label === 'Timed Metadata'
            ) {
                console.log('*** FOUND TG4 TIMED METADATA TRACK ***');

                track.mode = 'hidden';

                track.addEventListener('cuechange', () => {
                    console.log('*** TG4 ID3 CUE CHANGE ***');
                    processMetadataTrack(track);
                });

                processMetadataTrack(track);

                return;
            }
        }

        console.log('Timed Metadata track not found');
    }

    function clearProgrammeMetadata() {
        currentProgramme = null;
        currentProgrammeKey = '';

        console.log('*** CLEARED TG4 PROGRAMME METADATA ***');
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
            console.log('ALL TEXT TRACKS:', player.textTracks());

            clearProgrammeMetadata();

            attachId3Track();

            player.on('seeking', () => {
                console.log('*** DVR SEEKING — CLEARING PROGRAMME METADATA ***');

                currentProgramme = null;
                currentProgrammeKey = '';
            });

            player.on('loadedmetadata', () => {
                console.log('Live stream loadedmetadata');

                attachId3Track();

                const textTracks = player.textTracks();

                console.log('Text tracks:', textTracks);

                for (let i = 0; i < textTracks.length; i++) {
                    const track = textTracks[i];

                    console.log('Text track:', {
                        index: i,
                        kind: track.kind,
                        label: track.label,
                        language: track.language,
                        mode: track.mode
                    });

                    track.addEventListener('cuechange', () => {
                        console.log('Cue change:', {
                            kind: track.kind,
                            label: track.label,
                            activeCues: track.activeCues
                        });
                    });
                }
            });

            player.on('metadata', (event: any) => {
                console.log('ID3 metadata event:', event);
            });

            player.on('cuechange', (event: any) => {
                console.log('Cue change:', event);
            });

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

    <section class="episodes">
        {#if currentProgramme}
            <div class="live-programme">
                <h1>{currentProgramme.series_title}</h1>

                {#if currentProgramme.prog_title && currentProgramme.prog_title !== 'NONE'}
                    <h2>{currentProgramme.prog_title}</h2>
                {/if}

                <p>{currentProgramme.scode} / {currentProgramme.pcode}</p>

                <p>S{currentProgramme.series_number} E{currentProgramme.episode_number}</p>
            </div>
        {/if}
    </section>
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

.live-programme {
    max-width: var(--page-width);
    margin: 0 auto;
}
</style>