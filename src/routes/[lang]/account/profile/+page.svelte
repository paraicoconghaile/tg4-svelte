<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    import { goto } from '$app/navigation';
    import { countries } from '$lib/data/countries';
    import { requireAuthentication } from '$lib/sso/auth';
    import { withBase } from '$lib/utils/paths';

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
                profile: 'Edit your profile',
                profileLink: 'Profile',
                preferences: 'Preferences',
                updateProfile: 'Update Profile',
                firstname: 'First Name',
                surname: 'Surname',
                displayname: 'Display Name',
                age: 'Age',
                over18: 'Over 18',
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
                loading: 'Loading...',
                profileSaved: 'Profile Saved'
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
                profile: 'Athraigh Próifíl',
                profileLink: 'Próifíl',
                preferences: 'Sainrogha phearsanta',
                updateProfile: 'Athraigh Próifíl',
                firstname: 'Chéad Ainm',
                surname: 'Sloinne',
                displayname: 'Display Name',
                age: 'Aois',
                over18: 'Os Cionn 18',
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
                updating: 'Ag uasdhátú...',
                loading: 'Ag lódáil...',
                profileSaved: 'Próifíl Athruithe'
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

    async function handleSubmit() {
        saved = false;
        saving = true;

        try {
            let accessLevel = 1;

            if (
                firstName !== '' &&
                lastName !== '' &&
                age &&
                gender !== '' &&
                nationality !== '' &&
                residence !== '' &&
                irish !== '' &&
                newsletter
            ) {
                accessLevel = 4;
            } else if (
                firstName !== '' &&
                lastName !== '' &&
                age &&
                gender !== '' &&
                nationality !== '' &&
                residence !== '' &&
                irish !== ''
            ) {
                accessLevel = 3;
            } else if (
                firstName !== '' &&
                lastName !== '' &&
                age &&
                gender !== ''
            ) {
                accessLevel = 2;
            }

            const updatedProfile = {
                ...profile,
                profile: {
                    ...profile.profile,
                    firstName,
                    lastName
                },
                preferences: {
                    ...profile.preferences,
                    displayName,
                    age,
                    gender,
                    irish,
                    nationality,
                    residence,
                    newsletter,
                    accessLevel
                }
            };

            console.log('Saving profile:', updatedProfile);

            await pu.setCombinedSessionAndPreferenceProfile('profile_preference_key', updatedProfile);
            profile = updatedProfile;
            saved = true;

        } catch (err) {
            console.error('Profile update error:', err);
        } finally {
            saving = false;
        }
    }
</script>

<section class="profile-page">
    <section class="episodes">
        {#if loading}
            <p>Loading...</p>
        {:else if error}
            <p>{error}</p>
        {:else}
            <section class="account">
                <div class="account-layout">
                    <!-- LEFT COLUMN -->
                    <nav class="account-tabs">
                        <a href={withBase(`/${page.params.lang}/account/account`)}>{messages.labels.account}</a>
                        <a href={withBase(`/${page.params.lang}/account/profile`)} class="active">{messages.labels.profileLink}</a>
                        <a href={withBase(`/${page.params.lang}/account/preferences`)}>{messages.labels.preferences}</a>
                    </nav>

                    <!-- MIDDLE COLUMN -->
                    <div class="account-content">
                        <h1>{messages.labels.profile}</h1>
                            <form onsubmit={(event) => {event.preventDefault(); handleSubmit();}}>
                                <fieldset>
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
                                            <input class="toggle-checkbox" type="checkbox" bind:checked={age} />
                                            <span class="toggle-switch"></span>
                                            <span class="toggle-label">{messages.labels.over18}</span>
                                        </label>
                                    </div>
                                    <div class="form-field">
                                        <label>{messages.labels.gender}</label>

                                        <div class="radio-options">
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
                                    </div>
                                    <div class="form-field">
                                        <label>{messages.labels.irishLevel}</label>

                                        <div class="irish-options">
                                            <label class:selected={irish === '1'}>
                                                <input type="radio" bind:group={irish} value="1" />
                                                <span>{messages.labels.none}</span>
                                            </label>

                                            <label class:selected={irish === '2'}>
                                                <input type="radio" bind:group={irish} value="2" />
                                                <span>{messages.labels.learner}</span>
                                            </label>

                                            <label class:selected={irish === '3'}>
                                                <input type="radio" bind:group={irish} value="3" />
                                                <span>{messages.labels.intermediate}</span>
                                            </label>

                                            <label class:selected={irish === '4'}>
                                                <input type="radio" bind:group={irish} value="4" />
                                                <span>{messages.labels.fluent}</span>
                                            </label>
                                        </div>
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
                                        <label></label>
                                        <label class="toggle">
                                            <input class="toggle-checkbox" type="checkbox" bind:checked={newsletter} />
                                            <span class="toggle-switch"></span>
                                            <span class="toggle-label">{messages.labels.newsletter}</span>
                                        </label>
                                    </div>

                                    <button type="submit" class="form-button" disabled={saving}>{saving ? messages.labels.updating : messages.labels.savebutton}</button>

                                    {#if saved}
                                        <p class="notification">{messages.labels.profileSaved}</p>
                                    {/if}
                                </fieldset>
                            </form>
                        </div>
                    </div>

                    <!-- RIGHT COLUMN -->
                    <div class="account-sidebar"></div>
            </section>
        {/if}
    </section>
</section>

<style>
.profile-page {
    max-width: var(--page-width);
    margin: 0 auto;
    padding: 20px;
    background-color: var(--genre-background);
}

.account-layout {
    display: grid;
    grid-template-columns: 250px minmax(0, 600px) 180px;
    gap: 40px;
    align-items: start;
}

.account-tabs {
    display: flex;
    flex-direction: column;
    gap: 5px;
    padding-top: 32px;
}

.account-tabs a {
    position: relative;
    width: fit-content;
    padding: 10px 0;
    text-decoration: none;
    color: inherit;
}

.account-tabs a.active {
    font-weight: bold;
}

.account-tabs a::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 3px;
    background-color: var(--link-colour);
    opacity: 0;
    transition: opacity 0.2s ease;
}

.account-tabs a:hover::after,
.account-tabs a.active::after {
    opacity: 1;
}

.account-content {
    min-width: 0;
}

.account-section {
    margin-bottom: 40px;
}

.account-section form {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

fieldset {
    border: 0;
    padding: 0;
    margin: 0;
}

.form-field {
    margin-bottom: 20px;
}

.form-field > label:first-child {
    display: block;
    margin-bottom: 4px;
    font-weight: bold;
}

.form-row {
    display: flex;
    gap: 15px;
}

.form-row .form-field {
    flex: 1;
}

input[type="text"],
select {
    width: 100%;
    box-sizing: border-box;
    padding: 10px;
}

/* Gender */

.radio-options {
    display: flex;
    width: 100%;
    margin-top: 8px;
}

.radio-options label {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 5px;
    margin: 0;
    font-weight: normal;
    cursor: pointer;
}

.radio-options input {
    width: auto;
    padding: 0;
}

/* Toggle switches */

.toggle {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    margin-top: 8px;
    cursor: pointer;
    font-weight: normal;
}

.toggle-checkbox {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
}

.toggle-switch {
    position: relative;
    width: 44px;
    height: 24px;
    flex-shrink: 0;
    background: var(--tg4-grey-2);
    border-radius: 24px;
    transition: background-color 0.2s ease;
}

.toggle-switch::after {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 18px;
    height: 18px;
    background: white;
    border-radius: 50%;
    transition: transform 0.2s ease;
}

.toggle-checkbox:checked + .toggle-switch {
    background-color: var(--link-colour);
}

.toggle-checkbox:checked + .toggle-switch::after {
    transform: translateX(20px);
}

.toggle-checkbox:focus-visible + .toggle-switch {
    outline: 2px solid var(--link-colour);
    outline-offset: 2px;
}

.toggle-label {
    font-weight: normal;
}

/* Irish level */

.irish-options {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    gap: 10px;
    margin-top: 8px;
}

.irish-options label {
    cursor: pointer;
}

.irish-options input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
}

.irish-options span {
    display: block;
    padding: 10px 20px;
    background: var(--tg4-grey-2);
    color: white;
    border-radius: 0px;
    transition:
        background-color 0.2s ease,
        color 0.2s ease;
}

.irish-options label.selected span {
    background-color: var(--link-colour);
    color: white;
}

.notification {
    display: block;
    padding: 10px 20px;
    background: var(--tg4-grey-2);
    color: white;
    border-radius: 0px;
    transition:
        background-color 0.2s ease,
        color 0.2s ease;
}

@media (max-width: 1160px) {
    .account-layout {
        grid-template-columns: 200px minmax(0, 700px);
        gap: 20px;
    }

    .account-sidebar {
        display: none;
    }
}

@media (max-width: 800px) {
    .account-layout {
        grid-template-columns: 1fr;
        gap: 20px;
    }

    .account-tabs {
        flex-direction: row;
        gap: 25px;
        padding-top: 0;
    }

    .account-sidebar {
        display: none;
    }
}
</style>