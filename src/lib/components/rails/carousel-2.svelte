<script lang="ts">
    const {
        rail,
        isIrish
    }: {
        rail: any;
        isIrish: boolean;
    } = $props();

    // Build an infinite track
    const slides = [
        rail.items[rail.items.length - 1],
        ...rail.items,
        rail.items[0]
    ];
</script>

<section class="carousel">
    {#if rail.titleEn || rail.titleGa}
        <h2 class="rail-title">{isIrish ? rail.titleGa : rail.titleEn}</h2>
    {/if}

    <div class="viewport">
        <div class="track">
            {#each slides as item}
                {@const image =
                    item.series.mainImage?.large ??
                    item.series.boxsetImage?.large ??
                    '/images/placeholder.jpg'}
                <div class="slide">
                    <img src={image} alt={item.series.name} />
                    <div class="overlay">
                        <h2>{item.series.name}</h2>
                        <p>{isIrish ? item.series.descGa : item.series.descEn}</p>
                    </div>
                </div>
            {/each}
        </div>
    </div>
</section>

<style>
.carousel {
    max-width:1300px;
    margin:40px auto;
    padding:0 20px;
}

.viewport {
    overflow:hidden;
}

.track {
    display:flex;
    gap:6px;
    /* This is the trick */
    transform:translateX(-106px);
}

.slide {
    flex:0 0 1000px;
    position:relative;
    border-radius:14px;
    overflow:hidden;
}

.slide img {
    width:100%;
    display:block;
    aspect-ratio:16/9;
    object-fit:cover;
}

.overlay {
    position:absolute;
    left:0;
    right:0;
    bottom:0;
    padding:40px;
    color:white;
    background:
    linear-gradient(transparent, rgba(0,0,0,.8));
}

.overlay p {
    width:55%;
    line-height:1.5;
}
</style>