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
    max-width: var(--page-width);
    min-height: 630px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr repeat(4, 177px);
    gap: 5px;
}

.intro, .category {
    border-radius: 0px;
}

.category {
    position: relative;
    display: flex;
    align-items: center;
    padding: 0 15px;
    color: white;
    font-size: clamp(1rem, 2vw, 1.5rem);
    font-weight: 400;
    text-decoration: none;
    transition: transform .2s ease;
    overflow: hidden;
}

/* .category:hover {
    transform: translateY(-6px);
} */

.category:hover .play-box {
    transform: scale(1.1);
    background: var(--tg4-pink);
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