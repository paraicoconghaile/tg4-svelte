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
        emblaApi?.scrollNext();
    }

    function onEmblaInit(event: CustomEvent) {
        emblaApi = event.detail;
    }

    let {
        rail,
        isIrish
    } = $props();
</script>

<section class="rail">
    <div class="rail-heading">
        {#if rail.titleEn || rail.titleGa}
            <h2>{isIrish ? rail.titleGa : rail.titleEn}</h2>
        {/if}

        {#if rail.subtitleEn || rail.subtitleGa}
            <p>{isIrish ? rail.subtitleGa : rail.subtitleEn}</p>
        {/if}
    </div>

    <div class="carousel-wrapper">
        <button
            class="arrow left"
            onclick={previous}
            aria-label="Previous"
        >
            ‹
        </button>

        <div
            class="embla"
            use:emblaCarouselSvelte={{options}}
            onemblaInit={onEmblaInit}
        >
            <div class="embla__container">

                {#each rail.luckyDipItems as item}
                    <div class="embla__slide">
                        <div class="lucky-dip-card">
                            <img
                                src={item.imageUrl}
                                alt={isIrish ? item.titleGa : item.titleEn}
                            />

                            <h3>
                                {isIrish ? item.titleGa : item.titleEn}
                            </h3>
                        </div>
                    </div>
                {/each}

            </div>
        </div>

        <button
            class="arrow right"
            onclick={next}
            aria-label="Next"
        >
            ›
        </button>
    </div>
</section>

<style>
.rail {
    max-width: var(--page-width);
    margin: 0 auto;
    position: relative;
    background-color: var(--tg4-grey-2);
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

.arrow {
    flex: 0 0 45px;
    width: 45px;
    height: 45px;
    border: none;
    border-radius: 50%;
    background: rgba(0, 0, 0, .6);
    color: white;
    font-size: 2rem;
    cursor: pointer;
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: -40px;
}

.arrow:hover {
    background: rgba(0, 0, 0, .85);
}

.embla {
    width: 1330px;
    overflow: hidden;
}

.embla__container {
    display: flex;
}

.embla__slide {
    flex: 0 0 25%;
    min-width: 0;
    padding-right: 6px;
}

.lucky-dip-card img {
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
    display: block;
}

.lucky-dip-card h3 {
    margin: 15px 0 0;
    font-size: clamp(1rem, 1.5vw, 1.25rem);
    font-weight: 700;
}

@media (max-width: 900px) {
    .embla__slide {
        flex: 0 0 50%;
    }
}

@media (max-width: 600px) {
    .embla__slide {
        flex: 0 0 100%;
    }
}
</style>