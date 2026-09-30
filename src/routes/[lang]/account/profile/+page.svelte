<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    import { goto } from '$app/navigation';
    import { loadPeachUser } from '$lib/sso/peach';

    let pu: any;
    let profile: any = null;
    let loading = $state(true);
    let error = $state('');

    onMount(async () => {
        try {
            pu = await loadPeachUser();
            profile = await pu.getCombinedSessionAndPreferenceProfile();

            const unauthorized =
                profile?.profile?.error === 'Unauthorized' ||
                profile?.preferences?.error === 'Unauthorized';

            if (unauthorized) {
                await goto(`/${page.params.lang}/account/login`);
                return;
            }

            loading = false;
        } catch (err) {
            console.error('Profile error:', err);
            error = err instanceof Error ? err.message : String(err);
            loading = false;
        }
    });
</script>

<section class="profile-page">
    <h2>Profile</h2>

    <nav class="account-tabs">
        <a href={`/${page.params.lang}/account/account`}>Account</a>
        <a href={`/${page.params.lang}/account/profile`} class="active">Profile</a>
        <a href={`/${page.params.lang}/account/preferences`}>Preferences</a>
    </nav>

    {#if loading}
        <p>Loading...</p>
    {:else if error}
        <p>{error}</p>
    {:else if profile}
        <form>
            <div class="form-field">
                <label for="firstName">First name</label>
                <input
                    id="firstName"
                    type="text"
                    value={profile.profile.firstName ?? ''}
                />
            </div>

            <div class="form-field">
                <label for="lastName">Last name</label>
                <input
                    id="lastName"
                    type="text"
                    value={profile.profile.lastName ?? ''}
                />
            </div>

            <div class="form-field">
                <label for="displayName">Display name</label>
                <input
                    id="displayName"
                    type="text"
                    value={profile.preferences.displayName ?? ''}
                />
            </div>
        </form>
    {/if}
</section>

<style>
    .profile-page {
        max-width: 700px;
        margin: 0 auto;
        padding: 20px;
        background-color: var(--genre-background);
    }

    .account-tabs {
        display: flex;
        gap: 5px;
        margin-bottom: 30px;
        border-bottom: 1px solid #ccc;
    }

    .account-tabs a {
        padding: 10px 15px;
        text-decoration: none;
        color: inherit;
    }

    .account-tabs a.active {
        font-weight: bold;
        border-bottom: 3px solid currentColor;
    }

    .form-field {
        margin-bottom: 20px;
    }

    .form-field label {
        display: block;
        margin-bottom: 6px;
        font-weight: bold;
    }

    .form-field input {
        width: 100%;
        box-sizing: border-box;
        padding: 10px;
    }
</style>