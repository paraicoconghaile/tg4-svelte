<script lang="ts">
    import { navigation } from '$lib/config/siteNav';
    import { page } from '$app/state';
    import { withBase, stripBase } from '$lib/utils/paths';
    import { getGenreByKey } from '$lib/config/playerNav';
    import { loadPeachUser } from '$lib/sso/peach';
    import { onMount } from 'svelte';

    const isIrish = $derived(stripBase(page.url.pathname) === '/ga' || stripBase(page.url.pathname).startsWith('/ga/'));

    let openMenu = $state<number | null>(null);
    let searchOpen = $state(false);
    let searchTerm = $state('');
    let mobileMenuOpen = $state(false);

    let isLoggedIn = $state(false);
    let userInitials = $state('');

    const switchLanguage = $derived.by(() => {
        const currentPath = stripBase(page.url.pathname);
        const targetLang = isIrish ? 'en' : 'ga';

        const categoryMatch = currentPath.match(
            /^\/(en|ga)\/player\/([^/]+)(\/.*)?$/
        );

        if (categoryMatch) {
            const [, , section, suffix = ''] = categoryMatch;
            const genre = getGenreByKey(section);

            if (genre) {
                const targetSection = genre.key[targetLang];

                return withBase(
                    `/${targetLang}/player/${targetSection}${suffix}`
                ) + page.url.search + page.url.hash;
            }
        }

        function findTranslation(items: typeof navigation): string | null {
            for (const item of items) {
                if (item.children) {
                    const result = findTranslation(item.children);
                    if (result) return result;
                }

                if (isIrish && item.hrefGa === currentPath) return item.hrefEn ?? null;
                if (!isIrish && item.hrefEn === currentPath) return item.hrefGa ?? null;
            }

            return null;
        }

        const translatedPath =
            findTranslation(navigation) ??
            currentPath.replace(/^\/(en|ga)/, isIrish ? '/en' : '/ga');

        return withBase(translatedPath) + page.url.search + page.url.hash;
    });

    function closeMobileMenu() {
        mobileMenuOpen = false;
    }

    function performSearch() {
        const query = searchTerm.trim();

        if (!query) {
            return;
        }

        window.location.href = withBase(`/${isIrish ? 'ga' : 'en'}/search?q=${encodeURIComponent(query)}`);
    }

    async function checkUserSession() {
        try {
            const pu = await loadPeachUser();
            const result = await pu.getCombinedSessionAndPreferenceProfile();

            if (result?.profile?.verified === true) {
                const firstName = result.profile.firstName ?? '';
                const lastName = result.profile.lastName ?? '';

                userInitials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
                isLoggedIn = true;
            } else {
                isLoggedIn = false;
                userInitials = '';
            }
        } catch (error) {
            isLoggedIn = false;
            userInitials = '';
        }
    }

    onMount(() => {
        void checkUserSession();
    });
</script>

<nav class="navbar" class:search-open={searchOpen}>
    <div class="mobile-nav">
        <button class="mobile-menu-button" aria-label="Open menu" onclick={() => mobileMenuOpen = !mobileMenuOpen}>☰</button>

        <div class="mobile-logo">
            <a href={withBase(isIrish ? '/ga' : '/en')}><svg width="135" id="TG4_x2B__logo_x5F_020926_x5F_bándearg_x5F_neg" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 757.1 277.2"><g id="TG"><g id="TG1"><g><rect fill="#ff126c" y="0" width="459" height="277.2"></rect><path fill="#fff" d="M418.8,139.6v-12.1h-92.9l-17.4,35.2h64c-7.5,23.9-27,40.2-55.5,40.2s-61.5-26.5-61.5-63.4,24.3-64.2,58.8-64.2,35.6,10.5,43.7,22.1h52.8c-20.1-42.2-58.2-62.3-96.4-62.3-56.2,0-103,41.2-103,103.4s44.8,104.4,105,104.4,102.4-41.2,102.4-103.4h0Z"></path><polygon fill="#fff" points="204.9 74.8 223 38.2 40.2 38.2 40.2 74.8 107.4 74.8 107.4 243 149.5 243 149.5 74.8 204.9 74.8"></polygon></g></g></g><g id="Layer_38_copy_16"><rect fill="#ff126c" x="479" y="0" width="278.1" height="277.2"></rect><g id="_x34_"><path fill="#fff" d="M561.7,154.4c2.2-14.5,10.2-44.2,44.5-67,32-21.2,67.8-16.6,67.8-16.6v-35.1h0s-26.8-2.5-53.5,5c-31.7,8.9-59.2,29.8-72.2,46.9-22.4,29.4-24.9,47.1-27.7,63.6s0,35.7,0,35.7h42s-3.4-15.7-1-32.4h0Z"></path><polygon fill="#fff" points="726 150.4 674 150.4 674 88.1 631.7 101 631.7 150.4 589.9 150.4 579.2 186.7 631.7 186.7 631.7 248.3 674 235.6 674 186.7 715.2 186.7 726 150.4"></polygon></g></g></svg></a>
        </div>

        <div class="mobile-search">
            {#if searchOpen}
                <form
                    class="mobile-search-form"
                    onsubmit={(event) => {
                        event.preventDefault();
                        performSearch();
                    }}
                >
                    <input
                        bind:value={searchTerm}
                        placeholder="{isIrish ? 'Cuardaigh' : 'Search'}..."
                        autofocus
                    />

                    <button
                        type="submit"
                        class="search-button"
                        aria-label={isIrish ? 'Cuardaigh' : 'Search'}
                    >
                        <svg width="12" height="16" viewBox="0 0 12 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6.91031 0.00528926C6.83613 0.00264463 6.76196 0 6.68648 0C6.67476 0 6.66175 0 6.65004 0C6.63833 0 6.62531 0 6.6136 0C6.53812 0 6.46394 0.00264463 6.38976 0.00528926C3.5892 0.113719 1.30008 2.24264 1.30008 5.42017C1.30008 7.19207 2.02755 8.69686 3.2144 9.67802C3.28207 9.73355 3.35235 9.78777 3.42262 9.84066L0 16H2.82399L5.71435 10.806C5.80414 10.8218 5.89394 10.8364 5.98634 10.8483C6.11908 10.8641 6.25312 10.8774 6.38976 10.884C6.47565 10.8893 6.56285 10.8919 6.65004 10.8932C6.73723 10.8932 6.82442 10.8893 6.91031 10.884C9.85143 10.7279 12 8.46678 12 5.42149C12 2.3762 9.70958 0.112397 6.91031 0.00528926ZM6.91031 8.77223C6.82442 8.78149 6.73853 8.78678 6.65004 8.78942C6.56154 8.78678 6.47565 8.78016 6.38976 8.77223C4.7253 8.6043 3.57749 7.27405 3.57749 5.46777C3.57749 3.66149 4.73181 2.22149 6.38976 2.11041C6.46134 2.10512 6.53291 2.10248 6.60709 2.10248C6.62141 2.10248 6.63572 2.10248 6.65004 2.1038C6.66435 2.1038 6.67867 2.10248 6.69298 2.10248C6.76586 2.10248 6.83874 2.10512 6.91031 2.11041C8.56957 2.22149 9.72389 3.59669 9.72389 5.46777C9.72389 7.33884 6.91031 8.77223 6.91031 8.77223Z" fill="white"/>
                        </svg>
                    </button>

                    <button
                        type="button"
                        class="search-close"
                        aria-label={isIrish ? 'Dún' : 'Close'}
                        onclick={() => {
                            searchOpen = false;
                            searchTerm = '';
                        }}
                    >
                        ×
                    </button>
                </form>
                <!-- <form
                    class="mobile-search-form"
                    onsubmit={(event) => {
                        event.preventDefault();
                        performSearch();
                    }}
                >
                    <input
                        bind:value={searchTerm}
                        placeholder="{isIrish ? 'Cuardaigh' : 'Search'}..."
                        autofocus
                    />

                    <button
                        type="submit"
                        class="search-button"
                        aria-label={isIrish ? 'Cuardaigh' : 'Search'}
                    >
                        <svg width="12" height="16" viewBox="0 0 12 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6.91031 0.00528926C6.83613 0.00264463 6.76196 0 6.68648 0C6.67476 0 6.66175 0 6.65004 0C6.63833 0 6.62531 0 6.6136 0C6.53812 0 6.46394 0.00264463 6.38976 0.00528926C3.5892 0.113719 1.30008 2.24264 1.30008 5.42017C1.30008 7.19207 2.02755 8.69686 3.2144 9.67802C3.28207 9.73355 3.35235 9.78777 3.42262 9.84066L0 16H2.82399L5.71435 10.806C5.80414 10.8218 5.89394 10.8364 5.98634 10.8483C6.11908 10.8641 6.25312 10.8774 6.38976 10.884C6.47565 10.8893 6.56285 10.8919 6.65004 10.8932C6.73723 10.8932 6.82442 10.8893 6.91031 10.884C9.85143 10.7279 12 8.46678 12 5.42149C12 2.3762 9.70958 0.112397 6.91031 0.00528926ZM6.91031 8.77223C6.82442 8.78149 6.73853 8.78678 6.65004 8.78942C6.56154 8.78678 6.47565 8.78016 6.38976 8.77223C4.7253 8.6043 3.57749 7.27405 3.57749 5.46777C3.57749 3.66149 4.73181 2.22149 6.38976 2.11041C6.46134 2.10512 6.53291 2.10248 6.60709 2.10248C6.62141 2.10248 6.63572 2.10248 6.65004 2.1038C6.66435 2.1038 6.67867 2.10248 6.69298 2.10248C6.76586 2.10248 6.83874 2.10512 6.91031 2.11041C8.56957 2.22149 9.72389 3.59669 9.72389 5.46777C9.72389 7.33884 6.91031 8.77223 6.91031 8.77223Z" fill="white"/>
                        </svg>
                    </button>
                </form> -->
            {:else}
                <button
                    class="search-button"
                    aria-label={isIrish ? 'Cuardaigh' : 'Search'}
                    onclick={() => searchOpen = true}
                >
                    <svg width="12" height="16" viewBox="0 0 12 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M6.91031 0.00528926C6.83613 0.00264463 6.76196 0 6.68648 0C6.67476 0 6.66175 0 6.65004 0C6.63833 0 6.62531 0 6.6136 0C6.53812 0 6.46394 0.00264463 6.38976 0.00528926C3.5892 0.113719 1.30008 2.24264 1.30008 5.42017C1.30008 7.19207 2.02755 8.69686 3.2144 9.67802C3.28207 9.73355 3.35235 9.78777 3.42262 9.84066L0 16H2.82399L5.71435 10.806C5.80414 10.8218 5.89394 10.8364 5.98634 10.8483C6.11908 10.8641 6.25312 10.8774 6.38976 10.884C6.47565 10.8893 6.56285 10.8919 6.65004 10.8932C6.73723 10.8932 6.82442 10.8893 6.91031 10.884C9.85143 10.7279 12 8.46678 12 5.42149C12 2.3762 9.70958 0.112397 6.91031 0.00528926ZM6.91031 8.77223C6.82442 8.78149 6.73853 8.78678 6.65004 8.78942C6.56154 8.78678 6.47565 8.78016 6.38976 8.77223C4.7253 8.6043 3.57749 7.27405 3.57749 5.46777C3.57749 3.66149 4.73181 2.22149 6.38976 2.11041C6.46134 2.10512 6.53291 2.10248 6.60709 2.10248C6.62141 2.10248 6.63572 2.10248 6.65004 2.1038C6.66435 2.1038 6.67867 2.10248 6.69298 2.10248C6.76586 2.10248 6.83874 2.10512 6.91031 2.11041C8.56957 2.22149 9.72389 3.59669 9.72389 5.46777C9.72389 7.33884 8.57477 8.60297 6.91031 8.77223Z" fill="white"/>
</svg> <!-- {isIrish ? 'Cuardaigh' : 'Search'} -->
                </button>
            {/if}
        </div>
    </div>
    <div class="nav-left">
        <div class="logo">
            <a href={withBase(isIrish ? '/ga' : '/en')}><svg width="135" id="TG4_x2B__logo_x5F_020926_x5F_bándearg_x5F_neg" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 757.1 277.2"><g id="TG"><g id="TG1"><g><rect fill="#ff126c" y="0" width="459" height="277.2"></rect><path fill="#fff" d="M418.8,139.6v-12.1h-92.9l-17.4,35.2h64c-7.5,23.9-27,40.2-55.5,40.2s-61.5-26.5-61.5-63.4,24.3-64.2,58.8-64.2,35.6,10.5,43.7,22.1h52.8c-20.1-42.2-58.2-62.3-96.4-62.3-56.2,0-103,41.2-103,103.4s44.8,104.4,105,104.4,102.4-41.2,102.4-103.4h0Z"></path><polygon fill="#fff" points="204.9 74.8 223 38.2 40.2 38.2 40.2 74.8 107.4 74.8 107.4 243 149.5 243 149.5 74.8 204.9 74.8"></polygon></g></g></g><g id="Layer_38_copy_16"><rect fill="#ff126c" x="479" y="0" width="278.1" height="277.2"></rect><g id="_x34_"><path fill="#fff" d="M561.7,154.4c2.2-14.5,10.2-44.2,44.5-67,32-21.2,67.8-16.6,67.8-16.6v-35.1h0s-26.8-2.5-53.5,5c-31.7,8.9-59.2,29.8-72.2,46.9-22.4,29.4-24.9,47.1-27.7,63.6s0,35.7,0,35.7h42s-3.4-15.7-1-32.4h0Z"></path><polygon fill="#fff" points="726 150.4 674 150.4 674 88.1 631.7 101 631.7 150.4 589.9 150.4 579.2 186.7 631.7 186.7 631.7 248.3 674 235.6 674 186.7 715.2 186.7 726 150.4"></polygon></g></g></svg></a>
        </div>
        <ul class="menu">
            {#each navigation as item, index}
                <li class="menu-item" onmouseenter={() => openMenu = index} onmouseleave={() => openMenu = null}>
                    {#if item.children}
                        <button type="button">
                            <span>
                                {isIrish ? item.titleGa : item.titleEn}
                            </span>
                            <span class="arrow"><svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.14889 4.68113L9.59961 1.31321L8.25033 -5.8979e-08L4.79961 3.36792L1.34889 -3.6065e-07L-0.00039011 1.31321L4.79961 6L6.14889 4.68113Z" fill="white"/></svg></span>
                        </button>
                        {#if openMenu === index}
                            <ul class="dropdown">
                                {#each item.children as child}
                                    <li>
                                        <a href={withBase(isIrish ? child.hrefGa : child.hrefEn)}>
                                            {isIrish ? child.titleGa : child.titleEn}
                                        </a>
                                    </li>
                                {/each}
                            </ul>
                        {/if}
                    {:else}
                        <a href={withBase(isIrish ? item.hrefGa : item.hrefEn)}>{isIrish ? item.titleGa : item.titleEn}</a>
                    {/if}
                </li>
            {/each}
        </ul>
    </div>
    <div class="nav-right">
        <div class="search-wrapper">
            <form class="search-wrapper"
                onsubmit={(event) => {
                    event.preventDefault();

                    if (searchOpen) {
                        performSearch();
                    } else {
                        searchOpen = true;
                    }
                }}
            >
                {#if searchOpen}
                    <input
                        bind:value={searchTerm}
                        placeholder="{isIrish ? 'Cuardaigh' : 'Search'}..."
                        autofocus
                    />
                {/if}

                <button
                    type="submit"
                    class="search-button"
                    aria-label={isIrish ? 'Cuardaigh' : 'Search'}
                >
                    <svg width="12" height="16" viewBox="0 0 12 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M6.91031 0.00528926C6.83613 0.00264463 6.76196 0 6.68648 0C6.67476 0 6.66175 0 6.65004 0C6.63833 0 6.62531 0 6.6136 0C6.53812 0 6.46394 0.00264463 6.38976 0.00528926C3.5892 0.113719 1.30008 2.24264 1.30008 5.42017C1.30008 7.19207 2.02755 8.69686 3.2144 9.67802C3.28207 9.73355 3.35235 9.78777 3.42262 9.84066L0 16H2.82399L5.71435 10.806C5.80414 10.8218 5.89394 10.8364 5.98634 10.8483C6.11908 10.8641 6.25312 10.8774 6.38976 10.884C6.47565 10.8893 6.56285 10.8919 6.65004 10.8932C6.73723 10.8932 6.82442 10.8893 6.91031 10.884C9.85143 10.7279 12 8.46678 12 5.42149C12 2.3762 9.70958 0.112397 6.91031 0.00528926ZM6.91031 8.77223C6.82442 8.78149 6.73853 8.78678 6.65004 8.78942C6.56154 8.78678 6.47565 8.78016 6.38976 8.77223C4.7253 8.6043 3.57749 7.27405 3.57749 5.46777C3.57749 3.66149 4.73181 2.22149 6.38976 2.11041C6.46134 2.10512 6.53291 2.10248 6.60709 2.10248C6.62141 2.10248 6.63572 2.10248 6.65004 2.1038C6.66435 2.1038 6.67867 2.10248 6.69298 2.10248C6.76586 2.10248 6.83874 2.10512 6.91031 2.11041C8.56957 2.22149 9.72389 3.59669 9.72389 5.46777C9.72389 7.33884 8.57477 8.60297 6.91031 8.77223Z" fill="white"/>
                    </svg>
                </button>

                {#if searchOpen}
                    <button
                        type="button"
                        class="search-close"
                        aria-label={isIrish ? 'Dún' : 'Close'}
                        onclick={() => {
                            searchOpen = false;
                            searchTerm = '';
                        }}
                    >
                        ×
                    </button>
                {/if}
            </form>
        </div>

        <a href={switchLanguage} class="language-switch">{isIrish ? 'English' : 'Gaeilge'}</a>

        <a href={withBase(isLoggedIn ? (isIrish ? '/ga/account/account' : '/en/account/account') : (isIrish ? '/ga/account/login' : '/en/account/login'))} aria-label={isLoggedIn ? 'My Account' : 'Log in'}>
            {#if isLoggedIn && userInitials}
                <span class="account-avatar">{userInitials}</span>
            {:else}
                <img src={withBase('/icons/profile.svg')} alt="TG4 Account" class="sso_logo" />
            {/if}
        </a>
    </div>
</nav>

{#if mobileMenuOpen}
    <div class="mobile-menu">
        <div class="mobile-menu-header">
            <span>
                {isIrish ? 'Menu' : 'Menu'}
            </span>
            <button aria-label="Close menu" onclick={closeMobileMenu}>×</button>
        </div>
        <ul>
            {#each navigation as item}
                <li>
                    {#if item.children}
                        <div class="mobile-menu-heading">
                            {isIrish ? item.titleGa : item.titleEn}
                        </div>

                        <ul class="mobile-submenu">
                            {#each item.children as child}
                                <li>
                                    <a href={withBase(isIrish ? child.hrefGa : child.hrefEn)} onclick={closeMobileMenu}>
                                        {isIrish ? child.titleGa : child.titleEn}
                                    </a>
                                </li>
                            {/each}
                        </ul>
                    {:else}
                        <a href={withBase(isIrish ? item.hrefGa : item.hrefEn)} onclick={closeMobileMenu}>
                            {isIrish ? item.titleGa : item.titleEn}
                        </a>
                    {/if}
                </li>
            {/each}
        </ul>
        <div class="mobile-menu-footer">
            <a href={switchLanguage} class="language-switch" onclick={closeMobileMenu}>{isIrish ? 'English' : 'Gaeilge'}</a>
            <a href={withBase(isLoggedIn ? (isIrish ? '/ga/account/account' : '/en/account/account') : (isIrish ? '/ga/account/login' : '/en/account/login'))} aria-label={isLoggedIn ? 'My Account' : 'Log in'}>
                {#if isLoggedIn && userInitials}
                    <span class="account-avatar">{userInitials}</span>
                {:else}
                    <img src={withBase('/icons/profile.svg')} alt="TG4 Account" class="sso_logo" />
                {/if}
            </a>
        </div>
    </div>
{/if}

<style>
.navbar {
    max-width: 1440px;
    height: 80px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--tg4-grey-2);
    padding: 0 55px;
    box-sizing: border-box;
}

.nav-left {
    display: flex;
    align-items: center;
    gap: 50px;
}

.nav-right {
    display: flex;
    align-items: center;
    gap: 25px;
}

.logo img {
    width: 150px;
    height: auto;
}

.menu {
    display: flex;
    align-items: center;
    list-style: none;
    gap: 30px;
    margin: 0;
    padding: 0;
}

.menu>li {
    position: relative;
}

.menu a, .menu button {
    display: flex;
    align-items: center;
    background: none;
    border: none;
    cursor: pointer;
    font: inherit;
    color: inherit;
    text-decoration: none;
    padding: 0;
    line-height: 1;
}

.menu button {
    gap: 6px;
}

.arrow {
    font-size: .7rem;
    line-height: 1;
}

.dropdown {
    position:absolute;
    top:calc(100% - 1px);
    left:0;
    min-width:240px;
    background:var(--tg4-black);
    color:var(--tg4-white);
    box-shadow:0 12px 30px rgba(0,0,0,.35);
    list-style:none;
    padding:12px 0;
    z-index:1000;
}

.dropdown li a {
    display: block;
    padding: 12px 20px;
    color: var(--tg4-white);
}

.dropdown li a:hover {
    background: var(--tg4-pink);
}

.menu-item::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    top: 100%;
    height: 15px;
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

.search-wrapper {
    display: flex;
    align-items: center;
}

.search-close {
    background: none;
    border: none;
    background: var(--tg4-grey-1);
    color: var(--tg4-white);
    padding: 2px 8px;
    font-size: 1.35rem;
    cursor: pointer;
    margin-left: 4px;
}

.search-close:hover {
    color: var(--tg4-pink);
}

/* .search-close {
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    background: var(--tg4-grey-1);
    color: var(--tg4-white);
    font-size: 1.25rem;
    padding: 0;
    cursor: pointer;
    margin-left: 4px;
}

.search-close:hover {
    color: var(--tg4-pink);
} */

.search-button {
    background: none;
    border: none;
    padding: 4px 10px;
    color: var(--tg4-white);
    font-size: 1rem;
    cursor: pointer;
    background: var(--tg4-grey-1);
}

.search-button:hover {
    color: var(--tg4-pink);
}

.search-wrapper input {
    width: 180px;
    margin-right: 12px;
    padding: 6px 12px;
    border: 1px solid var(--grey-300);
    font-family: var(--font-body);
    background: var(--tg4-white);
    color: var(--tg4-black);
}

.sso_logo {
    display: block;
    width: 45px;
    cursor: pointer;
}

.account-avatar {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #FF126C;
    color: #FFFFFF;
    font-size: 13px;
    font-weight: 700;
    line-height: 1;
    text-transform: uppercase;
    border: 3px solid var(--tg4-white);
}

.mobile-nav,
.mobile-menu {
    display: none;
}

@media (max-width: 1160px) {
    .nav-left {
        gap: 20px;
    }

    .nav-right {
        gap: 15px;
    }

    .menu {
        gap: 18px;
    }

    .search-wrapper input {
        width: 130px;
    }
}

@media (max-width: 1024px) {
    .navbar {
        padding: 0 15px;
    }
}

@media (max-width: 900px) {
    .navbar {
        height: 64px;
        padding: 0 20px;
    }

    .nav-left,
    .nav-right {
        display: none;
    }

    .mobile-nav {
        position: relative;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .mobile-logo {
        margin-top: 10px;
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
    }

    .mobile-logo img {
        width: 150px;
        height: auto;
    }

    .mobile-menu-button {
        background: none;
        border: none;
        color: var(--tg4-white);
        cursor: pointer;
        padding: 5px;
        font-size: 1rem;
    }

    .mobile-menu-button:hover,
    .mobile-search .search-button:hover {
        color: var(--tg4-pink);
    }

    .mobile-search-form {
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .mobile-search-form input {
        height: 30px;
        box-sizing: border-box;
        padding: 5px 8px;
        border: 1px solid var(--grey-300);
        font-family: var(--font-body);
        background: var(--tg4-white);
        color: var(--tg4-black);
    }

    .mobile-search-form .search-button {
        flex-shrink: 0;
    }

    .mobile-menu {
        display: block;
        position: absolute;
        top: 64px;
        left: 0;
        right: 0;
        background: var(--tg4-black);
        color: var(--tg4-white);
        z-index: 2000;
        box-shadow: 0 12px 30px rgba(0,0,0,.35);
    }

    .mobile-menu-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 20px;
        border-bottom: 1px solid rgba(255,255,255,.15);
        font-weight: 700;
    }

    .mobile-menu-header button {
        background: none;
        border: none;
        color: var(--tg4-white);
        font-size: 2rem;
        cursor: pointer;
    }

    .mobile-menu ul {
        list-style: none;
        margin: 0;
        padding: 0;
    }

    .mobile-menu > ul > li {
        border-bottom: 1px solid rgba(255,255,255,.1);
    }

    .mobile-menu a,
    .mobile-menu-heading {
        display: block;
        padding: 10px 20px;
        color: var(--tg4-white);
        text-decoration: none;
    }

    .mobile-menu a:hover {
        background: var(--tg4-pink);
    }

    .mobile-menu-heading {
        font-weight: 700;
    }

    .mobile-submenu {
        padding: 0 0 8px 15px !important;
    }

    .mobile-submenu a {
        padding: 8px 20px;
        font-weight: 400;
    }

    .mobile-menu-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px;
        gap: 15px;
    }

    .mobile-menu-footer a {
        padding: 8px 18px;
        font-weight: 700;
    }

    .mobile-menu-footer a:hover {
        background: none;
    }
}

@media (max-width: 700px) {
    .navbar {
        height: auto;
        min-height: 64px;
        padding: 0 15px;
    }

    .mobile-nav {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        align-items: center;
        row-gap: 10px;
        padding: 0;
    }

    .mobile-menu-button {
        grid-column: 1;
        grid-row: 1;
        justify-self: start;
    }

    .mobile-logo {
        margin-top: 10px;
        position: static;
        transform: none;
        grid-column: 2;
        grid-row: 1;
        justify-self: center;
    }

    .mobile-search {
        grid-column: 3;
        grid-row: 1;
        justify-self: end;
    }

    .navbar.search-open .mobile-search {
        grid-column: 1 / -1;
        grid-row: 2;
        justify-self: stretch;
        width: 100%;
        padding-bottom: 10px;
    }

    .mobile-search-form {
        display: flex;
        width: 100%;
        gap: 6px;
        box-sizing: border-box;
    }

    .mobile-search-form input {
        flex: 1;
        width: 0;
        min-width: 0;
        box-sizing: border-box;
    }
}
</style>