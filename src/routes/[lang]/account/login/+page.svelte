<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    import { loadPeachUser } from '$lib/sso/peach';
    import Eye from '$lib/components/icons/Eye.svelte';
    import EyeOff from '$lib/components/icons/EyeOff.svelte';
    import { withBase } from '$lib/utils/paths';

    let email = $state('');
    let password = $state('');

    let checkingAuth = $state(true);
    let loggingIn = $state(false);
    let error = $state('');

    let pu = $state<any>(null);

    let showPassword = $state(false);

    const loginMessages = {
        en: {
            labels: {
                email: 'Email address',
                password: 'Password',
                loading: 'Loading...',
                login: 'Login',
                loggingIn: 'Logging in...',
                forgotPassword: 'Forgot your password?',
                needAccount: 'Need an account?',
                register: 'Signup',
                enterEmail: 'Please enter your email address and password.',
                invalidDetails: 'Invalid email address or password.',
                errorLogin: 'Unable to initialise login.'
            }
        },
        ga: {
            labels: {
                email: 'Seoladh ríomhphoist',
                password: 'Pasfhocal',
                loading: 'Ag lódáil...',
                login: 'Logáil isteach',
                loggingIn: 'Ag logáil isteach...',
                forgotPassword: 'Pasfhocal dearmadta?',
                needAccount: 'Cuntas uait?',
                register: 'Cláraigh',
                enterEmail: 'Cur isteach do seoladh rphost agus pasfhocal.',
                invalidDetails: 'Invalid email address or password.',
                errorLogin: 'Unable to initialise login.'
            }
        }
    };

    const messages = $derived(loginMessages[page.params.lang === 'ga' ? 'ga' : 'en']);

    onMount(async () => {
        //console.log('LOGIN MOUNT', page.url.pathname);
        try {
            pu = await loadPeachUser();
            //console.log('LOGIN PEACH LOADED');

            // Already logged in?
            try {
                await pu.isAuthorized();
                //console.log('LOGIN: ALREADY LOGGED IN');

                // If this succeeds, they're already logged in
                window.location.href = withBase(`/${page.params.lang}/account/account/`);
                return;

            } catch {
                // Not logged in - that's fine
            }
        } catch (err) {
            console.error('Peach User error:', err);
            error = messages.labels.errorLogin;
        } finally {
            checkingAuth = false;
        }
    });

    async function login() {
        error = '';

        if (!email || !password) {
            error = messages.labels.enterEmail;
            return;
        }

        loggingIn = true;

        try {
            const response = await pu.login(email, password);

            //console.log('LOGIN RESPONSE:', response);

            if (response.status !== 204) {
                error = messages.labels.invalidDetails;
                loggingIn = false;
                return;
            }

            //console.log('LOGIN SUCCESS');

            try {
                const profile = await pu.getCombinedSessionAndPreferenceProfile();

                //console.log('PROFILE:', profile);
            } catch (err) {
                console.error('PROFILE ERROR:', err);
            }

            loggingIn = false;

            window.location.href = withBase(`/${page.params.lang}/account/account/`);

        } catch (err) {
            console.error('Login error:', err);
            error = messages.labels.invalidDetails;
            loggingIn = false;
        }
    }
</script>

<div class="account-page">
    {#if checkingAuth}
        <p>{messages.labels.loading}</p>
    {:else}
        <p class="frmTitle">{messages.labels.login}</p>

        <form onsubmit={(event) => { event.preventDefault(); login(); }}>
            <div class="form-field">
                <label for="loginEmail">{messages.labels.email}</label>
                <input id="loginEmail" type="email" bind:value={email} autocomplete="email" />
            </div>
            <div class="form-field">
                <label for="loginPassword">{messages.labels.password}</label>
                <div class="password-input">
                    <input id="loginPassword" type={showPassword ? 'text' : 'password'} bind:value={password} autocomplete="current-password" />
                    <button type="button" class="password-toggle" onclick={() => showPassword = !showPassword} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {#if showPassword}
                        <EyeOff />
                    {:else}
                        <Eye />
                    {/if}
                    </button>
                </div>
            </div>
            <div class="form-field">
                <button type="submit" disabled={loggingIn}>{loggingIn ? messages.labels.loggingIn : messages.labels.login}</button>
            </div>
            <div class="form-field">
                {#if error}
                    <p class="error">{error}</p>
                {/if}
            </div>
        </form>

        <div class="account-links">
            <a href={withBase(`/${page.params.lang}/account/forgot-password`)}>{messages.labels.forgotPassword}</a> | 
                {messages.labels.needAccount}, <a href={withBase(`/${page.params.lang}/account/sign-up`)}>{messages.labels.register}</a>
        </div>
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
    display: block;
    padding: 10px 20px;
    background: var(--tg4-grey-2);
    color: red;
    border-radius: 0px;
    transition:
        background-color 0.2s ease,
        color 0.2s ease;
}

.form-field {
    margin-bottom: 20px;
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

.account-links {
    margin-top: 1.5rem;
    text-align: center;
}

.account-links > a {
    display: inline-block;
    margin-bottom: 1rem;
}

.account-links p {
    margin: 0;
}

.account-links a {
    text-decoration: underline;
    text-underline-offset: 3px;
}

.account-links a:hover {
    opacity: 1;
}
</style>