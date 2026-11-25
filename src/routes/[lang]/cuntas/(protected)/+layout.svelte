<script lang="ts">
    import ProtectedAccountLayout from '$lib/components/sso/ProtectedAccountLayout.svelte';

    let { children } = $props();
</script>

<ProtectedAccountLayout>
    {@render children()}
</ProtectedAccountLayout>