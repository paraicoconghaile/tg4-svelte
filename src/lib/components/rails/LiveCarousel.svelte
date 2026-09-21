<script lang="ts">
    import emblaCarouselSvelte from 'embla-carousel-svelte';
    import type { EmblaCarouselType } from 'embla-carousel';
    import irelandFlag from '$lib/assets/icons/irl_icon.svg';
    import { onMount } from 'svelte';
    import { invalidateAll } from '$app/navigation';

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
        isIrish,
        showNext = true
    } = $props();

    let streams = $state(
        rail.items.map((item: any) => item.stream)
    );

    let progressKey = $state(0);

    $effect(() => {
        streams = rail.items.map((item: any) => item.stream);
    });

    function formatTime(dateString: string) {
        return new Date(dateString).toLocaleTimeString(
            isIrish ? 'ga-IE' : 'en-IE',
            {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }
        );
    }

    function getProgress(show: any) {
        const start = new Date(show.startTime).getTime();
        const end = new Date(show.endTime).getTime();
        const now = Date.now();

        const duration = end - start;
        const elapsed = now - start;

        return Math.min(
            Math.max((elapsed / duration) * 100, 0),
            100
        );
    }

    function scheduleNextShow(stream: any) {
        const endTime = new Date(
            stream.currentShow.endTime
        ).getTime();

        const delay = endTime - Date.now();

        setTimeout(async () => {
            //console.log('Refreshing live data');
            await invalidateAll();
        }, Math.max(delay, 0));
    }

    onMount(() => {
        streams
            .filter(
                (stream: any) =>
                    stream.state === 'ONAIR' &&
                    stream.currentShow
            )
            .forEach((stream: any) => {
                scheduleNextShow(stream);
        });

        async function handleVisibilityChange() {
            //console.log('Visibility:', document.visibilityState);

            if (document.visibilityState === 'visible') {
                //console.log('Refreshing live data');

                await invalidateAll();
                progressKey++;

                //console.log('Rail after refresh:', rail);
                //console.log('Streams after refresh:', streams);
            }
        }

        document.addEventListener(
            'visibilitychange',
            handleVisibilityChange
        );

        return () => {
            document.removeEventListener(
                'visibilitychange',
                handleVisibilityChange
            );
        };
    });
</script>

<section class="rail">
    {#if rail.titleEn || rail.titleGa || rail.subtitleEn || rail.subtitleGa}
        <div class="rail-heading">
            {#if rail.titleEn || rail.titleGa}
                <h2>{isIrish ? rail.titleGa : rail.titleEn}</h2>
            {/if}
            {#if rail.subtitleEn || rail.subtitleGa}
                <p>{isIrish ? rail.subtitleGa : rail.subtitleEn}</p>
            {/if}
        </div>
    {/if}

    <div class="carousel-wrapper">
        <button class="arrow left" onclick={previous} aria-label="Previous live channels">‹</button>
        <div class="embla" use:emblaCarouselSvelte={{options}} onemblaInit={onEmblaInit}>
            <div class="embla__container">
                <!-- {#each rail.items as item}
                    {@const stream = item.stream} -->
                {#each streams.filter((stream: any) => stream.state === 'ONAIR' && stream.currentShow) as stream}
                    {@const show = stream.currentShow}
                    {@const nextshow = stream.nextShow}

                    <div class="embla__slide">
                        <a class="live-card" href={`/${isIrish ? 'ga' : 'en'}/player/live/${stream.stream}`}>
                            <div class="live-image">
                                <img src={stream.logoUrl} alt={stream.stream} />
                                {#key `${show.startTime}-${progressKey}`}
                                    <div class="progress-track">
                                        <div class="progress-bar"  style={`width: 100%; animation-duration: ${new Date(show.endTime).getTime() - new Date(show.startTime).getTime()}ms; animation-delay: -${Date.now() - new Date(show.startTime).getTime()}ms;`}></div>
                                    </div>
                                {/key}
                            </div>

                            <!-- <div class="live-status">
                                <span class="live-dot"></span>
                                {isIrish ? 'BEO' : 'LIVE'}
                            </div> -->

                            <div class="programme">
                                <h3>
                                    {show.title}

                                    {#if show.availability === 'IRELAND_ONLY'}
                                        <span class="ireland-flag">
                                            <img src={irelandFlag} alt="Ireland only" />
                                        </span>
                                    {/if}
                                </h3>

                                <p>{formatTime(show.startTime)} – {formatTime(show.endTime)}</p>

                                <!-- <span class="time">
                                    {formatTime(show.startTime)}
                                    –
                                    {formatTime(show.endTime)}
                                </span> -->
                            </div>
                            {#if showNext && nextshow?.title}
                                <div class="nextprogramme">
                                    <p>{isIrish ? 'Ag teacht:' : 'Next'} {nextshow.title}</p>
                                </div>
                            {/if}
                        </a>
                    </div>
                {/each}
            </div>
        </div>
        <button class="arrow right" onclick={next} aria-label="Next live channels">›</button>
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
    background: rgba(0,0,0,.6);
    color: white;
    font-size: 2rem;
    cursor: pointer;
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: -105px
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
    flex: 0 0 25%;
    min-width: 0;
    padding-right: 6px;
}

/* Live card */
.live-card {
    position: relative;
    display: block;
    box-sizing: border-box;
    background: #2B2A2A;
    color: white;
    text-decoration: none;
    overflow: hidden;
}

.live-image {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
    background: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

.live-image img {
    width: 60%;
    height: 60%;
    object-fit: contain;
    display: block;
}

.progress-track {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 5px;
    background: rgba(255, 255, 255, .25);
}

.progress-bar {
    width: 100%;
    height: 100%;
    background: var(--tg4-pink);
    transform-origin: left;
    animation-name: live-progress;
    animation-timing-function: linear;
    animation-fill-mode: both;
}

@keyframes live-progress {
    from {
        transform: scaleX(0);
    }
    to {
        transform: scaleX(1);
    }
}

.live-status {
    display: flex;
    align-items: center;
    gap: 7px;
    margin-top: 25px;
    font-size: .85rem;
    font-weight: 700;
}

.live-dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: red;
}

.programme {
    margin-top: 10px;
}

.nextprogramme {
    margin-top: 5px;
}

.programme h3 {
    margin: 0 0 8px;
    font-size: clamp(1.1rem, 1.5vw, 1.4rem);
}

.programme p {
    margin: 0 0 10px;
    font-size: .95rem;
    font-weight: 700;
}

.nextprogramme p {
    margin: 0;
    font-size: .95rem;
    font-weight: 400;
}

.time {
    font-size: .9rem;
}

.ireland-flag {
    display: inline-flex;
    margin-left: 8px;
}

.ireland-flag img {
    width: 20px;
    height: 20px;
    display: block;
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