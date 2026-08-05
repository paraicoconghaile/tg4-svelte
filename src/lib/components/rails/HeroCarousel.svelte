<script lang="ts">
    import { fly } from 'svelte/transition';

    let {
        rail,
        isIrish
    }: {
        rail: any;
        isIrish: boolean;
    } = $props();

    const slides = $derived(
        rail.items
            .filter((item: any) => item.series)
            .map((item: any) => ({
                title: item.series.name,
                description: isIrish
                    ? item.series.descGa
                    : item.series.descEn,
                image:
                    item.series.mainImage?.large ??
                    item.series.boxsetImage?.large ??
                    "/images/placeholder.jpg",
                slug: item.series.slug,
                renderType: item.series.renderType,
                badge: item.series.badge
            }))
    );

    //console.log(slides);

    let current = $state(0);
    let direction = $state<'next' | 'prev' | null>(null);
    let animating = $state(false);

    function getSlide(offset: number) {
        const index =
            (current + offset + slides.length) %
            slides.length;
        return slides[index];
    }

    function next() {
        if (animating) return;
        animating = true;
        setTimeout(() => {
            current =
                (current + 1) %
                slides.length;
            animating = false;
        },450);
    }

    function previous() {
        if (animating) return;
        animating = true;
        setTimeout(() => {
            current =
                (current - 1 + slides.length) %
                slides.length;
            animating = false;
        },450);
    }
</script>


<section class="carousel">
    <button class="arrow left" onclick={previous}>‹</button>

    <div
        class:animating
        class:next-animation={direction === 'next'}
        class:prev-animation={direction === 'prev'}
        class="stage"
    >
        <!-- Previous -->
        <div class="card sliver">
            <img src={getSlide(-1).image} alt={getSlide(-1).title} />
        </div>

        <!-- Hero -->
        <!-- <div class="card hero" class:changing={animating}>
            <img src={getSlide(0).image} alt={getSlide(0).title} />
            <div class="overlay">
                <h1>
                    {getSlide(0).title}
                </h1>
                <p></p>
            </div>
        </div> -->

        <div class="card hero">
            {#key current}
                <div
                    in:fly={{ x: 750, duration: 350 }}
                    out:fly={{ x: -750, duration: 350 }}
                    class="hero-content"
                >
                    <a href={`/${isIrish ? 'ga' : 'en'}/player/${getSlide(0).slug}`}>
                        <img src={getSlide(0).image} alt={getSlide(0).title} />
                        <div class="overlay">
                            <h1>{getSlide(0).title}</h1>
                        </div>
                    </a>
                </div>
            {/key}
        </div>

        <!-- Next -->
        <div class="card sliver">
            <img src={getSlide(1).image} alt={getSlide(1).title} />
        </div>

        <!-- Next + 1 -->
        <div class="card sliver">
            <img src={getSlide(2).image} alt={getSlide(2).title} />
        </div>
    </div>

    <button class="arrow right" onclick={next}>›</button>
</section>

<style>
.carousel {
    width: min(1440px, 100%);
    margin: 0 auto;
    overflow: hidden;
}

.stage {
    display: flex;
    gap: 6px;
    aspect-ratio: 12 / 5;   /* roughly 1440 × 600 */
}

.sliver {
    flex: 0 0 7%;
}

.hero {
    flex: 1;
}

.card {
    position: relative;
    overflow: hidden;
}

.card img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.hero img {
    transition:opacity .45s ease;
}

.hero.changing img {
    opacity:.4;
}

.overlay {
    position:absolute;
    bottom:0;
    left:0;
    right:0;
    padding:60px;
    color:white;
    background:
        linear-gradient(
            transparent,
            rgba(0,0,0,.8)
        );
}

.overlay h1 {
    font-size: 3rem;
    margin: 0;
}

.overlay p {
    font-size:1.2rem;
    margin:0;
}

.arrow {
    position:absolute;
    top:50%;
    transform:translateY(-50%);
    z-index:20;
    width:50px;
    height:50px;
    border-radius:50%;
    border:none;
    background:rgba(0,0,0,.6);
    color:white;
    font-size:32px;
    cursor:pointer;
}

.arrow:hover {
    background:rgba(0,0,0,.85);
}

.left {
    left:20px;
}

.right {
    right:20px;
}
</style>