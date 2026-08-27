<script lang="ts">
    const slides = [
        {
            title: "Ros na Rún",
            image: "https://res.cloudinary.com/tg4/image/upload/w_1920,h_1080,c_fill,f_auto,q_auto:eco/047901.jpg"
        },
        {
            title: "CRÁ",
            image: "https://res.cloudinary.com/tg4/image/upload/w_1920,h_1080,c_fill,f_auto,q_auto:eco/box_639304_l.jpg"
        },
        {
            title: "Slide Three",
            image: "https://res.cloudinary.com/tg4/image/upload/w_1920,h_1080,c_fill,f_auto,q_auto:eco/047901.jpg"
        },
        {
            title: "Slide Four",
            image: "https://res.cloudinary.com/tg4/image/upload/w_1920,h_1080,c_fill,f_auto,q_auto:eco/box_639304_l.jpg"
        }
    ];
</script>


<section class="hero-carousel">
    <div class="viewport">
        <div class="stage">
            <!-- left sliver -->
            <div class="side">
                <img src={slides[3].image} />
            </div>
            <!-- hero -->
            <div class="hero">
                <img src={slides[0].image} />

                <div class="overlay">
                    <h1>{slides[0].title}</h1>
                </div>
            </div>
            <!-- right slivers -->
            <div class="side">
                <img src={slides[1].image} />
            </div>
            <div class="side">
                <img src={slides[2].image} />
            </div>
        </div>
    </div>
</section>

<style>
.hero-carousel {
    width:1440px;
    max-width:100%;
    height:600px;
    margin:40px auto;
}

.viewport {
    overflow:hidden;
}

.stage {
    display:flex;
    gap:6px;
    height:600px;
}

.hero {
    flex:0 0 1122px;
    height:600px;
    position:relative;
    overflow:hidden;
    border-radius:0px;
}

.side {
    flex:0 0 100px;
    overflow:hidden;
    border-radius:0px;
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
</style>