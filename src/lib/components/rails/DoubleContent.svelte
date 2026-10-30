<script lang="ts">
    import { withBase } from '$lib/utils/paths';
    import { railGlyphs } from '$lib/utils/railGlyphs';

    let {
        rail,
        isIrish
    } = $props();

    const glyphUrl = $derived(
        rail.backgroundGlyph
            ? railGlyphs[rail.backgroundGlyph]
            : undefined
    );

    const glyphPosition = $derived(
        rail.backgroundGlyphPosition
            ?.toLowerCase()
            .replaceAll('_', '-') ?? 'middle-right'
    );

    $effect(() => {
        console.log('=== DOUBLE CONTENT GLYPH DEBUG ===');
        console.log('Background glyph:', rail.backgroundGlyph);
        console.log('Glyph URL:', glyphUrl);
        console.log('Glyph position:', glyphPosition);
    });
</script>

<section class="double-content">
    <!-- Intro -->
    <div class="intro" style={`background:${rail.backgroundColor}; color:${rail.textColor};`}>
        {#if glyphUrl}
            <div
                class={`rail-glyph glyph-${glyphPosition}`}
                style:--glyph-url={`url("${glyphUrl}")`}
                style:--glyph-color={rail.backgroundGlyphColor ?? 'transparent'}
                aria-hidden="true"
            ></div>
        {/if}

        <div class="intro-content">
            <h2>{isIrish ? rail.titleGa : rail.titleEn}</h2>
            <p>{isIrish ? rail.subtitleGa : rail.subtitleEn}</p>
        </div>
    </div>

    {#each rail.items as item}
        {@const content = item.type === 'SERIES' ? item.series : item.video}

        {@const hasBoxsetImage = !!item.series?.boxsetImage?.large}

        {@const image = item.type === 'SERIES'
            ? content.boxsetImage?.large ?? content.mainImage?.large
            : content.image?.large}

        {@const title = content.name}

        {@const href = item.type === 'SERIES'
            ? `/${isIrish ? 'ga' : 'en'}/player/${content.slug}`
            : `/${isIrish ? 'ga' : 'en'}/player/${content.vid}`}

        <a class="content-card" href={withBase(href)}>
            <img src={image} alt={title} />

            {#if item.type === 'SERIES' && !hasBoxsetImage}
                <div class="content-title">
                    <h3>{content.name}</h3>
                </div>
            {/if}

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

    {/each}
</section>

<style>
.double-content {
    position: relative;
    isolation: isolate;
    max-width: var(--page-width);
    min-height: 400px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    gap: 5px;
}

/* Background glyph */
.rail-glyph {
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;

    background-color: var(--glyph-color, transparent);

    -webkit-mask-image: var(--glyph-url);
    mask-image: var(--glyph-url);

    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;

    -webkit-mask-size: auto 100%;
    mask-size: auto 100%;

    -webkit-mask-position: right center;
    mask-position: right center;
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

.intro,
.content-card {
    position: relative;
    z-index: 1;
}

.intro-content {
    position: relative;
    z-index: 1;
}

.content-title {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px;
    box-sizing: border-box;
    color: white;
    text-align: center;
    background: rgba(0, 0, 0, 0.25);
}

.content-title h3 {
    margin: 0;
    font-size: 2rem;
    font-weight: 700;
}

.content-card img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.content-card:hover .play-box {
    transform: scale(1.1);
    background: var(--tg4-pink);
}

.intro p {
    max-width: 50%;
}

@media (max-width:900px) {
    .double-content {
        min-height: 344px;
        grid-template-columns: 1fr 25% 25%;
    }
    .intro p {
        max-width: 80%;
    }
}

@media (max-width: 600px) {
    .play-box {
        width: 34px;
        height: 34px;
    }
}

@media (max-width: 500px) {
    .double-content {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        min-height: auto;
        gap: 5px;
    }

    .intro {
        grid-column: 1 / -1;
        grid-row: 1;
        padding: 20px;
    }

    .double-content > a:nth-child(2) {
        grid-column: 1;
        grid-row: 2;
        min-height: 250px;
    }

    .double-content > a:nth-child(3) {
        grid-column: 2;
        grid-row: 2;
    }
}

/* @media(max-width:450px) {
    .double-content {
        grid-template-columns: 1fr 81px 81px;
    }
    .intro {
        padding: 20px;
    }
} */
</style>