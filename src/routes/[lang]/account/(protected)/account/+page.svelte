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
    <p class="frmTitle">{messages.labels.account}</p>

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
                <button type="submit" disabled={updatingEmail}>
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
                <button type="submit" disabled={updatingPassword}>
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
</style>