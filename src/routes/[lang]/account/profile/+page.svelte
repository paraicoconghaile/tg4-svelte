<script lang="ts">
    import { onMount } from 'svelte';
    import { loadPeachUser } from '$lib/sso/peach';
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
                changed: 'Password Changed!',
                incorrect: 'Current Password is incorrect.',
                weak: 'New Password is not strong enough.'
            },
            email: {
                changed: 'Email Changed!',
                verification: 'Email with verification link sent to new email address.',
                taken: 'New Email already taken.',
                incorrect: 'Current Password is incorrect.',
                tooMany: 'Too many requests. Please try later.'
            }
        },
        ga: {
            password: {
                changed: 'Athraíodh an pasfhocal!',
                incorrect: 'Tá an pasfhocal reatha mícheart.',
                weak: 'Níl an pasfhocal nua sách láidir.'
            },
            email: {
                changed: 'Athraíodh an seoladh ríomhphoist!',
                verification: 'Seoladh ríomhphost le nasc fíoraithe chuig an seoladh ríomhphoist nua.',
                taken: 'Tá an seoladh ríomhphoist nua in úsáid cheana féin.',
                incorrect: 'Tá an pasfhocal reatha mícheart.',
                tooMany: 'An iomarca iarratas. Bain triail eile as ar ball.'
            }
        }
    };

    const messages = accountMessages[page.params.lang === 'ga' ? 'ga' : 'en'];

    onMount(async () => {
        console.log('ACCOUNT: onMount');

        try {
            console.log('ACCOUNT: loading Peach User');

            pu = await loadPeachUser();

            console.log('ACCOUNT: Peach User loaded', pu);

            profile = await pu.getCombinedSessionAndPreferenceProfile();

            console.log('ACCOUNT: PROFILE:', profile);

            newEmail = profile.profile.contactEmail;

            loading = false;

            console.log('ACCOUNT: loading complete');

        } catch (err) {
            console.error('ACCOUNT: Profile error:', err);
            error = err instanceof Error ? err.message : String(err);
            loading = false;
        }
    });

    async function changeEmail() {
        emailMessage = '';

        if (!newEmail.trim()) {
            emailMessage = 'Please enter an email address.';
            return;
        }

        if (!emailPassword) {
            emailMessage = 'Please enter your current password.';
            return;
        }

        updatingEmail = true;

        try {
            const response = await pu.changeEmail(newEmail.trim(), emailPassword);

            console.log('CHANGE EMAIL RESPONSE:', response);

            switch (response) {
                case 200:
                    emailMessage = messages.email.changed;
                    break;

                case 204:
                    emailMessage = messages.email.verification;
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
                    emailMessage = 'Unable to update email address.';
                    break;
            }

            if (response === 200 || response === 204) {
                emailPassword = '';
            }

        } catch (err) {
            console.error('Change email error:', err);
            emailMessage = 'Unable to update email address.';
        } finally {
            updatingEmail = false;
        }
    }

    async function changePassword() {
        passwordMessage = '';

        if (!currentPassword || !newPassword) {
            passwordMessage = 'Please enter your current and new password.';
            return;
        }

        updatingPassword = true;

        try {
            const response = await pu.updatePassword(
                profile.profile.contactEmail,
                newPassword,
                currentPassword
            );

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
                    passwordMessage = 'Unable to update password.';
                    break;
            }

        } catch (err) {
            console.error('Change password error:', err);
            passwordMessage = 'Unable to update password.';
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

                    <button type="submit" disabled={updatingEmail}>
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

                    <button type="submit" disabled={updatingPassword}>
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
</style>