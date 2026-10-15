<script lang="ts">
    let { data } = $props();
</script>

{#each data.bookmarks as bookmark}
    <p>{bookmark.video.displayName}</p>
{/each}