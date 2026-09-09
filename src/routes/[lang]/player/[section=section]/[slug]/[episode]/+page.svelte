<script lang="ts">
    let { data } = $props();
    let isIrish = $derived(data.lang === 'ga');
    
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

    console.log("Episode Data", JSON.stringify(data, null, 2));
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

    <section class="episodes">
        <section class="video-info">
            <div class="video-details">
                <h1>{data.video.seriesTitle}</h1>

                <h2>
                    {data.lang === 'ga' ? 'Seasúr' : 'Season'}
                    {data.video.seriesNumber},
                    {data.lang === 'ga' ? 'Eipeasóid' : 'Episode'}
                    {data.video.episodeNumber}
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

                <p><br />
                    <a
                        class="language-switch"
                        href={`/${data.lang}/player/${data.slug}`}
                    >
                        {data.backLabel}
                    </a>
                </p>
            </div>

            <div class="bookmark">
                <a class="language-switch">+</a>&nbsp;<a class="language-switch">Bookmark</a>
            </div>
        </section>
    </section>

    <section class="episodes">
        <h2>
            {data.lang === 'ga'
                ? 'Tuilleadh Eipeasóid'
                : 'More episodes'}
        </h2>

        <div class="episode-grid">
            {#each data.otherEpisodes as ep}
                <a
                    class="episode-card"
                    href={`/${data.lang}/player/${data.slug}/${ep.episodeID}`}
                >
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
</section>

<style>
.episode-page {
    max-width: var(--page-width);
    margin: 0 auto;
    background-color: #403f3f;
}

.language-switch {
    background: var(--tg4-pink);
    color: var(--tg4-white);
    padding: 4px 18px;
    font-weight: 700;
    transition: background .2s ease;
}

.language-switch:hover {
    background: #ff4b91;
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

.episodes {
    width: 100%;
    margin: 0 auto;
    max-width: var(--episode-width);
}

@media (max-width: 1346px) {
    .episodes {
        padding-left: 20px;
        padding-right: 20px;
        box-sizing: border-box;
    }
}

.video-info {
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    gap: 40px;
}

.video-details {
    width: 50%;
}

.bookmark {
    cursor: pointer;
    margin-top: 40px;
    width: 50%;
    display: flex;
    justify-content: flex-end;
    align-items: flex-start;
}

.categories span {
    margin-right: 10px;
}

.languages {
    margin-right: 10px;
}

.content-rating {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
    height: 32px;
    padding: 0 6px;
    border: 2px solid white;
    border-radius: 50%;
    font-size: 14px;
    font-weight: 700;
    color: white;
    box-sizing: border-box;
}

.subtitles-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: 2px solid currentColor;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 700;
}

.episode-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
}

.episode-card {
    display: block;
    color: inherit;
    text-decoration: none;
}

.episode-card img {
    display: block;
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
}

.episode-card h3 {
    margin: 10px 0 5px;
}

.episode-card p {
    margin: 0;
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
    {JSON.stringify(data.video, null, 2)}
</pre> -->