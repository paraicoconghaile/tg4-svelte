<script lang="ts">
    import HeroCarousel from '$lib/components/rails/HeroCarousel.svelte';
    import CardCarousel from '$lib/components/rails/CardCarousel.svelte';
    import CategoryRail from '$lib/components/rails/CategoryRail.svelte';
    import DoubleContent from '$lib/components/rails/DoubleContent.svelte';
    import SingleContent from '$lib/components/rails/SingleContent.svelte';

    let { data } = $props();
    const isIrish = data.lang === 'ga';

    //console.log(data);
</script>

{#each data.rails.rails as rail}
    {#if rail.type === 'CAROUSEL'}
        <HeroCarousel {rail} {isIrish}/>
    {:else if rail.type === 'HORIZONTAL'}
        <CardCarousel {rail} {isIrish}/>
    {:else if rail.type === 'CATEGORY_RAIL'}
        <CategoryRail {rail} {isIrish}/>
    {:else if rail.type === 'DOUBLE_CONTENT'}
        <DoubleContent {rail} {isIrish}/>
    {:else if rail.type === 'SINGLE_CONTENT'}
        <SingleContent {rail} {isIrish}/>
    {/if}
{/each}

<!-- <pre>
{JSON.stringify(data, null, 2)}
</pre> -->