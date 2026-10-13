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
    let isVerified = $derived(profile?.profile?.verified === true);

    let sendingVerification = $state(false);
    let verificationMessage = $state('');
    let verificationError = $state('');

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
                loading: 'Loading...',
                logout: 'Logout',
                bookmarks: 'Bookmarks',
                history: 'History'
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
                loading: 'Ag lódáil...',
                logout: 'Logáil Amach',
                bookmarks: 'Leabharmharcanna',
                history: 'Stair'
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

    async function sendVerificationEmail() {
        verificationMessage = '';
        verificationError = '';
        sendingVerification = true;

        try {
            const response = await fetch(
                'https://api.tg4.ie/sso-verify-dev',
                {
                    method: 'POST',
                    credentials: 'include'
                }
            );

            if (response.status === 200 || response.status === 204) {
                verificationMessage =
                    page.params.lang === 'ga'
                        ? 'Seoladh an nasc fíoraithe chuig do sheoladh ríomhphoist.'
                        : 'Verification link sent to your email address.';
            } else {
                const responseText = await response.text();
                console.error(
                    'Verification error:',
                    response.status,
                    responseText
                );

                verificationError =
                    page.params.lang === 'ga'
                        ? 'Níorbh fhéidir an ríomhphost fíoraithe a sheoladh. Bain triail eile as.'
                        : 'Could not send the verification email. Please try again.';
            }
        } catch (err) {
            console.error('Verification request failed:', err);

            verificationError =
                page.params.lang === 'ga'
                    ? 'Tharla earráid líonra. Bain triail eile as.'
                    : 'A network error occurred. Please try again.';
        } finally {
            sendingVerification = false;
        }
    }

    async function logout() {
        try {
            await _pu.logout();
        } finally {
            window.location.href = withBase(`/${page.params.lang}/account/login`);
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
                    <!-- LEFT COLUMN - MAIN NAVIGATION -->
                    <nav class="account-main-nav" aria-label="Account navigation">
                        <a
                            href={withBase(`/${page.params.lang}/account/account`)}
                            class:active={page.url.pathname.endsWith('/account/account')}
                        >
                            {messages.labels.accountLink}
                        </a>

                        {#if isVerified}
                            <a href={withBase(`/${page.params.lang}/account/profile`)}>
                                {messages.labels.profile}
                            </a>
                        {:else}
                            <span class="disabled" aria-disabled="true">
                                {messages.labels.profile}
                            </span>
                        {/if}

                        {#if profileComplete}
                            <a href={withBase(`/${page.params.lang}/account/preferences`)}>
                                {messages.labels.preferences}
                            </a>
                        {:else}
                            <span class="disabled" aria-disabled="true" title={page.params.lang === 'ga'
                                    ? 'Comhlánaigh do phróifíl chun rochtain a fháil ar shainroghanna.'
                                    : 'Complete your profile to access preferences.'}>
                                {messages.labels.preferences}
                            </span>
                        {/if}

                        {#if isVerified}
                            <a href={withBase(`/${page.params.lang}/account/bookmarks`)}>
                                {messages.labels.bookmarks}
                            </a>
                        {:else}
                            <span class="disabled" aria-disabled="true">
                                {messages.labels.bookmarks}
                            </span>
                        {/if}

                        {#if isVerified}
                            <a href={withBase(`/${page.params.lang}/account/history`)}>
                                {messages.labels.history}
                            </a>
                        {:else}
                            <span class="disabled" aria-disabled="true">
                                {messages.labels.history}
                            </span>
                        {/if}
                    </nav>

                    <!-- MIDDLE COLUMN - FORM -->
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

                    <!-- SECONDARY NAVIGATION -->
                    <nav class="account-secondary-nav" aria-label="Account actions">
                        {#if profile?.profile?.verified === false}
                            <div class="verification-section">
                                <p>{page.params.lang === 'ga' ? 'Níl do sheoladh ríomhphoist fíoraithe fós.' : 'Your email address is not verified yet.'}</p>

                                <button
                                    type="button"
                                    class="sidebar-link"
                                    onclick={sendVerificationEmail}
                                    disabled={sendingVerification}
                                >
                                    {sendingVerification
                                        ? (page.params.lang === 'ga' ? 'Á sheoladh…' : 'Sending…')
                                        : (page.params.lang === 'ga'
                                            ? 'Fíoraigh do sheoladh ríomhphoist'
                                            : 'Verify your email')}
                                </button>

                                {#if verificationMessage}
                                    <p role="status">{verificationMessage}</p>
                                {/if}

                                {#if verificationError}
                                    <p class="error" role="alert">{verificationError}</p>
                                {/if}
                            </div>
                        {/if}

                        <a
                            href={withBase(`/${page.params.lang}/account/delete-account`)}
                            class="delete-account-link"
                        >
                            {page.params.lang === 'ga' ? 'Scrios cuntas' : 'Delete account'}
                        </a>

                        <button type="button" class="logout-link" onclick={logout}>{messages.labels.logout}</button>
                    </nav>

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
    grid-template-columns: 220px minmax(0, 1fr) 180px;
    grid-template-rows: auto 1fr;
    grid-template-areas:
        "main content sidebar"
        "secondary content sidebar";
    column-gap: 2rem;
    row-gap: 1.5rem;
    align-items: start;
}

.account-main-nav {
    grid-area: main;
}

.account-content {
    grid-area: content;
    min-width: 0;
}

.account-secondary-nav {
    grid-area: secondary;
    align-self: end;
}

.account-sidebar {
    grid-area: sidebar;
}

.account-main-nav,
.account-secondary-nav {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding-top: 42px;
}

.account-main-nav a,
.account-secondary-nav a,
.logout-link {
    text-decoration: none;
}

.account-main-nav a.active {
    font-weight: 700;
}

.verification-section {
    margin-bottom: 0.75rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #ddd;
}

.verification-section p {
    font-size: 0.9rem;
    line-height: 1.5;
}

.sidebar-link,
.logout-link {
    padding: 0;
    border: 0;
    background: none;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
}

.sidebar-link {
    text-decoration: underline;
    text-underline-offset: 3px;
}

.delete-account-link {
    color: #c62828;
}

.logout-link {
    cursor: pointer;
}

.sidebar-link:disabled {
    opacity: 0.6;
    cursor: wait;
}

.delete-account-link:hover {
    color: #8e0000;
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

.account-main-nav a,
.account-secondary-nav a,
.account-secondary-nav .logout-link {
    display: inline-block;
    width: fit-content;
    padding-bottom: 5px;
    border-bottom: 2px solid transparent;
    text-decoration: none;
    transition: border-color 0.2s ease;
}

.account-main-nav a:hover,
.account-main-nav a.active,
.account-secondary-nav a:hover,
.account-secondary-nav a.active,
.account-secondary-nav .logout-link:hover,
.account-secondary-nav .logout-link.active {
    border-bottom-color: #FF126C;
}

.account-main-nav .disabled {
    color: inherit;
    opacity: 0.45;
    cursor: not-allowed;
    pointer-events: none;
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
        grid-template-columns: minmax(0, 1fr);
        grid-template-rows: auto auto auto;
        grid-template-areas:
            "main"
            "content"
            "secondary";
        row-gap: 1.5rem;
    }

    .account-main-nav {
        grid-area: main;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        gap: 0.75rem 1.25rem;
    }

    .account-content {
        grid-area: content;
    }

    .account-secondary-nav {
        grid-area: secondary;
        padding-top: 0;
    }

    .account-sidebar {
        display: none;
    }
}
</style>