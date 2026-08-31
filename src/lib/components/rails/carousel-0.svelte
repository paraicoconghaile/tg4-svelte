<script lang="ts">
    import emblaCarouselSvelte from 'embla-carousel-svelte';
    import type { EmblaCarouselType } from 'embla-carousel';

    const { rail, isIrish } = $props();

    let emblaApi: EmblaCarouselType;

    function prev() {
        emblaApi?.scrollPrev();
    }

    function next() {
        emblaApi?.scrollNext();
    }
</script>

<section class="carousel">
    <button class="arrow left" onclick={() => emblaApi?.scrollPrev()}>‹</button>

    <div class="embla"
        use:emblaCarouselSvelte={{
            loop: true,
            align: 'center'
        }}
        onemblaInit={(e) => emblaApi = e.detail}>
        <div class="embla__container">
            {#each rail.items as item}
                {@const image =
                    item.series.mainImage?.large ??
                    item.series.boxsetImage?.large ??
                    "/images/placeholder.jpg"}
                <div class="embla__slide">
                    <img src={image} alt={item.series.name} />
                    <div class="overlay">
                        <h2>{item.series.name}</h2>
                        <p>{isIrish ? item.series.descGa : item.series.descEn}</p>
                    </div>
                </div>
            {/each}
        </div>
    </div>
    <button class="arrow right" onclick={() => emblaApi?.scrollNext()}>›</button>
</section>

<style>
.carousel {
    max-width:1300px;
    margin:auto;
    position:relative;
}

.embla {
    overflow:hidden;
    /* Creates the slivers */
    padding-left: 100px;
    padding-right: 200px;
}

.embla__container{
    display:flex;
    gap:6px;
}

.embla__slide{
    flex:0 0 100%;
    position:relative;
}

.embla__slide img{
    display: block;
    width: 100%;
    aspect-ratio: 16/9;
    object-fit: cover;
}

.overlay{
    position:absolute;
    left:0;
    right:0;
    bottom:0;
    padding:40px;
    color:white;
    background: linear-gradient(transparent, rgba(0,0,0,.8));
}
</style>