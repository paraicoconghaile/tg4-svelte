<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    import { goto } from '$app/navigation';
    import { loadPeachUser } from '$lib/sso/peach';

    let loading = $state(true);
    let error = $state('');

    let pu = $state<any>(null);
    let profile = $state<any>(null);

    // Email
    let newEmail = $state('');
    let emailPassword = $state('');
    let emailMessage = $state('');
    let updatingEmail = $state(false);

    // Password
    let currentPassword = $state('');
    let newPassword = $state('');
    let passwordMessage = $state('');
    let updatingPassword = $state(false);

    const accountMessages = {
        en: {
            labels: {
                account: 'Account',
                profile: 'Profile',
                preferences: 'Preferences',
                email: 'Email address',
                password: 'Password',
                currentPassword: 'Current password',
                newPassword: 'New password',
                updateEmail: 'Update email',
                updatePassword: 'Update password',
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
                email: 'Seoladh ríomhphoist',
                password: 'Pasfhocal',
                currentPassword: 'Pasfhocal reatha',
                newPassword: 'Pasfhocal nua',
                updateEmail: 'Nuashonraigh an seoladh ríomhphoist',
                updatePassword: 'Nuashonraigh an pasfhocal',
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

    const messages = $derived(accountMessages[page.params.lang === 'ga' ? 'ga' : 'en']);

    onMount(async () => {
        try {
            //console.log('ACCOUNT: loading Peach User');
            pu = await loadPeachUser();
            //console.log('ACCOUNT: Peach User loaded', pu);
            profile = await pu.getCombinedSessionAndPreferenceProfile();
            console.log('PROFILE:', profile);

            const unauthorized =
                profile?.profile?.error === 'Unauthorized' ||
                profile?.preferences?.error === 'Unauthorized';

            if (unauthorized) {
                await goto(`/${page.params.lang}/account/login`);
                return;
            }

            newEmail = profile.profile.contactEmail;
            loading = false;
            //console.log('ACCOUNT: loading complete');
        } catch (err) {
            console.error('Profile error:', err);
            error = err instanceof Error ? err.message : String(err);
            loading = false;
        }
    });

    async function changeEmail() {
        emailMessage = '';

        if (!newEmail.trim()) {
            emailMessage = messages.email.required;
            return;
        }

        if (!emailPassword) {
            emailMessage = messages.email.passwordRequired;
            return;
        }

        updatingEmail = true;

        try {
            const response = await pu.changeEmail(newEmail.trim(), emailPassword);

            console.log('CHANGE EMAIL RESPONSE:', response);

            switch (response) {
                case 200:
                    emailMessage = messages.email.changed;
                    emailPassword = '';
                    break;

                case 204:
                    emailMessage = messages.email.verification;
                    emailPassword = '';
                    break;

                case 400:
                    emailMessage = messages.email.taken;
                    break;

                case 401:
                    emailMessage = messages.email.incorrect;
                    break;

                case 429:
                    emailMessage = messages.email.tooMany;
                    break;

                default:
                    emailMessage = messages.email.error;
                    break;
            }

        } catch (err) {
            console.error('Change email error:', err);
            emailMessage = messages.email.error;
        } finally {
            updatingEmail = false;
        }
    }

    async function changePassword() {
        passwordMessage = '';

        if (!currentPassword || !newPassword) {
            passwordMessage = messages.password.required;
            return;
        }

        updatingPassword = true;

        try {
            const response = await pu.updatePassword(profile.profile.contactEmail, newPassword, currentPassword);

            console.log('CHANGE PASSWORD RESPONSE:', response);

            switch (response) {
                case 200:
                case 204:
                    passwordMessage = messages.password.changed;
                    currentPassword = '';
                    newPassword = '';
                    break;

                case 401:
                    passwordMessage = messages.password.incorrect;
                    break;

                case 500:
                    passwordMessage = messages.password.weak;
                    break;

                default:
                    passwordMessage = messages.password.error;
                    break;
            }

        } catch (err) {
            console.error('Change password error:', err);
            passwordMessage = messages.password.error;
        } finally {
            updatingPassword = false;
        }
    }
</script>

<section class="profile-page">
    {#if loading}
        <p>Loading...</p>
    {:else if error}
        <p>{error}</p>
    {:else}
        <section class="account">
            <h2>{messages.labels.account}</h2>

            <nav class="account-tabs">
                <a href={`/${page.params.lang}/account/account`} class="active">{messages.labels.account}</a>
                <a href={`/${page.params.lang}/account/profile`}>{messages.labels.profile}</a>
                <a href={`/${page.params.lang}/account/preferences`}>{messages.labels.preferences}</a>
            </nav>

            <!-- EMAIL -->
            <div class="account-section">
                <h3>{messages.labels.email}</h3>

                <form onsubmit={(event) => {event.preventDefault(); changeEmail();}}>
                    <div class="form-field">
                        <label for="email">{messages.labels.email}</label>
                        <input id="email" type="email" bind:value={newEmail}/>
                    </div>
                    <div class="form-field">
                        <label for="email-password">{messages.labels.currentPassword}</label>
                        <input id="email-password" type="password" bind:value={emailPassword}/>
                    </div>
                    <div class="form-field">
                        <button type="submit" disabled={updatingEmail} class="language-switch">{updatingEmail ? messages.labels.updating : messages.labels.updateEmail}</button>
                    </div>
                </form>

                {#if emailMessage}
                    <p>{emailMessage}</p>
                {/if}
            </div>

            <!-- PASSWORD -->
            <div class="account-section">
                <h3>{messages.labels.currentPassword}</h3>

                <form onsubmit={(event) => {event.preventDefault(); changePassword();}}>
                    <div class="form-field">
                        <label for="current-password">{messages.labels.currentPassword}</label>
                        <input id="current-password" type="password" bind:value={currentPassword}/>
                    </div>
                    <div class="form-field">
                        <label for="new-password">{messages.labels.newPassword}</label>
                        <input id="new-password" type="password" bind:value={newPassword}/>
                    </div>
                    <div class="form-field">
                        <button type="submit" disabled={updatingPassword} class="language-switch">{updatingPassword ? messages.labels.updating : messages.labels.updatePassword}</button>
                    </div>
                </form>

                {#if passwordMessage}
                    <p>{passwordMessage}</p>
                {/if}
            </div>
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

.account-section form {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.account-section label {
    margin-top: 5px;
}

.account-section input {
    width: 100%;
    box-sizing: border-box;
}

.account-section button {
    align-self: flex-start;
    margin-top: 10px;
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