<script lang="ts">
    import emblaCarouselSvelte from 'embla-carousel-svelte';
    import type { EmblaCarouselType } from 'embla-carousel';

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
        isIrish
    } = $props();

    /* console.log('========== CARD RAIL JSON ==========');
    console.log(JSON.stringify(rail, null, 2));
    console.log('================================'); */
</script>

<section class:boxset-rail={rail.showItemsAsBoxset} class="rail">
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
                    {@const image = rail.showItemsAsBoxset
                        ? item.series.boxsetImage?.original
                        : item.series.mainImage?.large
                    }
                    <div class="embla__slide">
                        <a href={`/${isIrish ? 'ga' : 'en'}/player/${item.series.slug}`}><img src={image} alt={item.series.name} />
                        <h3>{item.series.name}</h3></a>
                    </div>
                {/each}
            </div>
        </div>
        <button class="arrow right" onclick={next} aria-label="Next programmes">›</button>
    </div>
</section>

<style>
.rail {
    max-width: 1440px;
    margin: 0 auto;
    position: relative;
    background-color: #2B2A2A;
    padding: 30px 0 20px 0;
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

.carousel-wrapper {
    display: flex;
    align-items: center;
    gap: 10px;
}

/* 1330px carousel */
.embla {
    width: 1330px;
    overflow: hidden;
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

.embla__container {
    display: flex;
}

.embla__slide {
    flex: 0 0 25%;
    min-width: 0;
    padding-right: 6px;
}

/* .embla__slide {
    flex: 0 0 calc((100% - 18px) / 4);
    min-width: 0;
} */

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

@media (max-width:900px){
    .embla__slide{
        flex: 0 0 calc(50% - 10px);
    }
}

@media (max-width:600px){
    .embla__slide{
        flex: 0 0 100%;
    }
}
</style>