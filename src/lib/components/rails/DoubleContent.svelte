<script lang="ts">
let {
    rail,
    isIrish
} = $props();
</script>

<section class="double-content">
    <!-- Intro -->
    <div class="intro" style={`background:${rail.backgroundColor}; color:${rail.textColor};`}>
        <h2>{isIrish ? rail.titleGa : rail.titleEn}</h2>
        <p>{isIrish ? rail.subtitleGa : rail.subtitleEn}</p>
    </div>

    {#each rail.items as item}
        {@const series = item.series}
        <a class="content-card" href={`/${isIrish ? 'ga' : 'en'}/player/${series.slug}`}>
            <img src= {series.mainImage?.large ?? series.boxsetImage?.large} alt={series.name}/>

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

            <!-- <div class="text">
                <h3>{series.name}</h3>
                <p>{isIrish ? series.descGa : series.descEn}</p>
            </div> -->
        </a>
    {/each}
</section>

<style>
.double-content {
    max-width: var(--page-width);
    min-height: 610px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    /* grid-template-columns: 1fr 359px 359px; */
    gap: 5px;
}

.content-card {
    position: relative;
    background: white;
    text-decoration: none;
    color: inherit;
    overflow: hidden;
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

.text {
    padding: 20px;
}

.intro h3 {
    margin: 0 0 10px;
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

@media(max-width:450px) {
    .double-content {
        grid-template-columns: 1fr 81px 81px;
    }
    .intro {
        padding: 20px;
    }
}
</style>