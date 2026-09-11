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

    //console.log("Series Data", JSON.stringify(data, null, 2));
</script>

<section class="episode-page">
    <!-- Hero -->
    <section class="episode-hero">
        <img class="hero-image" src={poster} alt={data.seriesTitle} />
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
                    
                <p>
                    {#each data.series.series.subtitles as subtitle}
                        <!-- <span class="subtitles-icon" title="Subtitles">CC</span> -->
                        <span class="languages">{getLanguageName(subtitle, data.lang)}</span>
                    {/each}
                    {#if data.series.series.contentRating}
                        <span class="content-rating">{data.series.series.contentRating}</span>
                    {/if}
                </p>

                <div class="hero-buttons">
                    <a class="watch-now">▶&nbsp; {data.lang === 'ga' ? 'Féach' : 'Watch now'}</a>
                </div>
            </div>
        </div>
    </section>

    <!-- Seasons -->
    <section class="episodes">
        <!-- Season selector -->
        <div class="season-selector">
            <button class="season-dropdown-button" onclick={() => seasonDropdownOpen = !seasonDropdownOpen}>
                <span>{data.lang === 'ga' ? `Sraith ${selectedSeason.seasonNumber}` : `Series ${selectedSeason.seasonNumber}`}</span>

                <span class:open={seasonDropdownOpen} class="dropdown-arrow">
                    ▼
                </span>
            </button>

            {#if seasonDropdownOpen}
                <div class="season-dropdown-menu">
                    {#each data.series.seasons as season}
                        <button class:selected={season.number === selectedSeason.seasonNumber} onclick={() => selectSeason(season)}>
                            {data.lang === 'ga' ? `Sraith ${season.number}` : `Series ${season.number}`}
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
                            <h3>{data.lang === 'ga' ? 'Eipeasóid' : 'Episode'} {ep.episodeNumber}</h3>

                            <p>
                                S{ep.seriesNumber}
                                E{ep.episodeNumber}
                                {#if ep.duration >= 3600}
                                    {Math.floor(ep.duration / 3600)}{data.lang === 'ga' ? 'h' : 'h'}
                                    {#if Math.floor((ep.duration % 3600) / 60) > 0}
                                        {Math.floor((ep.duration % 3600) / 60)}{data.lang === 'ga' ? 'm' : 'm'}
                                    {/if}
                                {:else}
                                    {Math.floor(ep.duration / 60)}{data.lang === 'ga' ? 'm' : 'm'}
                                {/if}
                            </p>

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

<!-- <pre>
    {JSON.stringify(data.episodes, null, 2)}
</pre> -->