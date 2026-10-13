<script lang="ts">
    import { page } from '$app/state';

    let { children } = $props();
</script>

<section class="account-page">
    <section class="episodes">
        <section class="account">
            <div class="account-layout">
                <nav
                    class="account-main-nav"
                    aria-label="Account navigation"
                >
                    <!-- Shared account links will go here -->
                </nav>

                <div class="account-content">
                    {@render children()}
                </div>

                <nav
                    class="account-secondary-nav"
                    aria-label="Account actions"
                >
                    <!-- Verification and account actions will go here -->
                </nav>

                <div class="account-sidebar"></div>
            </div>
        </section>
    </section>
</section>

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
        row-gap: 1.5rem;
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