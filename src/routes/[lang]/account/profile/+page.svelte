<script lang="ts">
    import { onMount } from 'svelte';
    import { loadPeachUser } from '$lib/sso/peach';
    import { goto } from '$app/navigation';
    import { page } from '$app/state';

    let loading = true;
    let error = '';

    let pu: any = null;
    let profile: any = null;

    // Email
    let newEmail = '';
    let emailPassword = '';
    let emailMessage = '';
    let updatingEmail = false;

    // Password
    let currentPassword = '';
    let newPassword = '';
    let passwordMessage = '';
    let updatingPassword = false;

    const accountMessages = {
        en: {
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

    const messages = accountMessages[page.params.lang === 'ga' ? 'ga' : 'en'];

    onMount(async () => {
        try {
            console.log('ACCOUNT: loading Peach User');
            pu = await loadPeachUser();
            console.log('ACCOUNT: Peach User loaded', pu);
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
            console.log('ACCOUNT: loading complete');
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
            <h2>Account</h2>

            <!-- EMAIL -->
            <div class="account-section">
                <h3>Email address</h3>
                <form onsubmit={(event) => {event.preventDefault(); changeEmail();}}>
                    <label for="email">Email address</label>

                    <input id="email" type="email" bind:value={newEmail}/>

                    <label for="email-password">Current password</label>

                    <input id="email-password" type="password" bind:value={emailPassword}/>

                    <button type="submit" disabled={updatingEmail} class="language-switch">
                        {updatingEmail ? 'Updating...' : 'Update email'}
                    </button>
                </form>

                {#if emailMessage}
                    <p>{emailMessage}</p>
                {/if}
            </div>

            <!-- PASSWORD -->
            <div class="account-section">
                <h3>Password</h3>

                <form onsubmit={(event) => {event.preventDefault(); changePassword();}}>
                    <label for="current-password">Current password</label>

                    <input id="current-password" type="password" bind:value={currentPassword}/>

                    <label for="new-password">New password</label>

                    <input id="new-password" type="password" bind:value={newPassword}/>

                    <button type="submit" disabled={updatingPassword} class="language-switch">
                        {updatingPassword ? 'Updating...' : 'Update password'}
                    </button>

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
</style>