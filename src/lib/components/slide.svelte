<script lang="ts">
    const {
        item,
        isIrish,
        hero = false
    }: {
        item: any;
        isIrish: boolean;
        hero?: boolean;
    } = $props();

    const image =
        item.series.mainImage?.large ??
        item.series.boxsetImage?.large ??
        "/images/placeholder.jpg";
</script>

<article class:hero>
    <img
        src={image}
        alt={item.series.name}
    />
    {#if hero}
        <div class="overlay">
            <h2>{item.series.name}</h2>
            <p>
                {isIrish
                    ? item.series.descGa
                    : item.series.descEn}
            </p>
        </div>
    {/if}
</article>

<style>
article{
    position:relative;
    border-radius:14px;
    overflow:hidden;
}

img{
    width:100%;
    height:100%;
    display:block;
    object-fit:cover;
}

.hero{
    width:1000px;
    aspect-ratio:16/9;
}

article:not(.hero){
    width:100px;
    aspect-ratio:16/9;
}

.overlay{
    position:absolute;
    inset:auto 0 0 0;
    padding:40px;
    color:white;
    background:
        linear-gradient(
            transparent,
            rgba(0,0,0,.85)
        );
}

.overlay p{
    width:55%;
}
</style>