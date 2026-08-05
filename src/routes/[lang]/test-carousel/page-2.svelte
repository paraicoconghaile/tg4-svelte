<script lang="ts">
    const slides = [
        {
            title: "Ros na Rún",
            image: "https://res.cloudinary.com/tg4/image/upload/box_262470_l.jpg"
        },
        {
            title: "CRÁ",
            image: "https://res.cloudinary.com/tg4/image/upload/box_434190_l.jpg"
        },
        {
            title: "Slide Three",
            image: "https://res.cloudinary.com/tg4/image/upload/box_237595_l.jpg"
        },
        {
            title: "Slide Four",
            image: "https://res.cloudinary.com/tg4/image/upload/box_507439_l.jpg"
        },
        {
            title: "Slide Five",
            image: "https://res.cloudinary.com/tg4/image/upload/box_639304_l.jpg"
        }
    ];

    let current = $state(0);
    let translateX = $state(0);
    let animating = $state(false);
    const STEP = 1128; // hero width + gap (adjust if needed)

    function getSlide(offset: number) {
        return slides[
            (current + offset + slides.length) % slides.length
        ];
    }

    function next() {
        //current = (current + 1) % slides.length;
        if (animating) return;
        animating = true;
        translateX = -STEP;
    }

    function previous() {
        current = (current - 1 + slides.length) % slides.length;
    }

    function finishAnimation() {
        if (!animating) return;
        current = (current + 1) % slides.length;
        translateX = 0;
        animating = false;
    }
</script>


<section class="hero-carousel">
    <button class="arrow left" onclick={previous}>
        ‹
    </button>

    <button class="arrow right" onclick={next}>
        ›
    </button>
    <div class="viewport">
        <div class="stage" style={`transform:translateX(${translateX}px)`} ontransitionend={finishAnimation}>
            <!-- previous -->
            <div class="side">
                <img src={getSlide(-1).image} alt="1" />
            </div>

            <!-- hero -->
            <div class="hero">
                <img src={getSlide(0).image} alt="2" />
                <div class="overlay">
                    <h1>
                        {getSlide(0).title}
                    </h1>
                </div>
            </div>

            <!-- next -->
            <div class="side">
                <img src={getSlide(1).image} alt="3" />
            </div>

            <!-- next + 1 -->
            <div class="side">
                <img src={getSlide(2).image} alt="4" />
            </div>
        </div>
    </div>
    <p>Current: {current}</p>
</section>

<style>
.hero-carousel {
    width:1440px;
    max-width:100%;
    height:600px;
    margin:40px auto;
    position:relative;
}

.viewport {
    overflow:hidden;
}

.stage {
    display:flex;
    gap:6px;
    height:600px;
    transition:transform .45s ease;
}

.hero {
    flex:0 0 1122px;
    height:600px;
    position:relative;
    overflow:hidden;
    border-radius:0px;
    transition: flex-basis .45s ease;
}

.side {
    flex:0 0 100px;
    overflow:hidden;
    border-radius:0px;
    transition: flex-basis .45s ease;
}

img {
    width:100%;
    height:100%;
    object-fit:cover;
}

.overlay {
    position:absolute;
    left:0;
    bottom:0;
    right:0;
    padding:40px;
    color:white;
    background:linear-gradient(
        transparent,
        rgba(0,0,0,.8)
    );
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