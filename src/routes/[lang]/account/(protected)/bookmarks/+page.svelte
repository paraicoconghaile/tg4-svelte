<script lang="ts">
    import { onMount } from 'svelte';

    let { data } = $props();

    onMount(() => {
        console.log('Bookmarks diagnostics:', data.diagnostics);
        console.log('Bookmarks error:', data.error);
        console.log('Bookmarks count:', data.bookmarks.length);
    });
</script>

<h1>Bookmarks test</h1>

<p>Bookmarks received: {data.bookmarks?.length ?? 0}</p>

{#if data.error}
    <p>{data.error}</p>
{:else if data.bookmarks?.length}
    {#each data.bookmarks as bookmark}
        <p>{bookmark.video?.displayName ?? 'Untitled bookmark'}</p>
    {/each}
{:else}
    <p>No bookmarks received by the page.</p>
{/if}