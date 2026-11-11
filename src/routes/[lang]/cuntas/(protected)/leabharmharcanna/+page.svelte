<script lang="ts">
    import BookmarksPage from '$lib/components/sso/BookmarksPage.svelte';

    let { data } = $props();
</script>

<BookmarksPage {data} />