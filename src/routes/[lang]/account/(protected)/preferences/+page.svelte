<script lang="ts">
    import { getContext, onMount } from 'svelte';
    import { page } from '$app/state';

    let loading = $state(true);
    let error = $state('');

    const account = getContext<{
        pu: any;
        profile: any;
    }>('tg4-account');

    let profile: any = null;

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
                genres: 'Genres',
                ads: 'Ads',
                subtitles: 'Subtitles',
                promos: 'Promos',
                credits: 'Credits',
                nextEpisode: 'Next Episode',
                accessibilityView: 'Accessibility View',
                updating: 'Updating...',
                loading: 'Loading...',
                savebutton: 'Save',
                preferenceSaved: 'Preferences Saved',
                toggleOptions: 'Yes/No'
            }
        },
        ga: {
            labels: {
                account: 'Cuntas',
                profile: 'Próifíl',
                preferences: 'Athraigh do sainrogha phearsanta',
                preferencesLink: 'Sainrogha phearsanta',
                genres: 'Séanraí',
                ads: 'Fógraí',
                subtitles: 'Fotheidil',
                promos: 'Promos',
                credits: 'Credits',
                nextEpisode: 'Next Episode',
                accessibilityView: 'Accessibility View',
                updating: 'Ag uasdhátú...',
                loading: 'Ag lódáil...',
                savebutton: 'Sabháil',
                preferenceSaved: 'Sainrogha Phearsanta Athruithe',
                toggleOptions: 'Tá/Níl'
            }
        }
    };

    const messages = $derived(prefMessages [page.params.lang === 'ga' ? 'ga' : 'en']);
    
    onMount(() => {
        profile = account.profile;

        if (!profile) {
            error = 'Unable to load your preferences.';
            loading = false;
            return;
        }

        const extraPref = profile.preferences?.extraPref ?? {};

        ads = extraPref.ads ?? false;
        subtitles = extraPref.subtitles ?? false;
        promos = extraPref.promos ?? false;
        credits = extraPref.credits ?? true;
        nextEpisode = extraPref.nextEpisode ?? true;
        accessibilityView = extraPref.accessibilityView ?? false;
        genres = [...(extraPref.genres ?? [])];

        loading = false;
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

            await account.pu.setCombinedSessionAndPreferenceProfile('profile_preference_key', updatedProfile);
            profile = updatedProfile;
            saved = true;

        } catch (err) {
            console.error('Preferences update error:', err);
        } finally {
            saving = false;
        }
    }
</script>

{#if loading}
    <p>{messages.labels.loading}</p>
{:else if error}
    <p>{error}</p>
{:else}
    <div class="account-page-content">
        <p class="frmTitle">{messages.labels.preferences}</p>
        <p>Allowing these options will give you have a personalised experience for all TG4 content. Giving you access to personalised newsletters and recommendations from us based on your interests.</p>

        <form onsubmit={(event) => {event.preventDefault(); handleSubmit();}}>
            <fieldset>
                <div class="form-field">
                    <label class="frmTitle">{messages.labels.ads}</label>
                    <div class="form-setting-row">
                        <p>Allow advertisements in-between watching content</p>
                        <label class="toggle">
                            <input
                                class="toggle-checkbox"
                                type="checkbox"
                                bind:checked={ads}
                            />
                            <span class="toggle-switch"></span>
                            <span class="toggle-label">{messages.labels.toggleOptions}</span>
                        </label>
                    </div>
                </div>
                <div class="form-field">
                    <label class="frmTitle">{messages.labels.subtitles}</label>
                    <div class="form-setting-row">
                        <p>Allow subtitles to be on automatically</p>
                        <label class="toggle">
                            <input
                                class="toggle-checkbox"
                                type="checkbox"
                                bind:checked={subtitles}
                            />
                            <span class="toggle-switch"></span>
                            <span class="toggle-label">{messages.labels.toggleOptions}</span>
                        </label>
                    </div>
                </div>
                <div class="form-field">
                    <label class="frmTitle">{messages.labels.promos}</label>
                    <div class="form-setting-row">
                        <p>Allow promos in-between watching content</p>
                        <label class="toggle">
                            <input
                                class="toggle-checkbox"
                                type="checkbox"
                                bind:checked={promos}
                            />
                            <span class="toggle-switch"></span>
                            <span class="toggle-label">{messages.labels.toggleOptions}</span>
                        </label>
                    </div>
                </div>
                <div class="form-field">
                    <label class="frmTitle">{messages.labels.genres}</label>
                    <p>Select your favourite genre(s)</p>
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
                    <label class="frmTitle">{messages.labels.credits}</label>

                    <div class="form-setting-row">
                        <p>Allow credits to be on automatically</p>
                        <label class="toggle">
                            <input
                                class="toggle-checkbox"
                                type="checkbox"
                                bind:checked={credits}
                            />
                            <span class="toggle-switch"></span>
                            <span class="toggle-label">{messages.labels.toggleOptions}</span>
                        </label>
                    </div>
                </div>
                <div class="form-field">
                    <label class="frmTitle">{messages.labels.nextEpisode}</label>

                    <div class="form-setting-row">
                        <p>Automatically plays the next episode</p>
                        <label class="toggle">
                            <input
                                class="toggle-checkbox"
                                type="checkbox"
                                bind:checked={nextEpisode}
                            />
                            <span class="toggle-switch"></span>
                            <span class="toggle-label">{messages.labels.toggleOptions}</span>
                        </label>
                    </div>
                </div>
                <div class="form-field">
                    <label class="frmTitle">{messages.labels.accessibilityView}</label>

                    <div class="form-setting-row">
                        <p>Switch to high accessibility view</p>
                        <label class="toggle">
                            <input
                                class="toggle-checkbox"
                                type="checkbox"
                                bind:checked={accessibilityView}
                            />
                            <span class="toggle-switch"></span>
                            <span class="toggle-label">{messages.labels.toggleOptions}</span>
                        </label>
                    </div>
                </div>

                <button type="submit" disabled={saving}>{saving ? messages.labels.updating : messages.labels.savebutton}</button>

                {#if saved}
                    <p class="notification">{messages.labels.preferenceSaved}</p>
                {/if}
            </fieldset>
        </form>
    </div>
{/if}

<style>
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

.form-setting-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
}

.form-setting-row p {
    margin: 0;
}

.form-setting-row .toggle {
    margin-top: 0;
    flex-shrink: 0;
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
    display: block;
    padding: 10px 16px;
    background: var(--tg4-grey-2);
    border-radius: 0;
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
    border-radius: 0;
    transition:
        background-color 0.2s ease,
        color 0.2s ease;
}
</style>