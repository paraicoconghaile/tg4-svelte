<script lang="ts">
    import { onMount } from 'svelte';

    let { data } = $props();

    onMount(() => {
        console.log('Bookmarks page data:', data);
    });
</script>