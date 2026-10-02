<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    import { goto } from '$app/navigation';
    import { requireAuthentication } from '$lib/sso/auth';

    let pu: any;
    let profile: any = null;
    let loading = $state(true);
    let error = $state('');
    let saving = $state(false);
    let saved = $state(false);

    let ads = $state(false);
    let subtitles = $state(false);
    let promos = $state(false);
    let credits = $state(true);
    let nextEpisode = $state(true);
    let accessibilityView = $state(false);
    let genres = $state<string[]>([]);

    const availableGenres = [
        { value: 'faisneis', label: page.params.lang === 'ga' ? 'Faisnéis' : 'News' },
        { value: 'ceol', label: page.params.lang === 'ga' ? 'Ceol' : 'Music' },
        { value: 'drama', label: page.params.lang === 'ga' ? 'Dráma' : 'Drama' },
        { value: 'cursai-reatha', label: page.params.lang === 'ga' ? 'Cúrsaí Reatha' : 'Current Affairs' },
        { value: 'siamsaiocht', label: page.params.lang === 'ga' ? 'Siamsaíocht' : 'Entertainment' },
        { value: 'sport', label: page.params.lang === 'ga' ? 'Spórt' : 'Sport' },
        { value: 'saolchlar', label: page.params.lang === 'ga' ? 'Saolchlár' : 'Lifestyle' },
        { value: 'cula4', label: 'Cúla4' }
    ];

    const prefMessages = {
        en: {
            labels: {
                account: 'Account',
                profile: 'Profile',
                preferences: 'Edit your preferences',
                preferencesLink: 'Preferences',
                ads: 'Ads',
                subtitles: 'Subtitles',
                promos: 'Promos',
                credits: 'Credits',
                nextEpisode: 'Next Episode',
                accessibilityView: 'Accessibility View',
                updating: 'Updating...',
                loading: 'Loading...',
                savebutton: 'Save',
                preferenceSaved: 'Preferences Saved'
            }
        },
        ga: {
            labels: {
                account: 'Cuntas',
                profile: 'Próifíl',
                preferences: 'Athraigh do sainrogha phearsanta',
                preferencesLink: 'Sainrogha phearsanta',
                ads: 'Fógraí',
                subtitles: 'Fotheidil',
                promos: 'Promos',
                credits: 'Credits',
                nextEpisode: 'Next Episode',
                accessibilityView: 'Accessibility View',
                updating: 'Ag uasdhátú...',
                loading: 'Ag lódáil...',
                savebutton: 'Sabháil',
                preferenceSaved: 'Sainrogha Phearsanta Athruithe'
            }
        }
    };

    const messages = $derived(prefMessages [page.params.lang === 'ga' ? 'ga' : 'en']);

    onMount(async () => {
        try {
            pu = await requireAuthentication(page.params.lang);
            if (!pu) return;

            // User is authenticated, so load their profile
            profile = await pu.getCombinedSessionAndPreferenceProfile();

            console.log('PROFILE:', profile);

            const unauthorized = profile?.profile?.error === 'Unauthorized' || profile?.preferences?.error === 'Unauthorized';

            if (unauthorized) {
                console.warn('Session is stale - logging out');

                try {
                    await pu.logout();
                } catch (err) {
                    console.error('Logout error:', err);
                }

                await goto(`/${page.params.lang}/account/login`);
                return;
            }

            ads = profile.preferences.extraPref?.ads ?? false;
            subtitles = profile.preferences.extraPref?.subtitles ?? false;
            promos = profile.preferences.extraPref?.promos ?? false;
            credits = profile.preferences.extraPref?.credits ?? false;
            nextEpisode = profile.preferences.extraPref?.nextEpisode ?? false;
            accessibilityView = profile.preferences.extraPref?.accessibilityView ?? false;
            genres = [...(profile.preferences.extraPref?.genres ?? [])];

            loading = false;

        } catch (err) {
            console.error('Profile error:', err);
            error = err instanceof Error ? err.message : String(err);
            loading = false;
        }
    });

    async function handleSubmit() {
        saved = false;
        saving = true;

        try {
            const updatedProfile = {
                ...profile,

                preferences: {
                    ...profile.preferences,

                    extraPref: {
                        ...profile.preferences.extraPref,
                        ads,
                        subtitles,
                        promos,
                        credits,
                        nextEpisode,
                        accessibilityView,
                        genres
                    }
                }
            };

            console.log('Saving preferences:', updatedProfile);

            await pu.setCombinedSessionAndPreferenceProfile('profile_preference_key', updatedProfile);
            profile = updatedProfile;
            saved = true;

        } catch (err) {
            console.error('Preferences update error:', err);
        } finally {
            saving = false;
        }
    }
</script>

<section class="preference-page">
    <section class="episodes">
        {#if loading}
            <p>Loading...</p>
        {:else if error}
            <p>{error}</p>
        {:else}
            <section class="account">
                <div class="account-layout">
                    <!-- LEFT COLUMN -->
                    <nav class="account-tabs">
                        <a href={`/${page.params.lang}/account/account`}>{messages.labels.account}</a>
                        <a href={`/${page.params.lang}/account/profile`}>{messages.labels.profile}</a>
                        <a href={`/${page.params.lang}/account/preferences`} class="active">{messages.labels.preferencesLink}</a>
                    </nav>

                    <!-- MIDDLE COLUMN -->
                    <div class="account-content">
                        <h1>{messages.labels.preferences}</h1>
                            <form onsubmit={(event) => {event.preventDefault(); handleSubmit();}}>
                                <fieldset>
                                    <div class="form-field">
                                        <label class="toggle">
                                            <input
                                                class="toggle-checkbox"
                                                type="checkbox"
                                                bind:checked={ads}
                                            />
                                            <span class="toggle-switch"></span>
                                            <span class="toggle-label">{messages.labels.ads}</span>
                                        </label>
                                    </div>
                                    <div class="form-field">
                                        <label class="toggle">
                                            <input
                                                class="toggle-checkbox"
                                                type="checkbox"
                                                bind:checked={subtitles}
                                            />
                                            <span class="toggle-switch"></span>
                                            <span class="toggle-label">{messages.labels.subtitles}</span>
                                        </label>
                                    </div>
                                    <div class="form-field">
                                        <label class="toggle">
                                            <input
                                                class="toggle-checkbox"
                                                type="checkbox"
                                                bind:checked={promos}
                                            />
                                            <span class="toggle-switch"></span>
                                            <span class="toggle-label">{messages.labels.promos}</span>
                                        </label>
                                    </div>
                                    <div class="form-field">
                                        <h3>{messages.labels.genres}</h3>

                                        <div class="genre-options">
                                            {#each availableGenres as genre}
                                                <label class:selected={genres.includes(genre.value)}>
                                                    <input
                                                        type="checkbox"
                                                        value={genre.value}
                                                        checked={genres.includes(genre.value)}
                                                        onchange={(event) => {
                                                            if (event.currentTarget.checked) {
                                                                genres = [...genres, genre.value];
                                                            } else {
                                                                genres = genres.filter(value => value !== genre.value);
                                                            }
                                                        }}
                                                    />
                                                    <span>{genre.label}</span>
                                                </label>
                                            {/each}
                                        </div>
                                    </div>
                                    <div class="form-field">
                                        <label class="toggle">
                                            <input
                                                class="toggle-checkbox"
                                                type="checkbox"
                                                bind:checked={credits}
                                            />
                                            <span class="toggle-switch"></span>
                                            <span class="toggle-label">{messages.labels.credits}</span>
                                        </label>
                                    </div>
                                    <div class="form-field">
                                        <label class="toggle">
                                            <input
                                                class="toggle-checkbox"
                                                type="checkbox"
                                                bind:checked={nextEpisode}
                                            />
                                            <span class="toggle-switch"></span>
                                            <span class="toggle-label">{messages.labels.nextEpisode}</span>
                                        </label>
                                    </div>
                                    <div class="form-field">
                                        <label class="toggle">
                                            <input
                                                class="toggle-checkbox"
                                                type="checkbox"
                                                bind:checked={accessibilityView}
                                            />
                                            <span class="toggle-switch"></span>
                                            <span class="toggle-label">{messages.labels.accessibilityView}</span>
                                        </label>
                                    </div>

                                    <button type="submit" class="form-button" disabled={saving}>{saving ? messages.labels.updating : messages.labels.savebutton}</button>

                                    {#if saved}
                                        <p class="notification">{messages.labels.preferenceSaved}</p>
                                    {/if}
                                </fieldset>
                            </form>
                        </div>
                    </div>

                    <!-- RIGHT COLUMN -->
                    <div class="account-sidebar"></div>
            </section>
        {/if}
    </section>
</section>

<style>
.preference-page {
    max-width: var(--page-width);
    margin: 0 auto;
    padding: 20px;
    background-color: var(--genre-background);
}

.account-layout {
    display: grid;
    grid-template-columns: 250px minmax(0, 600px) 180px;
    gap: 40px;
    align-items: start;
}

.account-tabs {
    display: flex;
    flex-direction: column;
    gap: 5px;
    padding-top: 32px;
}

.account-tabs a {
    position: relative;
    width: fit-content;
    padding: 10px 0;
    text-decoration: none;
    color: inherit;
}

.account-tabs a.active {
    font-weight: bold;
}

.account-tabs a::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 3px;
    background-color: var(--link-colour);
    opacity: 0;
    transition: opacity 0.2s ease;
}

.account-tabs a:hover::after,
.account-tabs a.active::after {
    opacity: 1;
}

.account-content {
    min-width: 0;
}

.account-section {
    margin-bottom: 40px;
}

.account-section form {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

fieldset {
    border: 0;
    padding: 0;
    margin: 0;
}

.form-field {
    margin-bottom: 20px;
}

.form-row {
    display: flex;
    gap: 15px;
}

.form-row .form-field {
    flex: 1;
}

.genre-options {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 20px;
}

.genre-options label {
    cursor: pointer;
}

.genre-options input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
}

.genre-options span {
    background: var(--tg4-grey-2);
    display: block;
    padding: 10px 16px;
    border-radius: 0px;
    cursor: pointer;
}

.genre-options label.selected span {
    background-color: var(--link-colour);
    color: white;
}

.toggle {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    margin-top: 8px;
    cursor: pointer;
    font-weight: normal;
}

.toggle-checkbox {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
}

.toggle-switch {
    position: relative;
    width: 44px;
    height: 24px;
    flex-shrink: 0;
    background: var(--tg4-grey-2);
    border-radius: 24px;
    transition: background-color 0.2s ease;
}

.toggle-switch::after {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 18px;
    height: 18px;
    background: white;
    border-radius: 50%;
    transition: transform 0.2s ease;
}

.toggle-checkbox:checked + .toggle-switch {
    background-color: var(--link-colour);
}

.toggle-checkbox:checked + .toggle-switch::after {
    transform: translateX(20px);
}

.toggle-checkbox:focus-visible + .toggle-switch {
    outline: 2px solid var(--link-colour);
    outline-offset: 2px;
}

.toggle-label {
    font-weight: normal;
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
</style>