<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    import { loadPeachUser } from '$lib/sso/peach';
    import Eye from '$lib/components/icons/Eye.svelte';
    import EyeOff from '$lib/components/icons/EyeOff.svelte';
    import { withBase } from '$lib/utils/paths';

    let email = $state('');
    let submitting = $state(false);
    let error = $state('');
    let success = $state('');

    const resetMessages = {
        en: {
            labels: {
                email: 'Email address',
                password: 'Password',
                login: 'Login',
                forgotPassword: 'Forgot your password?',
                invalidDetails: 'Invalid email address or password.',
                errorLogin: 'Unable to initialise login.',
                passwordResetIntro: 'Enter your email address and we\'ll send instructions to reset your password.',
                resetPassword: 'Reset Password',
                sending: 'Sending...',
                passwordResetSent: 'If an account exists for this email address, password reset instructions have been sent.',
                passwordResetFailed: 'Unable to process your request. Please try again.',
                passwordResetNetworkError: 'Network error. Please try again.'
            }
        },
        ga: {
            labels: {
                email: 'Seoladh ríomhphoist',
                password: 'Pasfhocal',
                login: 'Logáil isteach',
                forgotPassword: 'Pasfhocal dearmadta?',
                invalidDetails: 'Invalid email address or password.',
                errorLogin: 'Unable to initialise login.',
                passwordResetIntro: 'Cuir isteach do sheoladh ríomhphoist agus seolfaimid treoracha chugat chun do phasfhocal a athshocrú.',
                resetPassword: 'Athraigh do phasfhocal',
                sending: 'Ag seoladh...',
                passwordResetSent: 'Má tá cuntas ann leis an seoladh ríomhphoist seo, seolfar treoracha chun an pasfhocal a athshocrú.',
                passwordResetFailed: 'Níorbh fhéidir d\'iarratas a phróiseáil. Bain triail eile as.',
                passwordResetNetworkError: 'Earráid líonra. Bain triail eile as.'
            }
        }
    };

    const messages = $derived(resetMessages[page.params.lang === 'ga' ? 'ga' : 'en']);

    async function forgotPassword() {
        error = '';
        success = '';
        submitting = true;

        try {
            const response = await fetch(
                'https://sso.tg4.ie/api/v2/all/password/recover',
                {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email: email.trim() })
                }
            );

            if (response.status === 200) {
                success = messages.labels.passwordResetSent;
            } else {
                error = messages.labels.passwordResetFailed;
            }
        } catch (err) {
            console.error('Password recovery error:', err);
            error = messages.labels.passwordResetNetworkError;
        } finally {
            submitting = false;
        }
    }
</script>

<div class="account-page">
    <h1>{messages.labels.forgotPassword}</h1>

    <p>{messages.labels.passwordResetIntro}</p>

    <form onsubmit={(event) => {
        event.preventDefault();
        forgotPassword();
    }}>
        <div class="form-field">
            <label for="forgotEmail">
                {messages.labels.email}
            </label>

            <input id="forgotEmail" name="email" type="email" bind:value={email} autocomplete="email" required />
        </div>

        {#if error}
            <p class="error" role="alert">{error}</p>
        {/if}

        {#if success}
            <p class="success" role="status">{success}</p>
        {/if}

        <div class="form-field">
            <button type="submit" class="form-button" disabled={submitting}>
                {submitting ? messages.labels.sending : messages.labels.resetPassword}
            </button>
        </div>
    </form>

    <div class="account-links">
        <a href={withBase(`/${page.params.lang}/account/login`)}>{messages.labels.login}</a>
    </div>
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

.form-field label {
    display: block;
    margin-bottom: 6px;
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