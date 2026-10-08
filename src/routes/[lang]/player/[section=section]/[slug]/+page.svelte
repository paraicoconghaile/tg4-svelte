<script lang="ts">
    let { data } = $props();
    let isIrish = $derived(data.lang === 'ga');
    let selectedSeason = $state(data.seasons[0]);
    let seasonDropdownOpen = $state(false);
    let visibleEpisodes = $state(8);
    import { withBase } from '$lib/utils/paths';

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

    //console.log("Data", JSON.stringify(data, null, 2));
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
                    
                <p>{data.series.series.subtitles} {data.series.series.contentRating}</p>

                <div class="hero-buttons">
                    <div class="hero-button">
                        <a class="hero-button-icon" href={withBase(`/${data.lang}/player/${data.slug}/`)}>
                            <svg width="20" height="29" viewBox="0 0 20 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19.6164 14.3439L14.903 9.79771L0.020813 24.1602L4.73281 28.7076L19.6164 14.3439Z" fill="#2B2A2A"/>
                                <path d="M14.8835 18.9111L19.5942 14.3624L4.712 0L0 4.54743L14.8835 18.9111Z" fill="#2B2A2A"/>
                            </svg>
                        </a>

                        <a class="hero-button-text" href={withBase(`/${data.lang}/player/${data.slug}/`)}>
                            {data.lang === 'ga' ? 'Féach' : 'Watch now'}
                        </a>
                    </div>

                    <div class="hero-button">
                        <button class="hero-button-icon" type="button">
                            <svg width="27" height="26" viewBox="0 0 27 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8.9079 10.0013V25.6H15.6689V15.6169H23.5105L26.4 10.0013H8.9079Z" fill="#2B2A2A"/>
                                <path d="M15.6586 15.5987L15.6586 0L8.89755 5.64766e-07L8.89755 9.98315H0L5.13447e-07 15.5987L15.6586 15.5987Z" fill="#2B2A2A"/>
                            </svg>
                        </button>

                        <button class="hero-button-text" type="button">
                            {data.lang === 'ga' ? 'Bookmark' : 'Bookmark'}
                        </button>
                    </div>
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
                    <svg width="19" height="12" viewBox="0 0 19 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.1705 9.36227L19 2.62642L16.3295 0L9.5 6.73585L2.67045 0L0 2.62642L9.5 12L12.1705 9.36227Z" fill="white"/>
                    </svg>
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

                            <a href={withBase(`/${data.lang}/player/${data.slug}/${ep.episodeID}`)}>
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

                            <p>S{ep.seriesNumber} E{ep.episodeNumber}</p>

                            <p>{ep.episodeDescription}</p>
                        </div>
                    </article>
                {/each}
            </div>

            {#if visibleEpisodes < selectedSeason.episodes.length}
                <div class="load-more-trigger" bind:this={loadMoreTrigger}></div>
            {/if}
        </section>
    </section>
</section>

<!-- <pre>
    {JSON.stringify(data.episodes, null, 2)}
</pre> -->