<script lang="ts">
    let { data } = $props();
    let isIrish = $derived(data.lang === 'ga');
    let selectedSeason = $state(data.seasons[0]);
    let seasonDropdownOpen = $state(false);
    let visibleEpisodes = $state(8);

    /* function selectSeason(season: any) {
        selectedSeason = season;
        visibleEpisodes = 8;
        seasonDropdownOpen = false;
    } */

    async function selectSeason(season: any) {
        seasonDropdownOpen = false;
        visibleEpisodes = 8;

        const response = await fetch(
            `/api/season?series=${data.slug}&season=${season.number}&lang=${data.lang}`
        );

        if (!response.ok) {
            console.error('Failed to load season');
            return;
        }

        selectedSeason = await response.json();
    }

    function loadMoreEpisodes() {
        visibleEpisodes += 8;
    }

    import { genres } from '$lib/config/playerNav';
    import { onMount } from 'svelte';

    let loadMoreTrigger: HTMLDivElement;

    $effect(() => {
        // Re-run whenever the selected season changes
        selectedSeason;

        const trigger = loadMoreTrigger;

        if (!trigger) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    loadMoreEpisodes();
                }
            },
            {
                rootMargin: '400px'
            }
        );

        observer.observe(trigger);

        return () => observer.disconnect();
    });

    const poster =
        data.series.categories.image?.xlarge ??
        data.series.series.mainImage?.large ??
        data.series.series.poster ??
        'https://res.cloudinary.com/tg4/image/upload/w_1440,h_810,g_faces,c_fill,f_auto,q_auto/000000.jpg';

    const description = $derived(data.lang === 'ga' ? data.series.series.descGa : data.series.series.descEn);

    function getImageUrl(ep: any) {
        if (ep?.prodCode) {
            return `https://res.cloudinary.com/tg4/image/upload/w_700,h_395,g_faces,c_fill,f_auto,q_auto:eco/${ep.prodCode}.jpg`;
        }

        if (ep?.seriesCode) {
            return `https://res.cloudinary.com/tg4/image/upload/w_700,h_395,g_faces,c_fill,f_auto,q_auto:eco/${ep.seriesCode}.jpg`;
        }

        return (
            ep.poster ||
            'https://res.cloudinary.com/tg4/image/upload/w_700,h_395,g_faces,c_fill,f_auto,q_auto/000000.jpg'
        );
    }

    console.log("Data", JSON.stringify(data, null, 2));
</script>

<section class="episode-page">
    <!-- Hero -->
    <section class="episode-hero">
        <img
            class="hero-image"
            src={poster}
            alt={data.seriesTitle}
        />
        <div class="hero-overlay">
            <div class="hero-content">
                <h1>{data.series.series.name}</h1>

                {#if data.series.categories?.length}
                    <div class="categories">
                        {#each data.series.categories as category}
                            <span>{data.lang === 'ga' ? category.displayGa : category.displayEn}</span> 
                        {/each}
                    </div>
                {/if}

                {#if description}
                    <p>{description}</p>
                {/if}
                    
                <p>{data.series.series.subtitles} {data.series.series.contentRating}</p>

                <div class="hero-buttons">
                    <a class="play-button">▶&nbsp; {data.lang === 'ga' ? 'Féach' : 'Watch now'}</a>
                </div>
            </div>
        </div>
    </section>

    <!-- Seasons -->
    <section class="episodes">
        <!-- Season selector -->
        <div class="season-selector">
            <button class="season-dropdown-button" onclick={() => seasonDropdownOpen = !seasonDropdownOpen}>
                <span>
                    {data.lang === 'ga'
                        ? `Sraith ${selectedSeason.seasonNumber}`
                        : `Series ${selectedSeason.seasonNumber}`}
                </span>

                <span
                    class:open={seasonDropdownOpen}
                    class="dropdown-arrow"
                >
                    ▼
                </span>
            </button>

            {#if seasonDropdownOpen}
                <div class="season-dropdown-menu">
                    {#each data.series.seasons as season}
                        <button class:selected={season.number === selectedSeason.seasonNumber} onclick={() => selectSeason(season)}>
                            {data.lang === 'ga'
                                ? `Sraith ${season.number}`
                                : `Series ${season.number}`}
                        </button>
                    {/each}
                </div>
            {/if}
        </div>

        <!-- Selected season -->
        <section class="series">
            <div class="episode-grid">
                <!-- {#each selectedSeason.episodes as ep} -->
                {#each selectedSeason.episodes.slice(0, visibleEpisodes) as ep}
                    <article class="episode">
                        <div class="episode-media">
                            <img
                                class="episode-image"
                                src={getImageUrl(ep)}
                                alt={ep.title}
                                onerror={(e) => {
                                    e.currentTarget.src =
                                        'https://res.cloudinary.com/tg4/image/upload/w_700,h_395,g_faces,c_fill,f_auto,q_auto/000000.jpg';
                                }}
                            />

                            <a href={`/${data.lang}/player/${data.slug}/${ep.episodeID}`}>
                                <svg
                                    class="play-icon"
                                    width="40"
                                    height="40"
                                    viewBox="0 0 40 40"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <rect
                                        width="40"
                                        height="40"
                                        fill="#EBEBEB"
                                    />

                                    <path
                                        d="M30.6867 20.4249L25.9734 15.8788L11.0911 30.2412L15.8031 34.7886L30.6867 20.4249Z"
                                        fill="#2B2A2A"
                                    />

                                    <path
                                        d="M25.9539 24.9922L30.6645 20.4435L15.7823 6.08105L11.0703 10.6285L25.9539 24.9922Z"
                                        fill="#2B2A2A"
                                    />
                                </svg>
                            </a>
                        </div>

                        <div class="episode-info">
                            <h3>{data.lang === 'ga' ? 'Eipeasóid' : 'Episode'}{ep.episodeNumber}</h3>

                            <p>S{ep.seriesNumber} E{ep.episodeNumber}</p>

                            <p>{ep.episodeDescription}</p>
                        </div>
                    </article>
                {/each}
            </div>

            <!-- {#if visibleEpisodes < selectedSeason.episodes.length}
                <div class="load-more">
                    <button onclick={loadMoreEpisodes}>{data.lang === 'ga' ? 'Tuilleadh' : 'Load more'}</button>
                </div>
            {/if} -->

            {#if visibleEpisodes < selectedSeason.episodes.length}
                <div class="load-more-trigger" bind:this={loadMoreTrigger}></div>
            {/if}
        </section>
    </section>
</section>

<style>
.categories {
    display: flex;
    gap: 8px;
    margin-bottom: 15px;
}

.categories span {
    padding: 5px 10px;
    background: var(--tg4-pink);
    color: white;
    font-size: 0.85rem;
    font-weight: 700;
}

.load-more-trigger {
    height: 1px;
}

.load-more {
    display: flex;
}

.load-more button {
    padding: 12px 30px;
    background: var(--tg4-pink);
    color: white;
    border: none;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 700;
}

.load-more button:hover {
    opacity: 0.9;
}

.season-selector {
    position: relative;
    width: 220px;
    bottom: 20px;
}

.season-dropdown-menu {
    position: absolute;
    top: calc(100% + 50px);
    left: 0;
    z-index: 100;
}

.season-dropdown-button {
    width: 100%;
    padding: 12px 15px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #2b2a2a;
    color: white;
    border: 1px solid #666;
    cursor: pointer;
    font-size: 1rem;
    text-align: left;
}

.season-dropdown-button:hover {
    background: #353434;
}

.dropdown-arrow {
    font-size: 0.7rem;
    transition: transform 0.2s ease;
}

.dropdown-arrow.open {
    transform: rotate(180deg);
}

.season-dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    z-index: 100;
    background: #2b2a2a;
    border: 1px solid #666;
    border-top: none;
}

.season-dropdown-menu button {
    display: block;
    width: 100%;
    padding: 12px 15px;
    background: transparent;
    color: white;
    border: none;
    text-align: left;
    cursor: pointer;
    font-size: 1rem;
}

.season-dropdown-menu button:hover {
    background: #444;
}

.season-dropdown-menu button.selected {
    background: var(--tg4-pink);
}

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

/* --------------------------------
   HERO
-------------------------------- */
.episode-hero {
    position: relative;
    width: 100%;
    height: 810px;
    overflow: hidden;
}

.hero-image {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

/* Dark gradient over image */
.hero-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: flex-end;
    padding: 70px;
    background:
        linear-gradient(
            to top,
            rgba(0,0,0,.85) 0%,
            rgba(0,0,0,.45) 35%,
            rgba(0,0,0,0) 70%
        );
    color: white;
}

.hero-content {
    max-width: 650px;
}

.hero-content h1 {
    margin: 0 0 15px;
    font-size: 3.5rem;
    line-height: 1.05;
}

.hero-content p {
    margin: 0 0 25px;
    font-size: 1.2rem;
    line-height: 1.5;
}

/* --------------------------------
   BUTTONS
-------------------------------- */
.hero-buttons {
    display: flex;
    gap: 12px;
}

.play-button, .back-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 12px 26px;
    text-decoration: none;
    font-weight: 700;
    transition: transform .2s ease, background .2s ease;
}

.play-button {
    background: white;
    color: #2b2a2a;
}

.back-button {
    background: var(--tg4-pink);
    color: white;
}

.play-button:hover, .back-button:hover {
    transform: translateY(-2px);
}

/* --------------------------------
   EPISODES
-------------------------------- */
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

.episodes > h2 {
    margin: 0 0 25px;
}

.episode-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 20px;
}

.episode {
    min-width: 0;
}

.episode-image {
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
    display: block;
}

.episode-info {
    padding: 15px 0;
}

.episode-info h3 {
    margin: 0 0 8px;
    font-size: 1.1rem;
}

.episode-info p {
    margin: 0 0 8px;
}

.episode-media {
    position: relative;
}

.play-icon {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 40px;
    height: 40px;
    transition: transform .2s ease;
}

.episode:hover .play-icon {
    transform: scale(1.1);
}

/* --------------------------------
   MOBILE
-------------------------------- */
@media (max-width: 900px) {
    .episode-hero {
        height: 650px;
    }
    .hero-overlay {
        padding: 40px;
    }
    .hero-content h1 {
        font-size: 2.8rem;
    }
}

@media (max-width: 600px) {
    .episode-hero {
        height: 500px;
    }
    .hero-overlay {
        padding: 25px;
    }
    .hero-content h1 {
        font-size: 2.2rem;
    }
    .hero-content p {
        font-size: 1rem;
    }
    .episode {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 1200px) {
    .episode-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
}

@media (max-width: 800px) {
    .episode-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (max-width: 500px) {
    .episode-grid {
        grid-template-columns: 1fr;
    }
}
</style>

<!-- <pre>
    {JSON.stringify(data.episodes, null, 2)}
</pre> -->