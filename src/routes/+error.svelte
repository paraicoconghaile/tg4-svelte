<script lang="ts">
    import { page } from '$app/state';
</script>

<svelte:head>
    <title>{page.status} - Error</title>
</svelte:head>

<div class="error-page">
    <h1>{page.status}</h1>
    <p>{page.error?.message ?? 'Something went wrong.'}</p>
    <p><a href="/" class="language-switch">Home</a></p>
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
    font-size: 5rem;
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