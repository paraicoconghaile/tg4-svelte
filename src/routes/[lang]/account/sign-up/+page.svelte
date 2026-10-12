<script lang="ts">
    import { page } from '$app/state';
    import Eye from '$lib/components/icons/Eye.svelte';
    import EyeOff from '$lib/components/icons/EyeOff.svelte';
    import { withBase } from '$lib/utils/paths';

    let email = $state('');
    let password = $state('');
    let confirmPassword = $state('');

    let showPassword = $state(false);
    let showConfirmPassword = $state(false);

    let registering = $state(false);
    let error = $state('');
    let success = $state('');

    const regMessages = {
        en: {
            labels: {
                email: 'Email address',
                password: 'Password',
                confirmPassword: 'Confirm Password',
                alreadyHaveAccount: 'Already have an account?',
                login: 'Login',
                register: 'Signup',
                registering: 'Signing up...',
                passwordMismatch: 'Sorry, your passwords don\'t match. Please try again.',
                registrationSuccess: 'Registration successful.',
                registrationFailed: 'An error occurred during registration.',
                registrationNetworkError: 'Network error. Please try again.',
                registrationIntro: 'Signing in unlocks access to an extensive range of TG4 archive programmes. Knowing more about you helps us give you more of what you want.',
                registrationBenefit1: 'Access more TG4 Content',
                registrationBenefit2: 'Location information ensures you can access programming in your location',
                registrationBenefit3: 'Get personalized home page recommendations',
                registrationBenefit4: 'Continue watching from where you left off',
                registrationBenefit5: 'Opt in to hear about shows you are interested in',
                registrationBenefit6: 'Reduction in Pre-Roll Adverts'
            }
        },
        ga: {
            labels: {
                email: 'Seoladh ríomhphoist',
                password: 'Pasfhocal',
                confirmPassword: 'Pasfhocal Arís',
                alreadyHaveAccount: 'Cuntas agat cheana féin?',
                login: 'Logáil Isteach',
                register: 'Cláraigh',
                registering: 'Ag Clárú...',
                passwordMismatch: 'Dhá pasfhocal difriúil curtha isteach. Bain triail eile as.',
                registrationSuccess: 'Cláraithe!',
                registrationFailed: 'Tharla earráid le linn an chlárúcháin.',
                registrationNetworkError: 'Earráid líonra. Bain triail eile as.',
                registrationIntro: 'Trí shíniú isteach, is féidir rochtain a fháil ar réimse leathan de chláracha i gcartlann TG4. Trí níos mó a fháil amach fút, beimid in ann níos mó de na cláracha is maith leat a chur ar fáil.',
                registrationBenefit1: 'Rochtain a fháil ar níos mó d’Ábhair TG4',
                registrationBenefit2: 'Cinntíonn faisnéis suímh gur féidir leat rochtain a fháil ar chláracha i do shuíomh féin',
                registrationBenefit3: 'Faigh moltaí pearsantaithe ar an leathanach baile',
                registrationBenefit4: 'Lean ort ag faire ón áit ar stop tú',
                registrationBenefit5: 'Glac leis an rogha cloisteáil faoi chláracha a bhfuil suim agat iontu',
                registrationBenefit6: 'Laghdú ar Fhógraí Réamhchasaidh'
            }
        }
    };

    const messages = $derived(regMessages[page.params.lang === 'ga' ? 'ga' : 'en']);

    async function register() {
        error = '';
        success = '';

        if (password !== confirmPassword) {
            error = messages.labels.passwordMismatch;
            return;
        }

        registering = true;

        try {
            const formData = new URLSearchParams({
                regEmail: email,
                regPassword: password,
                regConfirmPassword: confirmPassword
            });

            const response = await fetch(
                'https://api.tg4.ie/sso-register-dev',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: formData.toString()
                }
            );

            const data = await response.json().catch(() => null);

            if (response.ok) {
                success = messages.labels.registrationSuccess;
            } else {
                error = data?.message || messages.labels.registrationFailed;
            }
        } catch (err) {
            console.error('Registration error:', err);
            error = messages.labels.registrationNetworkError;
        } finally {
            registering = false;
        }
    }
</script>

<div class="account-page">
    <h1>{messages.labels.register}</h1>

    <form onsubmit={(event) => {
        event.preventDefault();
        register();
    }}>
        <div class="form-field">
            <label for="regEmail">{messages.labels.email}</label>
            <input id="regEmail" type="email" bind:value={email} autocomplete="email" required />
        </div>
        <div class="form-field">
            <label for="regPassword">{messages.labels.password}</label>
            <div class="password-input">
                <input id="regPassword" type={showPassword ? 'text' : 'password'} bind:value={password} autocomplete="new-password" required />

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
            <label for="regConfirmPassword">{messages.labels.confirmPassword}</label>
            <div class="password-input">
                <input id="regConfirmPassword" type={showConfirmPassword ? 'text' : 'password'} bind:value={confirmPassword} autocomplete="new-password" required />

                <button type="button" class="password-toggle" onclick={() => showConfirmPassword = !showConfirmPassword} aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
                    {#if showConfirmPassword}
                        <EyeOff />
                    {:else}
                        <Eye />
                    {/if}
                </button>
            </div>
        </div>

        {#if error}
            <p class="error" role="alert">{error}</p>
        {/if}

        {#if success}
            <p class="success" role="status">
                {success}
                <a href={`/${page.params.lang}/account/login`}>
                    {messages.labels.login}
                </a>
            </p>
        {/if}

        <div class="form-field">
            <button type="submit" class="form-button" disabled={registering}>
                {registering ? messages.labels.registering : messages.labels.register}
            </button>
        </div>
    </form>

    <div class="account-links">
        <p>
            {messages.labels.alreadyHaveAccount}
            <a href={`/${page.params.lang}/account/login`}>
                {messages.labels.login}
            </a>
        </p>
    </div>
    <div class="registration-info">
        <div class="registration-qr">
            <img src="https://d1og0s8nlbd0hm.cloudfront.net/wp-content/uploads/2026/05/18112230/Seinnteoir-TG4-Claraigh-QR.png" alt="TG4 QR Code"/>
        </div>

        <p>{messages.labels.registrationIntro}</p>
        <ul>
            <li>{messages.labels.registrationBenefit1}</li>
            <li>{messages.labels.registrationBenefit2}</li>
            <li>{messages.labels.registrationBenefit3}</li>
            <li>{messages.labels.registrationBenefit4}</li>
            <li>{messages.labels.registrationBenefit5}</li>
            <li>{messages.labels.registrationBenefit6}</li>
        </ul>
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

.registration-qr img {
    max-width: 60%;
    margin: 20px auto;
}
</style>