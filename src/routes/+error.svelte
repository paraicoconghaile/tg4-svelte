<script lang="ts">
    import { page } from '$app/state';

    let isLiveError = $derived(
        page.status === 500 &&
        page.url.pathname.includes('/player/live/')
    );

    let isIrish = $derived(
        page.url.pathname.startsWith('/ga/')
    );

    let fallbackUrl = $derived(
        isIrish
            ? 'https://dev.tg4.ie/ga/player/feach-beo/eile/'
            : 'https://dev.tg4.ie/en/player/watch-live/other/'
    );
</script>

<svelte:head>
    <title>{page.status} - Error</title>
</svelte:head>


<div class="error-page">
    <h1>{page.status}</h1>

    {#if isLiveError}
        <p>
            {isIrish ? 'Tá fadhb againn leis an sruth beo faoi láthair.' : 'We are experiencing problems with the live stream.'}
        </p>

        <p>
            <a href={fallbackUrl} class="language-switch">
                {isIrish ? 'Féach ar TG4 Beo' : 'Watch TG4 Live'}
            </a>
        </p>
    {:else}
        <p>{page.error?.message ?? 'Something went wrong.'}</p>
        <p>
            <a href="/" class="language-switch">Home</a>
        </p>
    {/if}
</div>


<style>
.error-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 2rem;
}

h1 {
    font-size: 4rem;
    margin: 0;
}

p {
    font-size: 1.5rem;
    margin: 1rem 0 2rem;
}

.language-switch {
    background: var(--tg4-pink);
    color: var(--tg4-white);
    padding: 4px 18px;
    font-weight: 700;
    transition: background .2s ease;
}

.language-switch:hover {
    background: #ff4b91;
}
</style>