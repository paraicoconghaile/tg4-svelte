<script lang="ts">
    import CardCarouselPortrait from '$lib/components/rails/CardCarouselPortrait.svelte';
    import CardCarousel from '$lib/components/rails/CardCarousel.svelte'
    import Marketing from '$lib/components/rails/Marketing.svelte';
    import DoubleContent from '$lib/components/rails/DoubleContent.svelte';
    import { withBase } from '$lib/utils/paths';
    import { genres } from '$lib/config/playerNav';
    import Seo from '$lib/components/seo/Seo.svelte';

  	let { data } = $props();
    let isIrish = $derived(data.lang === 'ga');

    let isDiscover = $derived(data.section === 'discover' || data.section === 'aimsigh');

    let series = $state(data.series ?? []);
    let loadingMore = $state(false);
    let hasMore = $state(true);
    let loadMoreTrigger = $state<HTMLDivElement>();

    let skip = $state(series.length);
    const limit = 24;

    let currentPage = $state(`${data.lang}/${data.section}`);

    $effect(() => {
        const page = `${data.lang}/${data.section}`;

        if (currentPage !== page) {
            currentPage = page;
            series = data.series ?? [];
            skip = series.length;
            hasMore = true;
        }
    });

    async function loadMoreSeries() {
        if (loadingMore || !hasMore) return;

        loadingMore = true;

        try {
            const response = await fetch(withBase(`/api/genre-series?category=${encodeURIComponent(data.genre)}&skip=${skip}&limit=${limit}`));

            if (!response.ok) {
                throw new Error(`Failed to load series: ${response.status}`);
            }

            const result = await response.json();
            const existingSlugs = new Set(series.map((item) => item.slug));
            const newSeries = result.series.filter(
                (item) => !existingSlugs.has(item.slug)
            );

            series = [...series, ...newSeries];
            skip += result.series.length;
            hasMore = result.hasMore && result.series.length > 0;
        } catch (error) {
            console.error('Error loading more series:', error);
        } finally {
            loadingMore = false;
        }
    }

    $effect(() => {
        const trigger = loadMoreTrigger;
        const page = `${data.lang}/${data.section}`;

        if (!trigger || !hasMore || isDiscover) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    loadMoreSeries();
                }
            },
            { rootMargin: '400px' }
        );

        observer.observe(trigger);

        return () => observer.disconnect();
    });

    function getImageUrl(item: any) {
        return (
            item.programme?.heroImage?.large ||
            item.programme?.heroImage?.thumbnail ||
            item.programme?.poster ||
            'https://res.cloudinary.com/tg4/image/upload/w_700,h_395,g_faces,c_fill,f_auto,q_auto/000000.jpg'
        );
    }

    //console.log("Section Data", JSON.stringify(data, null, 2));
    //console.log('GENRE RAILS API:', data.rails);
</script>

{#if isDiscover}
    <Seo
        title={isIrish ? 'Aimsigh | TG4' : 'Discover | TG4'}
        description={isIrish
            ? 'Aimsigh cláir ar an TG4 Player.'
            : 'Discover programmes on the TG4 Player.'}
        canonicalUrl={`https://www.tg4.ie/${data.lang}/player/${data.section}/`}
        imageUrl="https://dxbg10xwynl92.cloudfront.net/cf-static/images/TG4_2024_corcra_teal_1-1920x1080-1.jpg"
        lang={data.lang}
    />
{:else}
    <Seo
        title={`${isIrish ? data.labelGa : data.labelEn} | TG4`}
        description={isIrish
            ? `${data.labelGa} ar an TG4 Player.`
            : `${data.labelEn} on the TG4 Player.`}
        canonicalUrl={`https://www.tg4.ie/${data.lang}/player/${data.section}/`}
        imageUrl="https://dxbg10xwynl92.cloudfront.net/cf-static/images/TG4_2024_corcra_teal_1-1920x1080-1.jpg"
        lang={data.lang}
    />
{/if}

{#if isDiscover}
    <section class="discover-page">
        <section class="episodes">
            <h1>{isIrish ? 'Aimsigh' : 'Discover'}</h1>

            <div class="discover-categories">
                {#each genres as genre}
                    <a
                        class="discover-category"
                        href={withBase(`/${data.lang}/player/${genre.key[data.lang]}`)}
                    >
                        {genre.label[data.lang]}
                    </a>
                {/each}
            </div>
        </section>
    </section>
{/if}

<!-- CATEGORY RAILS -->
{#each data.rails?.rails ?? [] as rail}
    {#if rail.type === 'HORIZONTAL' && rail.showItemsAsBoxset}
        <CardCarouselPortrait {rail} {isIrish} showCategoryOnSeries={rail.showCategoryOnSeries} />
    {:else if  rail.type === 'HORIZONTAL'}
        <CardCarousel {rail} {isIrish} showCategoryOnSeries={rail.showCategoryOnSeries} />
    {:else if rail.type === 'DOUBLE_CONTENT'}
        <DoubleContent {rail} {isIrish} />
    {:else if rail.type === 'MARKETING'}
        <Marketing {rail} {isIrish} />
    {/if}
{/each}

{#if !isDiscover}
    <section class="series-page">
        <section class="episodes">
            <h1>{data.lang === 'ga' ? data.labelGa : data.labelEn}</h1>

            <div class="series-grid">
                {#each series as item (item.slug)}
                    <a aria-label={isIrish ? 'Féach' : 'Watch Now'} class="series-card" href={withBase(`/${data.lang}/player/${item.slug}`)}>
                        <img src={getImageUrl(item)} alt={item.title} onerror={(e) => {e.currentTarget.src = 'https://res.cloudinary.com/tg4/image/upload/w_700,h_395,g_faces,c_fill,f_auto,q_auto/000000.jpg';}}/>
                        <h3>{item.title}</h3>
                        <!-- <p>{item.description}</p> -->
                    </a>
                {/each}
            </div>

            {#if hasMore}
                <div bind:this={loadMoreTrigger} class="load-more-trigger">
                    {#if loadingMore}
                        <p>{isIrish ? 'Ag lódáil...' : 'Loading more...'}</p>
                    {/if}
                </div>
            {/if}
        </section>
    </section>
{/if}

<style>
.discover-page {
    max-width: var(--page-width);
    margin: 0 auto;
    padding: 20px;
    background-color: var(--genre-background);
}

.discover-categories {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
}

.discover-category {
    display: flex;
    align-items: center;
    min-height: 64px;
    padding: 12px 16px;
    background: var(--tg4-grey-2);
    color: var(--text-primary);
    text-decoration: none;
    font-weight: 600;
    transition: background-color 0.2s ease;
}

.discover-category:hover,
.discover-category:focus-visible {
    background-color: var(--tg4-pink);
}

.series-page {
    max-width: var(--page-width);
    margin: 0 auto;
    padding: 20px;
    background-color: var(--genre-background);
}

.series-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 6px;
}

.series-card {
    text-decoration: none;
    color: var(--text-primary);
}

.series-card img {
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
    display: block;
}

.series-card h3 {
    margin-top: 12px;
    font-size: 1.1rem;
}

.load-more-trigger {
    min-height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
}

@media(max-width:1000px) {
    .series-grid {
        grid-template-columns: repeat(3,1fr);
    }
}

@media (max-width: 900px) {
    .discover-categories {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media(max-width:700px) {
    .series-grid {
        grid-template-columns: repeat(2,1fr);
    }
}

@media(max-width:550px) {
    .series-page {
        padding: 10px 0;
    }

    .episodes {
        padding: 10px 7px;
    }

    .discover-page {
        padding: 10px 7px;
    }

    .discover-categories {
        gap: 8px;
    }

    .discover-category {
        min-height: 56px;
        padding: 10px;
    }
}

@media(max-width:450px){
    .series-grid {grid-template-columns: 1fr;}
}
</style>

<!-- <pre>
	{JSON.stringify(data, null, 2)}
</pre> -->