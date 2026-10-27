<script lang="ts">
    import emblaCarouselSvelte from 'embla-carousel-svelte';
    import type { EmblaCarouselType } from 'embla-carousel';
    import { withBase } from '$lib/utils/paths';
    import { railGlyphs } from '$lib/utils/railGlyphs';
    import { categoryLabels } from '$lib/config/categoryLabels';

    let emblaApi: EmblaCarouselType | undefined;

    const options = {
        loop: false,
        align: 'start',
        slidesToScroll: 1,
        containScroll: 'trimSnaps'
    };

    function previous() {
        emblaApi?.scrollPrev();
    }

    function next() {
        //console.log('Selected Next 1:', emblaApi?.selectedScrollSnap());
        emblaApi?.scrollNext();

        /* requestAnimationFrame(() => {
            console.log('Selected:', emblaApi?.selectedScrollSnap());
        }); */
    }

    function onEmblaInit(event: CustomEvent) {
        emblaApi = event.detail;

        /* requestAnimationFrame(() => {
            console.log('=== EMBLA DEBUG ===');

            console.log(
                'Carousel width:',
                emblaApi?.rootNode().clientWidth
            );

            console.log(
                'Container width:',
                emblaApi?.containerNode().scrollWidth
            );

            console.log(
                'Slide widths:',
                emblaApi?.slideNodes().map(
                    slide => slide.getBoundingClientRect().width
                )
            );

            console.log(
                'Slide positions:',
                emblaApi?.slideNodes().map(
                    slide => slide.getBoundingClientRect().left
                )
            );

            console.log(
                'Snaps:',
                emblaApi?.scrollSnapList()
            );

            console.log(
                'Selected:',
                emblaApi?.selectedScrollSnap()
            );

            console.log('===================');
        }); */
    }

    let {
        rail,
        isIrish,
        showCategoryOnSeries = false
    } = $props();

    function getCategoryLabel(rawCategory: string | null | undefined) {
        if (!rawCategory) return '';

        const category = categoryLabels[rawCategory];

        if (!category) return rawCategory;

        return isIrish ? category.ga : category.en;
    }

    /* $effect(() => {
        console.log('Rail glyph:', rail.backgroundGlyph);
        console.log('Glyph URL:', glyphUrl);
        console.log('Glyph position:', glyphPosition);
    }); */

    let glyphUrl = $derived(
        rail.backgroundGlyph
            ? railGlyphs[rail.backgroundGlyph]
            : undefined
    );

    let glyphPosition = $derived(
        (rail.backgroundGlyphPosition ?? 'BOTTOM_MIDDLE')
            .toLowerCase()
            .replaceAll('_', '-')
    );

    /* console.log('========== CARD RAIL JSON ==========');
    console.log("Card Rail Data:", JSON.stringify(rail, null, 2));
    console.log('================================'); */
</script>

<section
    class:boxset-rail={rail.showItemsAsBoxset}
    class="rail"
    style:--rail-background={rail.backgroundColor ?? 'var(--tg4-grey-2)'}
    style:--rail-text={rail.textColor ?? 'inherit'}
>
    {#if glyphUrl}
        <div
            class={`rail-glyph glyph-${glyphPosition}`}
            style:--glyph-url={`url("${glyphUrl}")`}
            style:--glyph-color={rail.backgroundGlyphColor ?? 'transparent'}
            aria-hidden="true"
        ></div>
    {/if}

    <div class="rail-heading">
        {#if rail.titleEn || rail.titleGa}
            <h2>{isIrish ? rail.titleGa : rail.titleEn}</h2>
        {/if}
        {#if rail.subtitleEn || rail.subtitleGa}
            <p>{isIrish ? rail.subtitleGa : rail.subtitleEn}</p>
        {/if}
    </div>

    <div class="carousel-wrapper">
        <button class="arrow left" onclick={previous} aria-label="Previous programmes">‹</button>
        <div class="embla" use:emblaCarouselSvelte={{options}} onemblaInit={onEmblaInit}>
            <div class="embla__container">
                {#each rail.items as item}
                    {@const isSeries = item.type === 'SERIES'}
                    {@const content = isSeries ? item.series : item.video}

                    {@const image = rail.showItemsAsBoxset
                        ? (content.boxsetImage?.original ?? content.image?.original)
                        : (content.mainImage?.large ?? content.image?.large)
                    }

                    {@const name = isSeries ? content.name : content.displayTitle}

                    <div class="embla__slide">
                        {#if isSeries}
                            <a href={withBase(`/${isIrish ? 'ga' : 'en'}/player/${content.slug}`)}>
                                <img src={image || 'https://res.cloudinary.com/tg4/image/upload/w_700,h_395,g_faces,c_fill,f_auto,q_auto/000000.jpg'} alt={name}
                                    onerror={(event) => {
                                        const img = event.currentTarget;

                                        if (!img.dataset.fallback) {
                                            img.dataset.fallback = 'true';
                                            img.src = 'https://res.cloudinary.com/tg4/image/upload/w_700,h_395,g_faces,c_fill,f_auto,q_auto/000000.jpg';
                                        }
                                    }}
                                />
                                <h3>{content.name}</h3>
                                {#if showCategoryOnSeries && content.rawCategory}
                                    <p class="series-category">
                                        {getCategoryLabel(content.rawCategory)}
                                    </p>
                                {/if}
                            </a>
                        {:else}
                            <!-- Keep your existing VIDEO URL here -->
                            <a href={withBase(`/${isIrish ? 'ga' : 'en'}/player/${content.vid}`)}>
                                <img src={image} alt={name} />
                                {#if content.seriesTitle === content.displayTitle}
                                    <h3>{content.seriesTitle}</h3>
                                    <p>
                                    {#if content.seasonNumber}
                                        S{content.seasonNumber}
                                    {/if}
                                    {#if content.episodeNumber}
                                        E{content.episodeNumber}
                                    {/if}</p>
                                {:else}
                                    <h3>{content.seriesTitle}</h3>
                                    <p>
                                    {#if content.seasonNumber}
                                        S{content.seasonNumber}
                                    {/if}
                                    {#if content.episodeNumber}
                                        E{content.episodeNumber}
                                    {/if}
                                    {#if content.displayTitle}
                                        : {content.displayTitle}
                                    {/if}</p>
                                {/if}
                            </a>
                        {/if}
                    </div>
                {/each}
            </div>
        </div>
        <button class="arrow right" onclick={next} aria-label="Next programmes">›</button>
    </div>
</section>

<style>
.rail {
    max-width: var(--page-width);
    margin: 0 auto;
    position: relative;
    isolation: isolate;
    background-color: var(--rail-background, var(--tg4-grey-2));
    color: var(--rail-text, inherit);
    padding: 30px 0 20px;
}

.rail-heading {
    margin-left: 55px;
}

.rail-heading h2 {
    margin: 0 0 15px;
    font-size: clamp(1.5rem, 2.5vw, 2.5rem);
    font-weight: 400;
}

.rail-heading p {
    margin: 0 0 20px;
    font-size: clamp(1rem, 1.5vw, 1.5rem);
    font-weight: 400;
}

.rail-glyph {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;

    background-color: var(--glyph-color, transparent);

    -webkit-mask-image: var(--glyph-url);
    mask-image: var(--glyph-url);
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
    -webkit-mask-size: auto 100%;
    mask-size: auto 100%;
}

.rail-heading,
.carousel-wrapper {
    position: relative;
    z-index: 1;
}

.glyph-bottom-middle {
    -webkit-mask-position: center bottom;
    mask-position: center bottom;
}

.glyph-bottom-left {
    -webkit-mask-position: left bottom;
    mask-position: left bottom;
}

.glyph-bottom-right {
    -webkit-mask-position: right bottom;
    mask-position: right bottom;
}

.glyph-middle-left {
    -webkit-mask-position: left center;
    mask-position: left center;
}

.glyph-middle-right {
    -webkit-mask-position: right center;
    mask-position: right center;
}

.glyph-top-middle {
    -webkit-mask-position: center top;
    mask-position: center top;
}

.carousel-wrapper {
    display: flex;
    align-items: center;
    gap: 10px;
}

.series-category {
    margin-top: 4px;
    font-size: 0.85rem;
    opacity: 0.8;
}

.arrow {
    flex: 0 0 45px;
    width: 45px;
    height: 45px;
    border: none;
    border-radius: 50%;
    background: rgba(0,0,0,.6);
    color: white;
    font-size: 2rem;
    cursor: pointer;
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: -40px
}

.arrow:hover {
    background: rgba(0,0,0,.85);
}

.embla {
    width: 1330px;
    overflow: hidden;
}

.embla__container {
    display: flex;
}

.embla__slide {
    flex: 0 0 calc(16% + 9px);
    min-width: 0;
    padding-right: 6px;
}

.embla__slide img {
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
    display: block;
}

/* Boxset / portrait images */
.boxset-rail .embla__slide img {
    aspect-ratio: 5 / 7;
}

.embla__slide h3 {
    margin: 15px 0 0;
    font-size: clamp(1rem, 1.5vw, 1.25rem);
    font-weight: 700;
}

@media (max-width:900px) {
    .embla__slide{
        flex: 0 0 calc(25% - 0px);
    }
}

@media (max-width: 700px) {
    .embla__slide {
        flex: 0 0 calc(34% - 0px);
    }
}

@media (max-width: 550px) {
    .boxset-rail .embla__slide img {
        aspect-ratio: 4 / 5;
    }

    .rail {
        width: 100%;
        max-width: none;
        padding: 20px 0 10px 8px;
    }

    .rail-heading {
        margin-left: 0;
        margin-right: 15px;
    }

    .carousel-wrapper {
        display: block;
    }

    .arrow {
        display: none;
    }

    .embla {
        width: 100%;
        overflow: hidden;
    }

    .embla__slide {
        flex: 0 0 58%;
        padding-right: 8px;
        box-sizing: border-box;
    }
}
</style>