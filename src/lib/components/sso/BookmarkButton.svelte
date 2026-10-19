<script lang="ts">
    import { loadPeachUser } from '$lib/sso/peach';
    import { withBase } from '$lib/utils/paths';

    let {
        bookmark,
        lang,
        onReady
    }: {
        bookmark: string | number;
        lang: 'ga' | 'en';
        onReady?: (openModal: () => void) => void;
    } = $props();

    let modalOpen = $state(false);
    let loading = $state(false);
    let error = $state('');
    let playlists = $state<any[]>([]);
    let message = $state('');

    const isIrish = $derived(lang === 'ga');
    
    async function openModal() {
        loading = true;
        error = '';
        modalOpen = true;

        try {
            const pu = await loadPeachUser();
            const result = await pu.getPlaylists();

            if (result.error === 'Unauthorized') {
                error = isIrish
                    ? 'Caithfidh tú logáil isteach chun leabharmharc a chruthú.'
                    : 'You must be logged in to add a bookmark.';
                return;
            }

            playlists = (result.playlists ?? []).filter(
                (playlist: any) => playlist.businessId === 'watch_later'
            );
        } catch (err) {
            console.error('Failed to load playlists:', err);
            error = isIrish
                ? 'Níorbh fhéidir na seinmliostaí a luchtú.'
                : 'Unable to load playlists. Please try again.';
        } finally {
            loading = false;
        }
    }

    $effect(() => {
        onReady?.(openModal);
    });

    async function addBookmark(playlist: string) {
        loading = true;
        error = '';
        message = '';

        try {
            const pu = await loadPeachUser();
            const result = await pu.addBookmarkToPlaylist(playlist, bookmark);

            if (result.error) {
                error = isIrish
                    ? 'Níorbh fhéidir an leabharmharc a chur leis.'
                    : 'Unable to add the bookmark. Please try again.';
                return;
            }

            message = isIrish
                ? 'Cuireadh an clár leis an seinnliosta.'
                : 'Bookmark has been added to your playlist.';
        } catch (err) {
            console.error('Failed to add bookmark:', err);
            error = isIrish
                ? 'Níorbh fhéidir an leabharmharc a chur leis.'
                : 'Unable to add the bookmark. Please try again.';
        } finally {
            loading = false;
        }
    }
</script>

<button class="hero-button-text" type="button" onclick={openModal} disabled={loading}>{loading ? (isIrish ? 'Ag lódáil…' : 'Loading…') : 'Bookmark'}</button>

{#if modalOpen}
    <div class="bookmark-modal-backdrop" role="presentation" onclick={(event) => {
        if (event.target === event.currentTarget) modalOpen = false;
    }}>
        <section
            class="bookmark-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bookmark-modal-title"
        >
            <h2 id="bookmark-modal-title">
                {isIrish ? 'Seinnliosta' : 'Playlists'}
            </h2>
            
            {#if error}
                <p class="bookmark-error">{error}</p>

                {#if error.includes('logged in') || error.includes('logáil isteach')}
                    <p><a href={withBase(`/${lang}/account/login`)}>{isIrish ? 'Logáil isteach' : 'Log in / Register'}</a></p>
                {/if}
            {:else if message}
                <p class="bookmark-success">{message}</p>
            {:else}
                <p>{isIrish ? 'Cliceáil thíos chun an clár a chur le do sheinnliosta.' : 'Click below to add this programme to your playlist.'}</p>

                {#each playlists as playlist (playlist.businessId)}
                    <p><button type="button" onclick={() => addBookmark(playlist.businessId)} disabled={loading}>{isIrish ? 'Mo Sheinnliosta' : 'My Playlist'}</button></p>
                {/each}
            {/if}

            <button type="button" onclick={() => modalOpen = false}>{isIrish ? 'DÚN' : 'CLOSE'}</button>
        </section>
    </div>
{/if}

<style>
.bookmark-button {
    cursor: pointer;
}

.bookmark-modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: rgb(0 0 0 / 70%);
}

.bookmark-modal {
    width: min(100%, 480px);
    padding: 24px;
    background: #fff;
    color: #222;
}
</style>