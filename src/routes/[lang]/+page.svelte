<script lang="ts">
    import HeroCarousel from '$lib/components/rails/HeroCarousel.svelte';
    import CardCarousel from '$lib/components/rails/CardCarousel.svelte';
    import CardCarouselPortrait from '$lib/components/rails/CardCarouselPortrait.svelte';
    import CategoryRail from '$lib/components/rails/CategoryRail.svelte';
    import DoubleContent from '$lib/components/rails/DoubleContent.svelte';
    import SingleContent from '$lib/components/rails/SingleContent.svelte';
    import Marketing from '$lib/components/rails/Marketing.svelte';
    import LiveCarousel from '$lib/components/rails/LiveCarousel.svelte';
    import LuckyDipCarousel from '$lib/components/rails/LuckyDipCarousel.svelte';
    import StaffReview from '$lib/components/rails/StaffReview.svelte';
    import Footer from '$lib/components/layout/Footer.svelte';
    import { onMount } from 'svelte';
    import { withBase } from '$lib/utils/paths';

    let { data } = $props();
    let isIrish = $derived(data.lang === 'ga');

    let rails = $state(data.rails.rails);

    onMount(async () => {
        try {
            const hasPeachSession = document.cookie.split(';').some(
                cookie => cookie.trim().startsWith('identity.provider.sid=')
            );

            if (!hasPeachSession) return;

            const response = await fetch(withBase('/api/user/continue-watching'), {
                credentials: 'include',
                cache: 'no-store'
            });

            if (!response.ok) return;

            const items = await response.json();

            rails = rails.map((rail) =>
                rail.type === 'CONTINUE_WATCHING'
                    ? { ...rail, items }
                    : rail
            );
        } catch (error) {
            console.error('Failed to load Continue Watching:', error);
        }
    });

    //console.log('RAILS API:', data.rails);
</script>

<svelte:head>
    <title>{isIrish ? 'TG4 | Teilifís Gaeilge' : 'TG4 | Irish Language Television'}</title>
</svelte:head>

{#each rails as rail}
    {#if rail.type === 'CAROUSEL'}
        <HeroCarousel {rail} {isIrish} />
    {:else if rail.type === 'HORIZONTAL' && rail.showItemsAsBoxset === false}
        <CardCarousel {rail} {isIrish} showCategoryOnSeries={rail.showCategoryOnSeries} />
    {:else if rail.type === 'HORIZONTAL' && rail.showItemsAsBoxset === true}
        <CardCarouselPortrait {rail} {isIrish} showCategoryOnSeries={rail.showCategoryOnSeries} />
    {:else if rail.type === 'CATEGORY_RAIL'}
        <CategoryRail {rail} {isIrish} />
    {:else if rail.type === 'DOUBLE_CONTENT'}
        <DoubleContent {rail} {isIrish} />
    {:else if rail.type === 'SINGLE_CONTENT'}
        <SingleContent {rail} {isIrish} />
    {:else if rail.type === 'MARKETING'}
        <Marketing {rail} {isIrish} />
    {:else if rail.type === 'LIVE'}
        <LiveCarousel {rail} {isIrish} />
    {:else if rail.type === 'LUCKY_DIP'}
        <LuckyDipCarousel {rail} {isIrish} />
    {:else if rail.type === 'CONTINUE_WATCHING' && rail.items.length > 0}
        <CardCarousel {rail} {isIrish} />
    {:else if rail.type === 'STAFF_REVIEW'}
        <StaffReview {rail} {isIrish} />
    {/if}
{/each}

<Footer lang={data.lang} />

<!-- {data.isLoggedIn ? 'Logged in' : 'Not logged in'} -->

<!-- <pre>
{JSON.stringify(data, null, 2)}
</pre> -->