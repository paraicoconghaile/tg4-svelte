<script lang="ts">
    let { data } = $props();
</script>

<h1>Bookmarks test</h1>

<p>Bookmarks received: {data.bookmarks?.length ?? 0}</p>

<h2>Diagnostics</h2>

<pre>{JSON.stringify(data.diagnostics ?? 'No diagnostics returned', null, 2)}</pre>

{#if data.error}
    <p>{data.error}</p>
{:else if data.bookmarks?.length}
    {#each data.bookmarks as bookmark}
        <p>{bookmark.video?.displayName ?? 'Untitled bookmark'}</p>
    {/each}
{:else}
    <p>No bookmarks received by the page.</p>
{/if}