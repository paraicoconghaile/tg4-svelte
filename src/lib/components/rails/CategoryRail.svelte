<script lang="ts">
    let {
        rail,
        isIrish
    } = $props();

</script>

<section class="category-rail">
    <!-- Information panel -->
    <div class="intro" style={`background:${rail.backgroundColor}; color:${rail.textColor};`}>
        <h2>{isIrish ? rail.titleGa : rail.titleEn}</h2>
        <p>{isIrish ? rail.subtitleGa : rail.subtitleEn}</p>
    </div>

    <!-- Categories -->
    {#each rail.items as item}
        {@const category = item.category}
        {@const title = isIrish ? category.displayGa : category.displayEn}
        {@const url = isIrish ? category.urlPathGa : category.urlPathEn}
        <a class="category" href={`/${isIrish ? 'ga' : 'en'}/player/${url}`} style={`background:${category.color ?? '#333'};`}>
            <div class="play-box">
                <svg width="56" height="56" viewBox="18.5 0 35.5 56" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M55.9383 27.9696L46.9742 19.3235L35.2362 30.6515L18.6702 46.6389L27.6318 55.2875L55.9383 27.9696Z" fill="#2B2A2A"/>
<path d="M46.9354 36.6571L55.8945 28.0061L44.1565 16.6781L27.5905 0.690705L18.6289 9.33929L46.9354 36.6571Z" fill="#2B2A2A"/></svg>
            </div>
            {title}
        </a>
    {/each}
</section>

<style>
.category-rail {
    max-width: 1440px;
    min-height: 630px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr repeat(4, 177px);
    gap: 5px;
}

.intro, .category {
    border-radius: 0px;
}

.intro {
    padding: 40px;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.intro h2 {
    font-size: 2.5rem;
    margin: 0;
}

.intro p {
    font-size: 1.2rem;
    margin: 0;
}

.category {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.4rem;
    font-weight: bold;
    text-decoration: none;
    transition: transform .2s ease;
    overflow: hidden;
}

.category:hover {
    transform: translateY(-6px);
}

.play-box {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 64px;
    height: 64px;
    background: white;
    color: black;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: bold;
    transition: transform .2s ease;
}

.play-box svg {
    width: 22px;
    height: 32px;
}

.category:hover .play-box {
    transform: scale(1.1);
}

@media(max-width:1000px){
    .category-rail {
        grid-template-columns: repeat(2,1fr);
    }
    .intro {
        grid-column: span 2;
    }
}

@media(max-width:600px){
    .category-rail {
        grid-template-columns: 1fr;
    }
    .intro {
        grid-column: auto;
    }
}
</style>