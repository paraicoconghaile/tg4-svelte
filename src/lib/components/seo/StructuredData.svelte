<script lang="ts">
    let {
        schema
    }: {
        schema: Record<string, unknown>;
    } = $props();

    const jsonLd = $derived(
        JSON.stringify(schema).replace(/</g, '\\u003c')
    );
</script>

<svelte:head>
    {@html `<script type="application/ld+json">${jsonLd}</script>`}
</svelte:head>