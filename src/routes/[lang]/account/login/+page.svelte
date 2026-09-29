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

        <form onsubmit={(event) => {
            event.preventDefault();
            login();
        }}>

            <div class="form-field">
                <label for="loginEmail">Email</label>

                <input
                    id="loginEmail"
                    type="email"
                    bind:value={email}
                    autocomplete="email"
                />
            </div>

            <div class="form-field">
                <label for="loginPassword">Password</label>

                <input
                    id="loginPassword"
                    type="password"
                    bind:value={password}
                    autocomplete="current-password"
                />
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