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

    const profileMessages = {
        en: {
            labels: {
                account: 'Account',
                profile: 'Profile',
                preferences: 'Preferences',
                updateProfile: 'Update Profile',
                firstname: 'First Name',
                lastname: 'Surname',
                displayname: 'Display Name',
                age: 'Age',
                gender: 'Gender',
                male: 'Male',
                female: 'Female',
                nonBinary: 'Non Binary',
                noSay: 'Prefer not to Say',
                irishLevel: 'Level of Irish',
                none: 'None',
                learner: 'Learner',
                intermediate: 'Intermediate',
                fluent: 'Fluent',
                nationality: 'Nationality',
                country: 'Country of Residence',
                newsletter: 'Subscribe to the newsletter',
                savebutton: 'Save',
                updating: 'Updating...',
                loading: 'Loading...'
            },
            password: {
                required: 'Please enter your current and new password.',
                changed: 'Password Changed!',
                incorrect: 'Current Password is incorrect.',
                weak: 'New Password is not strong enough.',
                error: 'Unable to update password.'
            },
            email: {
                required: 'Please enter an email address.',
                passwordRequired: 'Please enter your current password.',
                changed: 'Email Changed!',
                verification: 'Email with verification link sent to new email address.',
                taken: 'New Email already taken.',
                incorrect: 'Current Password is incorrect.',
                tooMany: 'Too many requests. Please try later.',
                error: 'Unable to update email address.'
            }
        },
        ga: {
            labels: {
                account: 'Cuntas',
                profile: 'Próifíl',
                preferences: 'Sainrogha phearsanta',
                updateProfile: 'Athraigh Próifíl',
                firstname: 'Chéad Ainm',
                lastname: 'Sloinne',
                displayname: 'Display Name',
                age: 'Aois',
                gender: 'Inscne',
                male: 'Fireann',
                female: 'Baineann',
                nonBinary: 'Neamh-dhénártha',
                noSay: 'B\'fhearr gan luaigh',
                irishLevel: 'Leibhéal Gaeilge',
                none: 'Gan Gaeilge',
                learner: 'Foghlaimeoir',
                intermediate: 'Meán Leibhéal',
                fluent: 'Líofa',
                nationality: 'Náisiúntacht',
                country: 'Tír a bhfuil cónaí ort',
                newsletter: 'Cláraigh don Nuachtlitir ',
                savebutton: 'Sabháil',
                updating: 'Á nuashonrú...',
                loading: 'Á luchtú...'
            },
            password: {
                required: 'Cuir isteach do phasfhocal reatha agus do phasfhocal nua, le do thoil.',
                changed: 'Athraíodh an pasfhocal!',
                incorrect: 'Tá an pasfhocal reatha mícheart.',
                weak: 'Níl an pasfhocal nua sách láidir.',
                error: 'Níorbh fhéidir an pasfhocal a athrú.'
            },
            email: {
                required: 'Cuir isteach seoladh ríomhphoist, le do thoil.',
                passwordRequired: 'Cuir isteach do phasfhocal reatha, le do thoil.',
                changed: 'Athraíodh an seoladh ríomhphoist!',
                verification: 'Seoladh ríomhphost le nasc fíoraithe chuig an seoladh ríomhphoist nua.',
                taken: 'Tá an seoladh ríomhphoist nua in úsáid cheana féin.',
                incorrect: 'Tá an pasfhocal reatha mícheart.',
                tooMany: 'An iomarca iarratas. Bain triail eile as ar ball.',
                error: 'Níorbh fhéidir an seoladh ríomhphoist a athrú.'
            }
        }
    };

    const messages = $derived(profileMessages[page.params.lang === 'ga' ? 'ga' : 'en']);

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
    {#if loading}
        <p>Loading...</p>
    {:else if error}
        <p>{error}</p>
    {:else}
        <section class="account">
            <h2>{messages.labels.profile}</h2>

            <nav class="account-tabs">
                <a href={`/${page.params.lang}/account/account`} class="active">{messages.labels.account}</a>
                <a href={`/${page.params.lang}/account/profile`}>{messages.labels.profile}</a>
                <a href={`/${page.params.lang}/account/preferences`}>{messages.labels.preferences}</a>
            </nav>

            {#if loading}
                <p>Loading...</p>
            {:else if error}
                <p>{error}</p>
            {:else}
                <form onsubmit={(event) => {event.preventDefault(); handleSubmit();}}>
                    <fieldset>
                        <legend>{messages.labels.updateProfile}</legend>
                        <div class="form-row">
                            <div class="form-field">
                                <label for="firstName">{messages.labels.firstname}</label>
                                <input id="firstName" type="text" bind:value={firstName} />
                            </div>

                            <div class="form-field">
                                <label for="lastName">{messages.labels.surname}</label>
                                <input id="lastName" type="text" bind:value={lastName} />
                            </div>
                        </div>
                        <div class="form-field">
                            <label for="displayName">Display name *</label>
                            <input id="displayName" type="text" bind:value={displayName} required />
                        </div>
                        <div class="form-field">
                            <label>{messages.labels.age}</label>

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
                            <label>{messages.labels.gender}</label>

                            <label>
                                <input type="radio" bind:group={gender} value="1" />
                                {messages.labels.female}
                            </label>

                            <label>
                                <input type="radio" bind:group={gender} value="2" />
                                {messages.labels.male}
                            </label>

                            <label>
                                <input type="radio" bind:group={gender} value="3" />
                                {messages.labels.nonBinary}
                            </label>

                            <label>
                                <input type="radio" bind:group={gender} value="4" />
                                {messages.labels.noSay}
                            </label>
                        </div>
                        <div class="form-field">
                            <label>{messages.labels.irishLevel}</label>

                            <label>
                                <input type="radio" bind:group={irish} value="1" />
                                {messages.labels.none}
                            </label>

                            <label>
                                <input type="radio" bind:group={irish} value="2" />
                                {messages.labels.learner}
                            </label>

                            <label>
                                <input type="radio" bind:group={irish} value="3" />
                                {messages.labels.intermediate}
                            </label>

                            <label>
                                <input type="radio" bind:group={irish} value="4" />
                                {messages.labels.fluent}
                            </label>
                        </div>
                        <div class="form-field">
                            <label for="nationality">{messages.labels.nationality}</label>

                            <select id="nationality" bind:value={nationality}>
                                <option value="">Select nationality</option>

                                {#each countries as country}
                                    <option value={country.code}>{country.name}</option>
                                {/each}
                            </select>
                        </div>
                        <div class="form-field">
                            <label for="residence">{messages.labels.country}</label>

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
