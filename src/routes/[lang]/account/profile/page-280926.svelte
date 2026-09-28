<script lang="ts">
    import { onMount } from 'svelte';
    import { loadPeachUser } from '$lib/sso/peach';

    let loading = true;
    let error = '';
    let profile: any = null;

    onMount(async () => {
        try {
            const pu = await loadPeachUser();

            profile = await pu.getCombinedSessionAndPreferenceProfile();

            console.log('PROFILE:', profile);

            loading = false;
        } catch (err) {
            console.error('Profile error:', err);

            error = err instanceof Error ? err.message : String(err);
            loading = false;
        }
    });
</script>

<div class="account-page">

    {#if loading}
        <p>Loading profile...</p>

    {:else if error}
        <p class="error">{error}</p>

    {:else}
        <h1>Profile</h1>

        <pre>{JSON.stringify(profile, null, 2)}</pre>
    {/if}

</div>

<style>
    .account-page {
        max-width: 1000px;
        margin: 100px auto;
        padding: 20px;
    }

    .error {
        color: red;
    }

    pre {
        white-space: pre-wrap;
        word-break: break-word;
    }
</style>