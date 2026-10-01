<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    import { goto } from '$app/navigation';
    import { loadPeachUser } from '$lib/sso/peach';
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
        { value: 'faisneis', label: 'Faisnéis' },
        { value: 'ceol', label: 'Ceol' },
        { value: 'drama', label: 'Dráma' },
        { value: 'cursai-reatha', label: 'Cúrsaí reatha' },
        { value: 'siamsaiocht', label: 'Siamsaíocht' },
        { value: 'sport', label: 'Spórt' },
        { value: 'saolchlar', label: 'Saolchlár' },
        { value: 'cula4', label: 'Cúla4' }
    ];

    const prefMessages = {
        en: {
            labels: {
                account: 'Account',
                profile: 'Profile',
                preferences: 'Preferences',
                ads: 'Ads',
                subtitles: 'Subtitles',
                promos: 'Promos',
                credits: 'Credits',
                nextEpisode: 'Next Episode',
                accessibilityView: 'Accessibility View',
                updating: 'Updating...',
                loading: 'Loading...'
            }
        },
        ga: {
            labels: {
                account: 'Cuntas',
                profile: 'Próifíl',
                preferences: 'Preferences',
                ads: 'Fógraí',
                subtitles: 'Fotheidil',
                promos: 'Promos',
                credits: 'Credits',
                nextEpisode: 'Next Episode',
                accessibilityView: 'Accessibility View',
                updating: 'Á nuashonrú...',
                loading: 'Á luchtú...'
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
</script>

<section class="profile-page">
    <h2>Preferences</h2>

    <nav class="account-tabs">
        <a href={`/${page.params.lang}/account/account`}>Account</a>
        <a href={`/${page.params.lang}/account/profile`}>Profile</a>
        <a href={`/${page.params.lang}/account/preferences`} class="active">Preferences</a>
    </nav>

    {#if loading}
        <p>Loading...</p>
    {:else if error}
        <p>{error}</p>
    {:else}
        <form onsubmit={(event) => {event.preventDefault(); handleSubmit();}}>
            <fieldset>
                <legend>Edit Preferences</legend>
                <div class="preference-options">
                    <label class:selected={ads}>
                        <input type="checkbox" bind:checked={ads} />
                        <span>{messages.labels.ads}</span>
                    </label>

                    <label class:selected={subtitles}>
                        <input type="checkbox" bind:checked={subtitles} />
                        <span>{messages.labels.subtitles}</span>
                    </label>

                    <label class:selected={promos}>
                        <input type="checkbox" bind:checked={promos} />
                        <span>{messages.labels.promos}</span>
                    </label>

                    <label class:selected={credits}>
                        <input type="checkbox" bind:checked={credits} />
                        <span>{messages.labels.credits}</span>
                    </label>

                    <label class:selected={nextEpisode}>
                        <input type="checkbox" bind:checked={nextEpisode} />
                        <span>{messages.labels.nextEpisode}</span>
                    </label>

                    <label class:selected={accessibilityView}>
                        <input type="checkbox" bind:checked={accessibilityView} />
                        <span>{messages.labels.accessibilityView}</span>
                    </label>
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
                </div>

                <button type="submit" class="language-switch" disabled={saving}> {saving ? 'Saving...' : 'Save'}</button>

                {#if saved}
                    <p>Profile saved.</p>
                {/if}
            </fieldset>
        </form>
    {/if}
</section>

<style>
.profile-page {
    max-width: 700px;
    margin: 0 auto;
    padding: 20px;
    background-color: var(--genre-background);
}

.account-tabs {
    display: flex;
    gap: 5px;
    margin-bottom: 30px;
    border-bottom: 1px solid #ccc;
}

.account-tabs a {
    padding: 10px 15px;
    text-decoration: none;
    color: inherit;
}

.account-tabs a.active {
    font-weight: bold;
    border-bottom: 3px solid currentColor;
}

.genre-options {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
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
    border: 1px solid currentColor;
    border-radius: 4px;
    cursor: pointer;
}

.genre-options label.selected span {
    background: currentColor;
    color: var(--genre-background);
}
.preference-options,
.genre-options {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.preference-options label,
.genre-options label {
    cursor: pointer;
}

.preference-options input,
.genre-options input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
}

.preference-options span,
.genre-options span {
    display: block;
    padding: 10px 16px;
    border: 1px solid currentColor;
    border-radius: 4px;
    cursor: pointer;
}

.preference-options label.selected span,
.genre-options label.selected span {
    background: currentColor;
    color: var(--genre-background);
}
</style>