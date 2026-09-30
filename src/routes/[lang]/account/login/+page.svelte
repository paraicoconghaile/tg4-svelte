<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    import { loadPeachUser } from '$lib/sso/peach';

    let email = '';
    let password = '';

    let loading = true;
    let loggingIn = false;
    let error = '';

    let pu: any;

    const loginMessages = {
        en: {
            labels: {
                account: 'Account',
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

    const messages = $derived(loginMessages[page.params.lang === 'ga' ? 'ga' : 'en']);

    onMount(async () => {
        try {
            pu = await loadPeachUser();

            // Already logged in?
            try {
                await pu.isAuthorized();

                // If this succeeds, they're already logged in
                window.location.href = `/${page.params.lang}/account/profile/`;
            } catch {
                // Not logged in - that's fine
                loading = false;
            }
        } catch (err) {
            console.error('Peach User error:', err);
            error = 'Unable to initialise login.';
            loading = false;
        }
    });

    async function login() {
        error = '';

        if (!email || !password) {
            error = 'Please enter your email address and password.';
            return;
        }

        loggingIn = true;

        try {
            const response = await pu.login(email, password);

            console.log('LOGIN RESPONSE:', response);

            if (response.status !== 204) {
                error = 'Invalid email address or password.';
                loggingIn = false;
                return;
            }

            console.log('LOGIN SUCCESS');

            try {
                const profile = await pu.getCombinedSessionAndPreferenceProfile();

                console.log('PROFILE:', profile);
            } catch (err) {
                console.error('PROFILE ERROR:', err);
            }

            loggingIn = false;

            window.location.href = `/${page.params.lang}/account/profile/`; /* */

        } catch (err) {
            console.error('Login error:', err);

            error = 'Invalid email address or password.';
            loggingIn = false;
        }
    }
</script>

<div class="account-page">
    {#if loading}
        <p>Loading...</p>
    {:else}
        <h1>Login</h1>

        <form onsubmit={(event) => { event.preventDefault(); login(); }}>

            <div class="form-field">
                <label for="loginEmail">{messages.labels.email}</label>
                <input id="loginEmail" type="email" bind:value={email} autocomplete="email" />
            </div>
            <div class="form-field">
                <label for="loginPassword">{messages.labels.password}</label>
                <input id="loginPassword" type="password" bind:value={password} autocomplete="current-password" />
            </div>

            {#if error}
                <p class="error">{error}</p>
            {/if}

            <button type="submit" disabled={loggingIn} class="language-switch">
                {loggingIn ? 'Logging in...' : 'Login'}
            </button>

        </form>
    {/if}
</div>

<style>
.account-page {
    max-width: 700px;
    margin: 0 auto;
    padding: 20px;
    background-color: var(--genre-background);
}

.form-field {
    margin-bottom: 20px;
}

label {
    display: block;
    margin-bottom: 6px;
}

input {
    width: 100%;
    box-sizing: border-box;
    padding: 10px;
}

.error {
    color: red;
}
</style>