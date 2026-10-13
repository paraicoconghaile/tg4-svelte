<script lang="ts">
    import { getContext, onMount } from 'svelte';
    import { page } from '$app/state';
    import Eye from '$lib/components/icons/Eye.svelte';
    import EyeOff from '$lib/components/icons/EyeOff.svelte';

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

    const accountMessages = {
        en: {
            labels: {
                account: 'Edit account details',
                email: 'Email address',
                updateEmail: 'Update Email',
                updatePassword: 'Update Password',
                currentPassword: 'Current password',
                newPassword: 'New password',
                updating: 'Updating...'
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
                email: 'Seoladh ríomhphoist',
                updateEmail: 'Athraigh Ríomhphost',
                updatePassword: 'Athraigh Pasfhocal',
                currentPassword: 'Pasfhocal reatha',
                newPassword: 'Pasfhocal nua',
                updating: 'Ag uasdhátú...'
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

    const messages = $derived(
        accountMessages[page.params.lang === 'ga' ? 'ga' : 'en']
    );

    const account = getContext<{
        pu: any;
        profile: any;
    }>('tg4-account');

    onMount(() => {
        newEmail = account.profile?.profile?.contactEmail ?? '';
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
            const response = await account.pu.changeEmail(newEmail.trim(), emailPassword);

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
            const response = await account.pu.updatePassword(
                account.profile.profile.contactEmail,
                newPassword,
                currentPassword
            );

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
            }
        } catch (err) {
            console.error('Change password error:', err);
            passwordMessage = messages.password.error;
        } finally {
            updatingPassword = false;
        }
    }
</script>

<div class="account-page-content">
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
                    <input
                        id="email-password"
                        type={showEmailPassword ? 'text' : 'password'}
                        bind:value={emailPassword}
                    />

                    <button
                        type="button"
                        class="password-toggle"
                        onclick={() => showEmailPassword = !showEmailPassword}
                        aria-label={showEmailPassword ? 'Hide password' : 'Show password'}
                    >
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
                    <input
                        id="current-password"
                        type={showCurrentPassword ? 'text' : 'password'}
                        bind:value={currentPassword}
                    />

                    <button
                        type="button"
                        class="password-toggle"
                        onclick={() => showCurrentPassword = !showCurrentPassword}
                        aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                    >
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
                    <input
                        id="new-password"
                        type={showNewPassword ? 'text' : 'password'}
                        bind:value={newPassword}
                    />

                    <button
                        type="button"
                        class="password-toggle"
                        onclick={() => showNewPassword = !showNewPassword}
                        aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                    >
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