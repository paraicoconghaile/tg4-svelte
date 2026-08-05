<script lang="ts">
    const { rail, isIrish } = $props();

    let current = $state(1);

    // Duplicate last and first slide
    const slides = [
        rail.items[rail.items.length - 1],
        ...rail.items,
        rail.items[0]
    ];

    const slideWidth = 1006; // 1000px slide + 6px gap

    function next() {
        current++;
    }

    function previous() {
        current--;
    }

    function getTransform() {
        return `translateX(-${current * slideWidth}px)`;
    }
</script>

<section class="carousel">
    <button class="arrow left" onclick={previous}>‹</button>
    <button mclass="arrow right" onclick={next}>›</button>
    <div class="viewport">
        <div class="track" style={`transform: ${getTransform()}`}>
            {#each slides as item}
                {@const image =
                    item.series.mainImage?.large ??
                    item.series.boxsetImage?.large ??
                    "/images/placeholder.jpg"}
                <article class="slide">
                    <img
                        src={image}
                        alt={item.series.name}
                    />
                    <div class="overlay">
                        <h2>{item.series.name}</h2>
                        <p>
                            {isIrish
                                ? item.series.descGa
                                : item.series.descEn}
                        </p>
                    </div>
                </article>
            {/each}
        </div>
    </div>
</section>

<style>
.carousel {
    max-width:1300px;
    margin:40px auto;
}

.viewport {
    width:1300px;
    overflow:hidden;
}

.track {
    display:flex;
    gap:6px;
    transition:transform .45s ease;
}

.slide {
    flex:0 0 1000px;
    height:560px;
    border-radius:14px;
    overflow:hidden;
    position:relative;
}

.slide img {
    width:100%;
    height:100%;
    object-fit:cover;
    display:block;
}

.overlay {
    position:absolute;
    left:0;
    right:0;
    bottom:0;
    padding:40px;
    color:white;
    background:
        linear-gradient(
            transparent,
            rgba(0,0,0,.8)
        );
}

.overlay p {
    width:55%;
}

.arrow {
    position:absolute;
    top:50%;
    transform:translateY(-50%);
    z-index:10;
    width:45px;
    height:45px;
    border-radius:50%;
    border:none;
    background:rgba(0,0,0,.6);
    color:white;
    font-size:30px;
    cursor:pointer;
}

.left {
    left:20px;
}

.right {
    right:20px;
}
</style>