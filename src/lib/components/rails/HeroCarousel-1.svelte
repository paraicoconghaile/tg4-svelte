<script lang="ts">
type Slide = {
    title:string;
    image:string;

};

let { slides }:{slides:Slide[]} = $props();

let currentOffset = $state(0);

function next() {
    currentOffset -= 1200;
}

function previous() {
    currentOffset += 1200;
}
</script>

<div class="carousel">
    <button onclick={previous}>‹</button>
    <div class="viewport">
        <div class="track" style={`transform: translateX(${currentOffset}px);`}>
            {#each slides as slide}
                <div class="slide">
                    <img
                        src={slide.image}
                        alt={slide.title}
                    />
                </div>
            {/each}
        </div>
    </div>
    <button onclick={next}>›</button>
</div>

<style>
.carousel {
    max-width: 1440px;
    margin: auto;
    position: relative;
}

.viewport {
    overflow: hidden;
}

/* .track {
    display: grid;
    grid-template-columns:
        100px
        1fr
        100px
        100px;
    gap: 6px;
    height: 600px;
} */

.track {
    display: flex;
    gap: 6px;
    height: 600px;
    transition: transform .35s ease;
}

/* .slide {
    flex: 0 0 78%;
    height: 600px;
    overflow: hidden;
} */

.slide {
    flex: 0 0 1200px;
}

.slide img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 20;
}

button:first-child {
    left: 20px;
}

button:last-child {
    right: 20px;
}
</style>