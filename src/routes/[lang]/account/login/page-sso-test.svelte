<script lang="ts">
    import { onMount } from 'svelte';
    import { loadPeachUser } from '$lib/sso/peach';

    let status = 'Loading Peach User...';
    let error = '';

    onMount(async () => {
        try {
            const pu = await loadPeachUser();

            console.log('Peach User:', pu);

            status = 'Peach User loaded successfully';
        } catch (err) {
            console.error('Peach User error:', err);

            status = 'Peach User failed to load';
            error = err instanceof Error ? err.message : String(err);
        }
    });
</script>

<div class="account-page">
    <h1>Login</h1>

    <p>{status}</p>

    {#if error}
        <p class="error">{error}</p>
    {/if}
</div>

<style>
    .account-page {
        max-width: 600px;
        margin: 100px auto;
        padding: 20px;
        text-align: center;
    }

    .error {
        color: red;
    }
</style>