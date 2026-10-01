<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    import { goto } from '$app/navigation';
    import { loadPeachUser } from '$lib/sso/peach';
    import { countries } from '$lib/data/countries';
    import { requireAuthentication } from '$lib/sso/auth';

    let pu: any;
    let profile: any = null;
    let loading = $state(true);
    let error = $state('');
    let saving = $state(false);
    let saved = $state(false);

    let firstName = $state('');
    let lastName = $state('');
    let displayName = $state('');
    let age = $state(false);
    let gender = $state('');
    let irish = $state('');
    let nationality = $state('');
    let residence = $state('');
    let newsletter = $state(false);

    onMount(async () => {
        try {
            pu = await requireAuthentication(page.params.lang);
            if (!pu) return;

            // User is authenticated, so load their profile
            profile = await pu.getCombinedSessionAndPreferenceProfile();

            console.log('PROFILE:', profile);

            const unauthorized = profile?.profile?.error === 'Unauthorized' || profile?.preferences?.error === 'Unauthorized';

            if (unauthorized) {
                console.warn('Session is stale - logging out');

                try {
                    await pu.logout();
                } catch (err) {
                    console.error('Logout error:', err);
                }

                await goto(`/${page.params.lang}/account/login`);
                return;
            }

            firstName = profile.profile.firstName ?? '';
            lastName = profile.profile.lastName ?? '';
            displayName = profile.preferences.displayName ?? '';
            age = profile.preferences.age ?? false;
            gender = profile.preferences.gender ?? '';
            irish = profile.preferences.irish ?? '';
            nationality = profile.preferences.nationality ?? '';
            residence = profile.preferences.residence ?? '';
            newsletter = profile.preferences.newsletter ?? false;

            loading = false;

        } catch (err) {
            console.error('Profile error:', err);
            error = err instanceof Error ? err.message : String(err);
            loading = false;
        }
    });

    function handleSubmit() {
        saved = false;
        console.log({
            firstName,
            lastName,
            displayName,
            age,
            gender,
            irish,
            nationality,
            residence,
            newsletter
        });
    }
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
    {:else}
        <form onsubmit={(event) => {event.preventDefault(); handleSubmit();}}>
            <fieldset>
                <legend>Edit Profile</legend>
                <div class="form-row">
                    <div class="form-field">
                        <label for="firstName">First name</label>
                        <input id="firstName" type="text" bind:value={firstName} />
                    </div>

                    <div class="form-field">
                        <label for="lastName">Surname</label>
                        <input id="lastName" type="text" bind:value={lastName} />
                    </div>
                </div>
                <div class="form-field">
                    <label for="displayName">Display name *</label>
                    <input
                        id="displayName"
                        type="text"
                        bind:value={displayName}
                        required
                    />
                </div>
                <div class="form-field">
                    <label>Age</label>

                    <label class="toggle">
                        <input
                            class="toggle-checkbox"
                            type="checkbox"
                            bind:checked={age}
                        />
                        <span class="toggle-switch"></span>
                        <span class="toggle-label">Over 18</span>
                    </label>
                </div>
                <div class="form-field">
                    <label>Gender</label>

                    <label>
                        <input type="radio" bind:group={gender} value="1" />
                        Female
                    </label>

                    <label>
                        <input type="radio" bind:group={gender} value="2" />
                        Male
                    </label>

                    <label>
                        <input type="radio" bind:group={gender} value="3" />
                        Non Binary
                    </label>

                    <label>
                        <input type="radio" bind:group={gender} value="4" />
                        Prefer not to Say
                    </label>
                </div>
                <div class="form-field">
                    <label>Level of Irish</label>

                    <label>
                        <input type="radio" bind:group={irish} value="1" />
                        None
                    </label>

                    <label>
                        <input type="radio" bind:group={irish} value="2" />
                        Learner
                    </label>

                    <label>
                        <input type="radio" bind:group={irish} value="3" />
                        Intermediate
                    </label>

                    <label>
                        <input type="radio" bind:group={irish} value="4" />
                        Fluent
                    </label>
                </div>
                <div class="form-field">
                    <label for="nationality">Nationality</label>

                    <select id="nationality" bind:value={nationality}>
                        <option value="">Select nationality</option>

                        {#each countries as country}
                            <option value={country.code}>{country.name}</option>
                        {/each}
                    </select>
                </div>
                <div class="form-field">
                    <label for="residence">Country of Residence</label>

                    <select id="residence" bind:value={residence}>
                        <option value="">Select country of residence</option>

                        {#each countries as country}
                            <option value={country.code}>{country.name}</option>
                        {/each}
                    </select>
                </div>
                <div class="form-field">
                    <label class="toggle">
                        <input
                            class="toggle-checkbox"
                            type="checkbox"
                            bind:checked={newsletter}
                        />
                        <span class="toggle-switch"></span>
                        <span class="toggle-label">
                            Subscribe to the newsletter
                        </span>
                    </label>
                </div>

                <button type="submit" disabled={saving}> {saving ? 'Saving...' : 'Save'}</button>

                {#if saved}
                    <p>Profile saved.</p>
                {/if}
            </fieldset>
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

fieldset {
    border: 0;
    padding: 0;
    margin: 0;
}

legend {
    font-size: 1.25rem;
    font-weight: bold;
    margin-bottom: 20px;
}

.form-row {
    display: flex;
    gap: 15px;
}

.form-row .form-field {
    flex: 1;
}

.form-field {
    margin-bottom: 20px;
}

.form-field > label:first-child {
    display: block;
    margin-bottom: 8px;
    font-weight: bold;
}

input[type="text"],
select {
    width: 100%;
    box-sizing: border-box;
    padding: 10px;
}

.form-field > label:not(:first-child) {
    display: block;
    margin-bottom: 8px;
}

button {
    padding: 10px 20px;
}
</style>
