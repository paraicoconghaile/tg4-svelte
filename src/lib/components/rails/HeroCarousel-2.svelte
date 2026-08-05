<script lang="ts">
    let {
        slides
    }: {
        slides: {
            title:string;
            image:string;
        }[];
    } = $props();

    let current = $state(1);
    let offset = $state(0);
    let animating = $state(false);

    const cardWidth = 100;
    const gap = 6;
    const movement = cardWidth + gap;

    const visibleSlides = $derived.by(() => {
        return [
            slides[(current - 1 + slides.length) % slides.length],
            slides[current],
            slides[(current + 1) % slides.length],
            slides[(current + 2) % slides.length],
            slides[(current + 3) % slides.length]
        ];
    });

    function next() {
        if(animating) return;
        animating = true;
        offset = -movement;
        setTimeout(()=>{
            current =
                (current + 1) %
                slides.length;
            offset = 0;
            animating = false;
        },450);
    }

    function previous(){
        if(animating) return;
        current =
            (current - 1 + slides.length)
            %
            slides.length;
    }
</script>

<section class="carousel">
    <button class="arrow left" onclick={previous}
    >‹</button>

    <div class="viewport">
        <div class="track" style:transform={`translateX(${offset}px)`}>
            {#each visibleSlides as slide,index}
                <div class="card" class:hero={index===1}>
                    <img src={slide.image} alt={slide.title} />
                    {#if index===1}
                        <div class="overlay">
                            <h1>{slide.title}</h1>
                        </div>
                    {/if}
                </div>
            {/each}
        </div>
    </div>

    <button class="arrow right" onclick={next}>›</button>
</section>

<style>
.carousel {
    width:min(1440px,100%);
    margin:50px auto;
    position:relative;
}

.viewport {
    overflow:hidden;
}

.track {
    display:flex;
    gap:6px;
    transition:
    transform .45s ease;
}

/* .card {
    height:600px;
    flex:0 0 100px;
    overflow:hidden;
    position:relative;
}

.card.hero {
    flex-basis:
    calc(100vw - 330px);
    max-width:1122px;
} */

.card {
    flex:0 0 100px;
    transition:
        flex-basis .45s ease;
}

.card.hero {
    flex-basis:1122px;
}

.card img {
    width:100%;
    height:100%;
    object-fit:cover;
}

.overlay {
    position:absolute;
    bottom:0;
    left:0;
    right:0;
    padding:40px;
    color:white;
    background:
    linear-gradient(
    transparent,
    rgba(0,0,0,.8)
    );
}

.arrow {
    position:absolute;
    top:50%;
    transform:
    translateY(-50%);
    z-index:10;
    width:50px;
    height:50px;
    border:0;
    border-radius:50%;
    background:
    rgba(0,0,0,.6);
    color:white;
    font-size:32px;
    cursor:pointer;
}

.left {
    left:20px;
}

.right {
    right:20px;
}

/* Tablet */

@media(max-width:900px){
    .card {
        height:450px;
    }

    .card.hero {
        flex-basis:
        calc(100vw - 220px);
    }
}

/* Mobile */

@media(max-width:700px){
    .card:not(.hero){
        display:none;
    }

    .card.hero {
        flex-basis:100%;
        height:320px;
    }
}
</style>