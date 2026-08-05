<script lang="ts">
    const {
        rail,
        isIrish
    }: {
        rail: any;
        isIrish: boolean;
    } = $props();

    let current = $state(1);

    function next() {
        if (current < rail.items.length - 1) {
            current++;
        }
    }

    function previous() {
        if (current > 0) {
            current--;
        }
    }
</script>

<section class="carousel">
    {#if rail.titleEn || rail.titleGa}
        <h2 class="rail-title">
            {isIrish ? rail.titleGa : rail.titleEn}
        </h2>
    {/if}

    <div class="carousel-container">
        <button class="arrow left" onclick={previous} aria-label="Previous"> ‹ </button>
        <div class="viewport">
            <div class="track" style={`transform: translateX(calc(50% - ${current} * 78% - ${current} * 6px));`}>
                {#each rail.items as item, index}
                    {@const image =
                        item.series.mainImage?.large ??
                        item.series.boxsetImage?.large ??
                        '/images/placeholder.jpg'
                    }
                    <article class:active={current === index} class="slide">

                        <img src={image} alt={item.series.name} />

                        <div class="overlay">
                            <h2>{item.series.name}</h2>
                        </div>
                    </article>
                {/each}
            </div>
            <p>Slides: {rail.items.length}</p>
        </div>

        <button class="arrow right" onclick={next} aria-label="Next"> › </button>
    </div>
</section>

<style>
.carousel-container {
    position: relative;
}

.carousel {
    max-width: 1300px;
    margin: 0 auto;
    padding: 40px 20px;
}

.viewport {
    overflow: hidden;
}

.track {
    display: flex;
    gap: 6px;
    align-items: center;
    transition: transform .45s ease;
}

.slide {
    flex: 0 0 100px;
    height: 560px;
    position: relative;
    overflow: hidden;
    border-radius: 10px;
    background: #000;
    transition: flex-basis .45s ease;
}

.slide.active {
    flex-basis: 1000px;
}

.slide img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
}

.overlay {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 50px;
    color: white;
    background: linear-gradient(
        transparent,
        rgba(0,0,0,.85)
    );
}

.overlay h2 {
    margin-bottom: 15px;
}

.overlay p {
    width: 55%;
    line-height: 1.5;
}

/* Desktop/tablet scaling */
@media (max-width:1400px) {
    .slide.active {
        flex-basis: 75vw;
    }
}

/* Mobile */
@media (max-width:600px) {
    .slide {
        flex-basis: 50px;
    }
    .slide.active {
        flex-basis: 90vw;
    }
}
</style>