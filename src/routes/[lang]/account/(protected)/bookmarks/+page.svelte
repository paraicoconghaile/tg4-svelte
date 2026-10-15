<script lang="ts">
    import { onMount } from 'svelte';

    let { data } = $props();

    onMount(() => {
        console.log('Bookmarks diagnostics:', data.diagnostics);
        console.log('Bookmarks error:', data.error);
        console.log('Bookmarks count:', data.bookmarks.length);
        console.log('Bookmarks response summary:', data.responseSummary);
    });
</script>