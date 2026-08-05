<script lang="ts">
    let { data } = $props();
    import { genres } from '$lib/config/playerNav';
    import { tick } from 'svelte';

    let playerElement: HTMLVideoElement;
    let playing = $state(false);
    let playerID = "HJlOg6KUz";

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

        script.src =
            `https://players.brightcove.net/1555966122001/${playerID}_default/index.min.js`;

        script.async = true;

        //console.log('5. Loading Brightcove:', script.src);

        playerElement.insertAdjacentElement(
            'afterend',
            script
        );

        //console.log('6. SCRIPT INSERTED');
    }

    function getImageUrl(data: any) {
        if (data.video?.prodCode) {
            return `https://res.cloudinary.com/tg4/image/upload/w_700,h_395,g_faces,c_fill,f_auto,q_auto:eco/${data.video.prodCode}.jpg`;
        }

        if (data.video?.seriesCode) {
            return `https://res.cloudinary.com/tg4/image/upload/w_700,h_395,g_faces,c_fill,f_auto,q_auto:eco/${data.video.seriesCode}.jpg`;
        }

        return (video.poster || 'https://res.cloudinary.com/tg4/image/upload/w_700,h_395,g_faces,c_fill,f_auto,q_auto/000000.jpg');
    }

    //console.log(data);
</script>

<section class="episode-page">
    <!-- <nav>
        {#each genres as g}
            <a class="language-switch" href={`/${data.lang}/player/${g.key[data.lang]}`}>{g.label[data.lang]}</a>&nbsp;&nbsp;
        {/each}
    </nav> -->

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

    <h1>{data.video.seriesTitle}</h1>       

    <p>{data.video.description}</p>

    <p><a class="language-switch" href={`/${data.lang}/player/${data.slug}`}>{data.backLabel}</a></p>
</section>

<style>
.episode-page {
    max-width:var(--page-width);
    margin:0 auto;
}

.language-switch {
    background:var(--tg4-pink);
    color:var(--tg4-white);
    padding:4px 18px;
    font-weight:700;
    transition:background .2s ease;
}

.language-switch:hover {
    background:#ff4b91;
}

.player-container {
    width: 100%;
    aspect-ratio: 16 / 9;
    background: black;
}

.poster {
    position: relative;
    width: 100%;
    height: 100%;
}

.poster img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.play-button {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 90px;
    height: 90px;
    border: none;
    border-radius: 50%;
    background: rgba(255,255,255,.9);
    color: #2B2A2A;
    font-size: 2rem;
    cursor: pointer;
    transition: transform .2s ease;
}

.play-button:hover {
    transform: translate(-50%, -50%) scale(1.1);
}

.player-container {
    width: 100%;
    max-width: 1440px;
    aspect-ratio: 16 / 9;
    margin: 0 auto;
    position: relative;
    overflow: hidden;
    background: black;
}

.player-container :global(video),
.player-container :global(.video-js),
.player-container :global(.video-js video),
.player-container :global(.vjs-tech) {
    width: 100%;
    height: 100%;
}
</style>

<!-- <pre>
    {JSON.stringify(data.video, null, 2)}
</pre> -->