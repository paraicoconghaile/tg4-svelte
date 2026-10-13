<script lang="ts">
    import { page } from '$app/state';
    import { withBase } from '$lib/utils/paths';

    let password = $state('');
    let showPassword = $state(false);
    let modalOpen = $state(false);
    let deleting = $state(false);
    let errorMessage = $state('');
    let successMessage = $state('');

    const isIrish = $derived(page.params.lang === 'ga');

    const text = $derived(
        isIrish
            ? {
                  title: 'Scrios cuntas',
                  warning: 'Rabhadh! Bainfear do shonraí bailithe uile dár seirbhísí.',
                  explanation:
                      'Chun do chuntas a scriosadh, cuir isteach do phasfhocal agus deimhnigh an scriosadh.',
                  password: 'Cuir isteach do phasfhocal',
                  showPassword: 'Taispeáin an pasfhocal',
                  open: 'Scrios cuntas',
                  close: 'Dún',
                  confirm: 'SCRIOS CUNTAS',
                  deleting: 'Á scriosadh…',
                  required: 'Cuir isteach do phasfhocal le leanúint ar aghaidh.',
                  failed: 'Níorbh fhéidir do chuntas a scriosadh. Seiceáil do phasfhocal agus bain triail eile as.',
                  networkError: 'Tharla earráid líonra. Bain triail eile as.',
                  success: 'Scriosadh do chuntas go rathúil.',
                  login: 'Téigh chuig an leathanach logála isteach'
              }
            : {
                  title: 'Delete account',
                  warning:
                      'Warning! All collected data will be removed from our services.',
                  explanation:
                      'To delete your account, enter your password and confirm the deletion.',
                  password: 'Enter your password',
                  showPassword: 'Show password',
                  open: 'Delete account',
                  close: 'Close',
                  confirm: 'DELETE ACCOUNT',
                  deleting: 'Deleting…',
                  required: 'Enter your password to continue.',
                  failed:
                      'Your account could not be deleted. Check your password and try again.',
                  networkError: 'A network error occurred. Please try again.',
                  success: 'Your account has been successfully deleted.',
                  login: 'Go to login'
              }
    );

    function openModal() {
        password = '';
        errorMessage = '';
        modalOpen = true;
    }

    function closeModal() {
        if (deleting) return;

        modalOpen = false;
        password = '';
        errorMessage = '';
    }

    async function deleteAccount() {
        errorMessage = '';

        if (!password.trim()) {
            errorMessage = text.required;
            return;
        }

        deleting = true;

        try {
            const response = await fetch(
                'https://sso.tg4.ie/api/v3/auth/delete',
                {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        password: password.trim()
                    })
                }
            );

            const data = await response
                .json()
                .catch(() => null);

            if (response.ok && data?.success !== false) {
                successMessage = text.success;
                modalOpen = false;
                password = '';
            } else {
                console.error(
                    'Delete account failed:',
                    response.status,
                    data
                );

                errorMessage = text.failed;
            }
        } catch (error) {
            console.error('Delete account request failed:', error);
            errorMessage = text.networkError;
        } finally {
            deleting = false;
        }
    }
</script>

<svelte:head>
    <title>{text.title} | TG4</title>
</svelte:head>

<section class="delete-account">
    <h1>{text.title}</h1>

    {#if successMessage}
        <div class="success-message" role="status">
            <p>{successMessage}</p>
            <p><a href={withBase(`/${page.params.lang}/account/login`)}>{text.login}</a></p>
        </div>
    {:else}
        <div class="warning-message">
            <p>{text.warning}</p>
        </div>

        <button type="button" class="delete-button" onclick={openModal}>
            {text.open}
        </button>
    {/if}

    {#if errorMessage && !modalOpen}
        <p class="error-message" role="alert">{errorMessage}</p>
    {/if}
</section>

{#if modalOpen}
    <div class="modal-backdrop">
        <section
            class="delete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
        >
            <h2 id="delete-modal-title">{text.title}</h2>

            <p class="warning-message">{text.warning}</p>
            <p>{text.explanation}</p>

            <form onsubmit={(event) => {
                event.preventDefault();
                deleteAccount();
            }}>
                <label for="delete-password">{text.password}</label>

                <input
                    id="delete-password"
                    type={showPassword ? 'text' : 'password'}
                    bind:value={password}
                    autocomplete="current-password"
                    required
                    disabled={deleting}
                />

                <label class="show-password">
                    <input
                        type="checkbox"
                        bind:checked={showPassword}
                        disabled={deleting}
                    />
                    {text.showPassword}
                </label>

                {#if errorMessage}
                    <p class="error-message" role="alert">
                        {errorMessage}
                    </p>
                {/if}

                <div class="modal-actions">
                    <button
                        type="button"
                        class="secondary-button"
                        onclick={closeModal}
                        disabled={deleting}
                    >
                        {text.close}
                    </button>

                    <button
                        type="submit"
                        class="delete-button"
                        disabled={!password.trim() || deleting}
                    >
                        {deleting ? text.deleting : text.confirm}
                    </button>
                </div>
            </form>
        </section>
    </div>
{/if}

<style>
    .delete-account {
        max-width: 640px;
    }

    .warning-message {
        padding: 1rem;
        color: #8a1c2d;
        background: #fff0f2;
        border: 1px solid #f2b8c1;
        border-radius: 4px;
    }

    .delete-button {
        padding: 0.75rem 1rem;
        color: white;
        background: #d7193f;
        border: 1px solid #d7193f;
        border-radius: 4px;
        cursor: pointer;
    }

    .delete-button:hover:not(:disabled) {
        background: #b51233;
    }

    button:disabled {
        cursor: not-allowed;
        opacity: 0.55;
    }

    .modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 1000;
        display: grid;
        place-items: center;
        overflow-y: auto;
        padding: 1rem;
        background: rgb(0 0 0 / 65%);
    }

    .delete-modal {
        width: 100%;
        max-width: 480px;
        padding: 1.5rem;
        background: white;
        color: #222;
        border-radius: 6px;
    }

    .delete-modal h2 {
        margin-top: 0;
    }

    .delete-modal form > input {
        display: block;
        box-sizing: border-box;
        width: 100%;
        margin-top: 0.5rem;
        padding: 0.75rem;
        border: 1px solid #aaa;
        border-radius: 4px;
    }

    .show-password {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-top: 0.75rem;
    }

    .modal-actions {
        display: flex;
        justify-content: flex-end;
        flex-wrap: wrap;
        gap: 0.75rem;
        margin-top: 1.5rem;
    }

    .secondary-button {
        padding: 0.75rem 1rem;
        background: white;
        border: 1px solid #aaa;
        border-radius: 4px;
        cursor: pointer;
    }

    .error-message {
        color: #b51233;
    }

    .success-message {
        padding: 1rem;
        background: #eef8ef;
        border-radius: 4px;
    }

    .success-message a {
        color: #b51270;
    }

    @media (max-width: 480px) {
        .modal-actions > button {
            flex: 1;
        }
    }
</style>