<script lang="ts">
    import { loadPeachUser } from '$lib/sso/peach';

    let {
        bookmark,
        lang
    }: {
        bookmark: string | number;
        lang: 'ga' | 'en';
    } = $props();

    let modalOpen = $state(false);
    let loading = $state(false);
    let error = $state('');

    const isIrish = $derived(lang === 'ga');

    async function openModal() {
        loading = true;
        error = '';

        try {
            const pu = await loadPeachUser();
            const result = await pu.getPlaylists();

            if (result.error === 'Unauthorized') {
                modalOpen = true;
                return;
            }

            // We'll add the playlist selection in the next step.
            console.log('Peach playlists:', result);
            modalOpen = true;
        } catch (err) {
            console.error('Failed to load playlists:', err);
            error = isIrish
                ? 'Níorbh fhéidir na seinmliostaí a luchtú.'
                : 'Unable to load playlists. Please try again.';
            modalOpen = true;
        } finally {
            loading = false;
        }
    }
</script>

<button
    class="bookmark-button"
    type="button"
    onclick={openModal}
    disabled={loading}
>
    {loading
        ? (isIrish ? 'Á LÓDÁIL…' : 'LOADING…')
        : '+ BOOKMARK'}
</button>

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
                <p>{error}</p>
            {:else}
                <p>
                    {isIrish
                        ? 'Cuir an clár le do sheinnliosta.'
                        : 'Add this programme to your playlist.'}
                </p>
            {/if}

            <button type="button" onclick={() => modalOpen = false}>
                {isIrish ? 'DÚN' : 'CLOSE'}
            </button>
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