<script lang="ts">
    import { page } from '$app/state';
</script>

<section class="profile-page">
    <h2>Preferences</h2>

    <nav class="account-tabs">
        <a href={`/${page.params.lang}/account`}>Account</a>
        <a href={`/${page.params.lang}/account/profile`}>Profile</a>
        <a href={`/${page.params.lang}/account/preferences`} class="active">Preferences</a>
    </nav>
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
</style>