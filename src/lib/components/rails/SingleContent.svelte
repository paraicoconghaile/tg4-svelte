<script lang="ts">
    let {
        rail,
        isIrish
    } = $props();

    /* console.log('========== RAIL JSON ==========');
    console.log(JSON.stringify(rail, null, 2));
    console.log('================================'); */

    const item = rail.items?.[0];

    let image = '';
    let link = '#';
    let displayName = '';

    if (item?.type === 'VIDEO' && item.video) {
        const video = item.video;

        image = video.image?.xLarge
            ?? video.image?.large
            ?? video.poster
            ?? '';

        link = `/${isIrish ? 'ga' : 'en'}/player/${video.vid}`;
        displayName = video.displayName ?? '';

    } else if (item?.type === 'SERIES' && item.series) {
        const series = item.series;

        image = series.mainImage?.xLarge
            ?? series.mainImage?.large
            ?? series.poster
            ?? '';

        link = `/${isIrish ? 'ga' : 'en'}/player/${series.slug}`;
        displayName = series.name ?? '';
    }
</script>

<section class="single-content">
    <a class="single-card" href={link}>
        <img src={image} alt={displayName}/>

        <div class="play-box">
            <svg
                viewBox="18 0 38 56"
                width="20"
                height="28"
                aria-hidden="true"
            >
                <path d="M55.9383 27.9696L46.9742 19.3235L35.2362 30.6515L18.6702 46.6389L27.6318 55.2875Z" fill="#2B2A2A"/>
                <path d="M46.9354 36.6571L55.8945 28.0061L44.1565 16.6781L27.5905 0.690705L18.6289 9.33929L46.9354 36.6571Z" fill="#2B2A2A"/>
            </svg>
        </div>

        <div class="overlay">
            <h2>{isIrish ? rail.titleGa : rail.titleEn}</h2>
            <p>{isIrish ? rail.subtitleGa : rail.subtitleEn}</p>
        </div>
    </a>
</section>

<style>
.single-content {
    position: relative;
    max-width: var(--page-width);
    height: 500px;
    margin: 0 auto;
    overflow: hidden;
    border-radius: 0px;
}

.single-content img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.single-content::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, rgba(0,0,0,.75) 0%, rgba(0,0,0,.35) 40%, rgba(0,0,0,.05) 100%);
}

.overlay {
    position: absolute;
    left: 70px;
    bottom: 45%;
    max-width: 500px;
    color: white;
    z-index: 2;
}

.single-card:hover .play-box {
    transform: scale(1.1);
    background: var(--tg4-pink);
}
</style>