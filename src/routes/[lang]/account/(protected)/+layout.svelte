<script lang="ts">
    import { onMount, setContext } from 'svelte';
    import { page } from '$app/state';
    import { goto } from '$app/navigation';
    import { requireAuthentication } from '$lib/sso/auth';
    import { withBase } from '$lib/utils/paths';
    import { isProfileComplete } from '$lib/sso/profile-complete';

    let { children } = $props();
    let loading = $state(true);
    let error = $state('');

    let pu = $state<any>(null);
    let profile = $state<any>(null);
    let profileComplete = $state(false);

    setContext('tg4-account', {
        get pu() {
            return pu;
        },
        get profile() {
            return profile;
        }
    });

    let isVerified = $derived(profile?.profile?.verified === true);

    let sendingVerification = $state(false);
    let verificationMessage = $state('');
    let verificationError = $state('');

    const accountMessages = {
        en: {
            labels: {
                account: 'Account',
                profile: 'Profile',
                preferences: 'Preferences',
                bookmarks: 'Bookmarks',
                history: 'History',
                logout: 'Logout',
                loading: 'Loading...',
                completeProfileFirst: 'Please complete your profile first.',
                deleteAccount: 'Delete account',
                verifyEmail: 'Account is not verified. You need to be verified to view Bookmarks and History.',
                sendingVerification: 'Sending...',
                sendVerification: 'Send verification email'
            }
        },
        ga: {
            labels: {
                account: 'Cuntas',
                profile: 'Próifíl',
                preferences: 'Sainrogha phearsanta',
                bookmarks: 'Leabharmharcanna',
                history: 'Stair',
                logout: 'Logáil Amach',
                loading: 'Ag lódáil...',
                completeProfileFirst: 'Comhlánaigh do phróifíl ar dtús, le do thoil.',
                deleteAccount: 'Scrios cuntas',
                verifyEmail: 'Níl an cuntas deimhnithe. Ní mhór a bheith deimhnithe chun go mbeadh fáil ar Leabharmharcanna agus Stair.',
                sendingVerification: 'Á sheoladh...',
                sendVerification: 'Seol ríomhphost fíoraithe'
            }
        }
    };

    const messages = $derived(
        accountMessages[page.params.lang === 'ga' ? 'ga' : 'en']
    );

    onMount(async () => {
        try {
            pu = await requireAuthentication(page.params.lang);
            if (!pu) return;

            profile = await pu.getCombinedSessionAndPreferenceProfile();

            const unauthorized =
                profile?.profile?.error === 'Unauthorized' ||
                profile?.preferences?.error === 'Unauthorized';

            if (unauthorized) {
                try {
                    await pu.logout();
                } catch (err) {
                    console.error('Logout error:', err);
                }

                await goto(`/${page.params.lang}/account/login`);
                return;
            }

            profileComplete = isProfileComplete(profile);
        } catch (err) {
            console.error('Profile error:', err);
            error = err instanceof Error ? err.message : String(err);
        } finally {
            loading = false;
        }
    });

    async function sendVerificationEmail() {
        verificationMessage = '';
        verificationError = '';
        sendingVerification = true;

        try {
            const response = await fetch(
                'https://api.tg4.ie/sso-verify-dev',
                {
                    method: 'POST',
                    credentials: 'include'
                }
            );

            if (response.status === 200 || response.status === 204) {
                verificationMessage =
                    page.params.lang === 'ga'
                        ? 'Seoladh an nasc fíoraithe chuig do sheoladh ríomhphoist.'
                        : 'Verification link sent to your email address.';
            } else {
                const responseText = await response.text();
                console.error(
                    'Verification error:',
                    response.status,
                    responseText
                );

                verificationError =
                    page.params.lang === 'ga'
                        ? 'Níorbh fhéidir an ríomhphost fíoraithe a sheoladh. Bain triail eile as.'
                        : 'Could not send the verification email. Please try again.';
            }
        } catch (err) {
            console.error('Verification request failed:', err);

            verificationError =
                page.params.lang === 'ga'
                    ? 'Tharla earráid líonra. Bain triail eile as.'
                    : 'A network error occurred. Please try again.';
        } finally {
            sendingVerification = false;
        }
    }

    async function logout() {
        try {
            await pu?.logout();
        } finally {
            window.location.href = withBase(
                `/${page.params.lang}/account/login`
            );
        }
    }
</script>

{#if loading}
    <section class="account-page">
        <section class="episodes">
            <p>{messages.labels.loading}</p>
        </section>
    </section>
{:else if error}
    <section class="account-page">
        <section class="episodes">
            <p>{error}</p>
        </section>
    </section>
{:else}
    <section class="account-page">
        <section class="episodes">
            <section class="account">
                <div class="account-layout">
                    <nav
                        class="account-main-nav"
                        aria-label="Account navigation"
                    >
                        <a
                            href={withBase(`/${page.params.lang}/account/account`)}
                            class:active={page.url.pathname.endsWith('/account/account')}
                        >
                            {messages.labels.account}
                        </a>

                        {#if isVerified}
                            <a
                                href={withBase(`/${page.params.lang}/account/profile`)}
                                class:active={page.url.pathname.endsWith('/account/profile')}
                            >
                                {messages.labels.profile}
                            </a>
                        {:else}
                            <span class="disabled">{messages.labels.profile}</span>
                        {/if}

                        {#if profileComplete}
                            <a
                                href={withBase(`/${page.params.lang}/account/preferences`)}
                                class:active={page.url.pathname.endsWith('/account/preferences')}
                            >
                                {messages.labels.preferences}
                            </a>
                        {:else}
                            <span
                                class="disabled"
                                title={messages.labels.completeProfileFirst}
                            >
                                {messages.labels.preferences}
                            </span>
                        {/if}

                        <span class="disabled">{messages.labels.bookmarks}</span>
                        <span class="disabled">{messages.labels.history}</span>
                    </nav>

                    <div class="account-content">
                        {@render children()}
                    </div>

                    <nav
                        class="account-secondary-nav"
                        aria-label="Account actions"
                    >
                        {#if profile?.profile?.verified === false}
                            <div class="verification-section">
                                <p>{messages.labels.verifyEmail}</p>

                                <button
                                    type="button"
                                    class="sidebar-link"
                                    disabled={sendingVerification}
                                    onclick={sendVerificationEmail}
                                >
                                    {sendingVerification
                                        ? messages.labels.sendingVerification
                                        : messages.labels.sendVerification}
                                </button>

                                {#if verificationMessage}
                                    <p class="notification">{verificationMessage}</p>
                                {/if}

                                {#if verificationError}
                                    <p class="notification">{verificationError}</p>
                                {/if}
                            </div>
                        {/if}

                        <a
                            href={withBase(`/${page.params.lang}/account/delete-account`)}
                            class:active={page.url.pathname.endsWith('/account/delete-account')}
                            class="delete-account-link"
                        >
                            {messages.labels.deleteAccount}
                        </a>

                        
                        <button type="button" class="logout-link" onclick={logout}>
                            {messages.labels.logout}
                        </button>
                    </nav>

                    <div class="account-sidebar"></div>
                </div>
            </section>
        </section>
    </section>
{/if}

<style>
.account-page {
    max-width: var(--page-width);
    margin: 0 auto;
    padding: 20px;
    background-color: var(--genre-background);
}

.account-layout {
    display: grid;
    grid-template-columns: 220px minmax(0, 1fr) 180px;
    grid-template-rows: auto 1fr;
    grid-template-areas:
        "main content sidebar"
        "secondary content sidebar";
    column-gap: 2rem;
    row-gap: 1.5rem;
    align-items: start;
}

.account-main-nav {
    grid-area: main;
}

.account-content {
    grid-area: content;
    min-width: 0;
}

.account-secondary-nav {
    grid-area: secondary;
    align-self: end;
}

.account-sidebar {
    grid-area: sidebar;
}

.account-main-nav,
.account-secondary-nav {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding-top: 42px;
}

.account-main-nav a,
.account-secondary-nav a,
.account-secondary-nav button {
    display: inline-block;
    width: fit-content;
    padding-bottom: 5px;
    border: 0;
    border-bottom: 2px solid transparent;
    background: none;
    color: inherit;
    font: inherit;
    text-align: left;
    text-decoration: none;
    cursor: pointer;
    transition: border-color 0.2s ease;
}

.account-main-nav a.active {
    font-weight: 700;
}

.account-main-nav a:hover,
.account-main-nav a.active,
.account-secondary-nav a:hover,
.account-secondary-nav a.active,
.account-secondary-nav button:hover {
    border-bottom-color: #FF126C;
}

.account-main-nav .disabled {
    color: inherit;
    opacity: 0.45;
    cursor: not-allowed;
    pointer-events: none;
}

.sidebar-link,
.logout-link {
    padding: 0;
    border: 0;
    background: none;
    color: inherit;
    font: inherit;
    line-height: inherit;
    text-align: left;
    cursor: pointer;
}

.delete-account-link {
    color: #c62828 !important;
}

.delete-account-link:hover {
    color: #8e0000;
}

@media (max-width: 1160px) {
    .account-layout {
        grid-template-columns: 200px minmax(0, 700px);
        gap: 20px;
    }

    .account-sidebar {
        display: none;
    }
}

@media (max-width: 800px) {
    .account-layout {
        grid-template-columns: minmax(0, 1fr);
        grid-template-rows: auto auto auto;
        grid-template-areas:
            "main"
            "content"
            "secondary";
        row-gap: 0rem;
    }

    .account-main-nav {
        flex-direction: row;
        flex-wrap: wrap;
        gap: 0.75rem 1.25rem;
    }

    .account-secondary-nav {
        padding-top: 0;
    }

    .account-sidebar {
        display: none;
    }
}
</style>