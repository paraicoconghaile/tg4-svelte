<script lang="ts">
    import HeroCarousel from '$lib/components/rails/HeroCarousel-1.svelte';
    import CardCarousel from '$lib/components/rails/CardCarousel.svelte';

    let { data } = $props();
    let isIrish = $derived(data.lang === 'ga');

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
</script>

<HeroCarousel {slides}/>