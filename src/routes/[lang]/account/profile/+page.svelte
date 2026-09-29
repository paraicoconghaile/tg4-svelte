<script lang="ts">
    import { onMount } from 'svelte';
    import { loadPeachUser } from '$lib/sso/peach';

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

    onMount(async () => {
        try {
            pu = await loadPeachUser();

            profile = await pu.getCombinedSessionAndPreferenceProfile();

            console.log('PROFILE:', profile);

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
            emailMessage = 'Please enter an email address.';
            return;
        }

        if (!emailPassword) {
            emailMessage = 'Please enter your current password.';
            return;
        }

        updatingEmail = true;

        try {
            const response = await pu.changeEmail(
                newEmail.trim(),
                emailPassword
            );

            console.log('CHANGE EMAIL RESPONSE:', response);

            switch (response.status) {
                case 200:
                    emailMessage = 'Email Changed!';
                    break;

                case 204:
                    emailMessage =
                        'Email with verification link sent to new email address.';
                    break;

                case 400:
                    emailMessage = 'New Email already taken.';
                    break;

                case 401:
                    emailMessage = 'Current Password is incorrect.';
                    break;

                case 429:
                    emailMessage =
                        'Too many requests. Please try later.';
                    break;

                default:
                    emailMessage =
                        'Unable to update email address.';
            }

            if (response.status === 200 || response.status === 204) {
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

            passwordMessage = 'Password updated.';

            currentPassword = '';
            newPassword = '';
        } catch (err) {
            console.error('Change password error:', err);
            passwordMessage = 'Unable to update password.';
        } finally {
            updatingPassword = false;
        }
    }
</script>

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

            <form
                onsubmit={(event) => {
                    event.preventDefault();
                    changeEmail();
                }}
            >

                <label for="email">
                    Email address
                </label>

                <input
                    id="email"
                    type="email"
                    bind:value={newEmail}
                />

                <label for="email-password">
                    Current password
                </label>

                <input
                    id="email-password"
                    type="password"
                    bind:value={emailPassword}
                />

                <button
                    type="submit"
                    disabled={updatingEmail}
                >
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

            <form
                onsubmit={(event) => {
                    event.preventDefault();
                    changePassword();
                }}
            >

                <label for="current-password">
                    Current password
                </label>

                <input
                    id="current-password"
                    type="password"
                    bind:value={currentPassword}
                />

                <label for="new-password">
                    New password
                </label>

                <input
                    id="new-password"
                    type="password"
                    bind:value={newPassword}
                />

                <button
                    type="submit"
                    disabled={updatingPassword}
                >
                    {updatingPassword ? 'Updating...' : 'Update password'}
                </button>

            </form>

            {#if passwordMessage}
                <p>{passwordMessage}</p>
            {/if}

        </div>

    </section>

{/if}