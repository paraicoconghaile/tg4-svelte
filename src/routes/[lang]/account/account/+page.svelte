<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    import { goto } from '$app/navigation';
    import { requireAuthentication } from '$lib/sso/auth';
    import Eye from '$lib/components/icons/Eye.svelte';
    import EyeOff from '$lib/components/icons/EyeOff.svelte';
    import { withBase } from '$lib/utils/paths';
    import { isProfileComplete } from '$lib/sso/profile-complete';

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

    let showEmailPassword = $state(false);
    let showCurrentPassword = $state(false);
    let showNewPassword = $state(false);
    let profileComplete = $state(false);

    const accountMessages = {
        en: {
            labels: {
                account: 'Edit account details',
                accountLink: 'Account',
                profile: 'Profile',
                preferences: 'Preferences',
                email: 'Email address',
                updateEmail: 'Update Email',
                updatePassword: 'Update Password',
                password: 'Password',
                currentPassword: 'Current password',
                newPassword: 'New password',
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
                account: 'Athraigh do chuntas',
                accountLink: 'Cuntas',
                profile: 'Próifíl',
                preferences: 'Sainrogha phearsanta',
                updateEmail: 'Athraigh Ríomhphost',
                updatePassword: 'Athraigh Pasfhocal',
                email: 'Seoladh ríomhphoist',
                password: 'Pasfhocal',
                currentPassword: 'Pasfhocal reatha',
                newPassword: 'Pasfhocal nua',
                updating: 'Ag uasdhátú...',
                loading: 'Ag lódáil...'
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
        
            // Check whether the profile is complete
            profileComplete = isProfileComplete(profile);

            newEmail = profile.profile.contactEmail;
            loading = false;

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

<section class="account-page">
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
                        <a href={withBase(`/${page.params.lang}/account/account`)} class="active">{messages.labels.accountLink}</a>
                        <a href={withBase(`/${page.params.lang}/account/profile`)}>{messages.labels.profile}</a>
                        <!-- <a href={withBase(`/${page.params.lang}/account/preferences`)}>{messages.labels.preferences}</a> -->
                        {#if profileComplete}
                            <a href={withBase(`/${page.params.lang}/account/preferences`)}>
                                {messages.labels.preferences}
                            </a>
                        {:else}
                            <span class="disabled" aria-disabled="true" title={page.params.lang === 'ga' ? 'Comhlánaigh do phróifíl chun rochtain a fháil ar shainroghanna.' : 'Complete your profile to access preferences.'}>
                                {messages.labels.preferences}
                            </span>
                        {/if}
                    </nav>

                    <!-- MIDDLE COLUMN -->
                    <div class="account-content">
                        <h1>{messages.labels.account}</h1>

                        <!-- EMAIL -->
                        <div class="account-section">
                            <form onsubmit={(event) => { event.preventDefault(); changeEmail(); }}>
                                <div class="form-field">
                                    <label for="email">{messages.labels.email}</label>
                                    <input id="email" type="email" bind:value={newEmail} />
                                </div>

                                <div class="form-field">
                                    <label for="email-password">
                                        {messages.labels.currentPassword}
                                    </label>

                                    <div class="password-input">
                                        <input id="email-password" type={showEmailPassword ? 'text' : 'password'} bind:value={emailPassword} />

                                        <button type="button" class="password-toggle" onclick={() => showEmailPassword = !showEmailPassword} aria-label={showEmailPassword ? 'Hide password' : 'Show password'}>
                                            {#if showEmailPassword}
                                                <EyeOff />
                                            {:else}
                                                <Eye />
                                            {/if}
                                        </button>
                                    </div>
                                </div>

                                <div class="form-field">
                                    <button type="submit" disabled={updatingEmail} class="form-button">
                                        {updatingEmail ? messages.labels.updating : messages.labels.updateEmail}
                                    </button>
                                </div>
                            </form>

                            {#if emailMessage}
                                <p class="notification">{emailMessage}</p>
                            {/if}
                        </div>

                        <!-- PASSWORD -->
                        <div class="account-section">
                            <form onsubmit={(event) => { event.preventDefault(); changePassword(); }}>
                                <div class="form-field">
                                    <label for="current-password">
                                        {messages.labels.currentPassword}
                                    </label>

                                    <div class="password-input">
                                        <input id="current-password" type={showCurrentPassword ? 'text' : 'password'} bind:value={currentPassword} />

                                        <button type="button" class="password-toggle" onclick={() => showCurrentPassword = !showCurrentPassword} aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}>
                                            {#if showCurrentPassword}
                                                <EyeOff />
                                            {:else}
                                                <Eye />
                                            {/if}
                                        </button>
                                    </div>
                                </div>

                                <div class="form-field">
                                    <label for="new-password">
                                        {messages.labels.newPassword}
                                    </label>

                                    <div class="password-input">
                                        <input id="new-password" type={showNewPassword ? 'text' : 'password'} bind:value={newPassword} />

                                        <button type="button" class="password-toggle" onclick={() => showNewPassword = !showNewPassword} aria-label={showNewPassword ? 'Hide password' : 'Show password'}>
                                            {#if showNewPassword}
                                                <EyeOff />
                                            {:else}
                                                <Eye />
                                            {/if}
                                        </button>
                                    </div>
                                </div>

                                <div class="form-field">
                                    <button type="submit" disabled={updatingPassword} class="form-button">
                                        {updatingPassword ? messages.labels.updating : messages.labels.updatePassword}
                                    </button>
                                </div>
                            </form>

                            {#if passwordMessage}
                                <p class="notification">{passwordMessage}</p>
                            {/if}
                        </div>
                    </div>

                    <!-- RIGHT COLUMN -->
                    <div class="account-sidebar"></div>
                </div>
            </section>
        {/if}
    </section>
</section>

<style>
.account-page {
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
    padding: 10px 0px;
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

.form-field {
    margin-bottom: 10px;
}

.form-field label {
    display: block;
    margin-bottom: 4px;
    font-weight: bold;
}

.form-field input {
    width: 100%;
    box-sizing: border-box;
    padding: 10px;
}

.password-input {
    position: relative;
}

.password-input input {
    width: 100%;
    padding-right: 45px;
}

.password-toggle {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    border: 0;
    background: none;
    padding: 5px;
    cursor: pointer;
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