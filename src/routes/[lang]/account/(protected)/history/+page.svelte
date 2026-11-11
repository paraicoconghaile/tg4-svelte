<script lang="ts">
    import HistoryPage from '$lib/components/sso/HistoryPage.svelte';

    let { data } = $props();
</script>

<HistoryPage {data} />