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
                tagline: isIrish
                    ? item.series.taglineGa
                    : item.series.taglineEn,
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
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;
    let isDragging = false;
    let hasSwiped = false;

    function handlePointerDown(event: PointerEvent) {
        startX = event.clientX;
        startY = event.clientY;
        currentX = startX;
        currentY = startY;
        isDragging = true;
        hasSwiped = false;

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
    }

    function handlePointerMove(event: PointerEvent) {
        if (!isDragging) return;

        currentX = event.clientX;
        currentY = event.clientY;

        const deltaX = currentX - startX;
        const deltaY = currentY - startY;

        if (
            Math.abs(deltaX) > 20 &&
            Math.abs(deltaX) > Math.abs(deltaY)
        ) {
            hasSwiped = true;
        }
    }

    function handlePointerUp() {
        if (!isDragging) return;

        isDragging = false;

        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);

        const deltaX = currentX - startX;
        const deltaY = currentY - startY;

        if (Math.abs(deltaX) < 50) return;
        if (Math.abs(deltaY) > Math.abs(deltaX)) return;

        if (deltaX < 0) {
            next();
        } else {
            previous();
        }
    }

    function handleClick(event: MouseEvent) {
        if (hasSwiped) {
            event.preventDefault();
            event.stopPropagation();
            hasSwiped = false;
        }
    }

    function getSlide(offset: number) {
        const index =
            (current + offset + slides.length) %
            slides.length;
        return slides[index];
    }

    function next() {
        if (animating) return;
        direction = 'next';
        animating = true;
        setTimeout(() => {
            current = (current + 1) % slides.length;
            animating = false;
        },450);
    }

    function previous() {
        if (animating) return;
        direction = 'prev';
        animating = true;
        setTimeout(() => {
            current = (current - 1 + slides.length) % slides.length;
            animating = false;
        },450);
    }
</script>

{#if slides.length === 1}
    <!-- Single image - no carousel -->
    <section class="carousel single-slide">
        <a class="single-hero" href={`/${isIrish ? 'ga' : 'en'}/player/${slides[0].slug}`}>
            <img src={slides[0].image} alt={slides[0].title}/>

            <div class="overlay">
                <h2>{slides[0].title}</h2>

                {#if slides[0].tagline}
                    <p>{slides[0].tagline}</p>
                {/if}
            </div>
            <div class="play-box">
                <svg
                    viewBox="18 0 38 56"
                    width="20"
                    height="28"
                    aria-hidden="true"
                >
                    <path d="M55.9383 27.9696L46.9742 19.3235L35.2362 30.6515L18.6702 46.6389L27.6318 55.2875L55.9383 27.9696Z" fill="#2B2A2A"/>
                    <path d="M46.9354 36.6571L55.8945 28.0061L44.1565 16.6781L27.5905 0.690705L18.6289 9.33929L46.9354 36.6571Z" fill="#2B2A2A"/>
                </svg>
            </div>
        </a>
    </section>
{:else if slides.length > 1}
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
            <div class="card hero" onpointerdown={handlePointerDown}>
                {#key current}
                    <a class="hero-card" href={`/${isIrish ? 'ga' : 'en'}/player/${getSlide(0).slug}`} onclick={handleClick}>
                        <div
                            in:fly={{
                                x: direction === 'next' ? 750 : -750,
                                duration: 350
                            }}
                            out:fly={{
                                x: direction === 'next' ? -750 : 750,
                                duration: 350
                            }}
                            class="hero-content"
                        >
                            <img src={getSlide(0).image} alt={getSlide(0).title} />
                            <div class="overlay">
                                <h2>{getSlide(0).title}</h2>
                                {#if slides[0].tagline}
                                    <p>{slides[0].tagline}</p>
                                {/if}
                            </div>
                        </div>
                        <div class="play-box">
                            <svg
                                viewBox="18 0 38 56"
                                width="20"
                                height="28"
                                aria-hidden="true"
                            >
                                <path d="M55.9383 27.9696L46.9742 19.3235L35.2362 30.6515L18.6702 46.6389L27.6318 55.2875L55.9383 27.9696Z" fill="#2B2A2A"/>
                                <path d="M46.9354 36.6571L55.8945 28.0061L44.1565 16.6781L27.5905 0.690705L18.6289 9.33929L46.9354 36.6571Z" fill="#2B2A2A"/>
                            </svg>
                        </div>
                    </a>
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

        <div class="pagination">
            {#each slides as _, index}
                <button
                    class:active={index === current}
                    onclick={() => {
                        if (index === current || animating) return;

                        direction = index > current ? 'next' : 'prev';
                        animating = true;

                        setTimeout(() => {
                            current = index;
                            animating = false;
                        }, 450);
                    }}
                    aria-label={`Go to slide ${index + 1}`}
                    aria-current={index === current ? 'true' : undefined}
                ></button>
            {/each}
        </div>
    </section>
{/if}

<style>
.single-hero {
    display: block;
    position: relative;
    aspect-ratio: 12 / 5;
    overflow: hidden;
}

.single-hero img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.carousel {
    width: min(1440px, 100%);
    margin: 0 auto;
    overflow: hidden;
    position: relative;
}

.stage {
    display: flex;
    gap: 6px;
    aspect-ratio: 12 / 5;   /* roughly 1440 × 600 */
    touch-action: pan-y;
    user-select: none;
    -webkit-user-select: none;
}

.stage img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    pointer-events: none;
    user-select: none;
    -webkit-user-drag: none;
}

.stage a {
    user-select: none;
    -webkit-user-drag: none;
}

.sliver {
    flex: 0 0 4%;
}

.hero {
    flex: 1;
}

.play-box {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 64px;
    height: 64px;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all .25s ease;
}

.play-box svg {
    width: 22px;
    height: 32px;
}

.hero-card:hover .play-box, .single-hero:hover .play-box {
    transform: scale(1.1);
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
    transition: opacity .45s ease;
}

.hero.changing img {
    opacity: .4;
}

.overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    padding: 40px;
    color: white;
    background: linear-gradient(
        rgba(0, 0, 0, .15),
        rgba(0, 0, 0, .45)
    );
}

.overlay h2 {
    font-size: clamp(2rem, 4vw, 3rem);
    margin: 0;
    font-weight: 700;
}

.overlay p {
    font-size: clamp(1rem, 2vw, 1.5rem);
    margin: 0;
    font-weight: 400;
}

@media (max-width: 600px) {
    .overlay p {
        display: none;
    }
}

.arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 20;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: none;
    background: rgba(0,0,0,.6);
    color: white;
    font-size: 32px;
    cursor: pointer;
}

.arrow:hover {
    background: rgba(0,0,0,.85);
}

.left {
    left: 20px;
}

.right {
    right: 20px;
}

.pagination {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 8px;
    z-index: 30;
}

.pagination button {
    width: 10px;
    height: 10px;
    padding: 0;
    border: none;
    border-radius: 0%;
    background: var(--tg4-pink);
    cursor: pointer;
    transition: all 0.25s ease;
}

.pagination button:hover {
    background: white;
}

.pagination button.active {
    width: 28px;
    border-radius: 0px;
    background: var(--tg4-pink);
}
</style>