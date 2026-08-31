<script lang="ts">
    import emblaCarouselSvelte from 'embla-carousel-svelte';
    import type { EmblaCarouselType } from 'embla-carousel';

    let emblaApi: EmblaCarouselType | undefined;

    const options = {
        loop: true,
        align: 'start',
        slidesToScroll: 1,
        containScroll: false
    };

    function previous() {
        emblaApi?.scrollPrev();
    }

    function next() {
        console.log(emblaApi?.selectedScrollSnap());
        emblaApi?.scrollNext();

        requestAnimationFrame(() => {
            console.log(emblaApi?.selectedScrollSnap());
        });
    }

    function onEmblaInit(event: CustomEvent) {
        emblaApi = event.detail;
        /* console.log("Slides:", emblaApi.slideNodes().length);
        console.log("Snaps:", emblaApi.scrollSnapList().length); */
    }

    let {
        rail,
        isIrish
    } = $props();

    //console.log(rail);
</script>

<section class="rail">
    <button class="arrow left" onclick={previous} aria-label="Previous programmes">‹</button>
    {#if rail.titleEn || rail.titleGa}
        <h2>{isIrish ? rail.titleGa : rail.titleEn}</h2>
    {/if}
    {#if rail.subtitleEn || rail.subtitleGa}
        <p>{isIrish ? rail.subtitleGa : rail.subtitleEn}</p>
    {/if}
    <div class="embla" use:emblaCarouselSvelte={options} onemblaInit={onEmblaInit}>
        <div class="embla__container">
            {#each rail.items as item}
                {@const image =
                    item.series.boxsetImage?.large ??
                    item.series.mainImage?.large ??
                    '/images/placeholder.jpg'
                }
                <div class="embla__slide">
                    <a href={`/${isIrish ? 'ga' : 'en'}/player/${item.series.slug}`}><img src={image} alt={item.series.name} />
                    <h3>{item.series.name}</h3></a>
                </div>
            {/each}
        </div>
    </div>
    <button class="arrow right" onclick={next} aria-label="Next programmes">›</button>
</section>

<style>
.rail {
    max-width: 1440px;
    margin: 20px auto;
    position: relative;
}

.arrow {
    position: absolute;
    top: 45%;
    transform: translateY(-50%);
    width: 48px;
    height: 48px;
    border: none;
    border-radius: 50%;
    background: rgba(0,0,0,.6);
    color: white;
    font-size: 2rem;
    cursor: pointer;
    z-index: 20;
}

.arrow:hover {
    background: rgba(0,0,0,.85);
}

.left {
    left: -20px;
}

.right {
    right: -20px;
}

.embla {
    overflow: hidden;
}

.embla__container {
    display: flex;
    gap: 6px;
}

.embla__slide {
    flex: 0 0 calc((100% - 18px) / 4);
    min-width: 0;
}

.embla__slide img {
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
    border-radius: 0px;
}

.embla__slide h3 {
    margin-top: 12px;
    font-size: 1rem;
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