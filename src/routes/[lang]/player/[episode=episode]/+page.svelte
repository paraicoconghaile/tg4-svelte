<script lang="ts">
    import VodEpisodePage from '$lib/components/player/VodEpisodePage.svelte';

    let { data } = $props();
</script>

<VodEpisodePage {data} />