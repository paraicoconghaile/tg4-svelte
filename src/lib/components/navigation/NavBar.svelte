<script lang="ts">
    import { navigation } from '$lib/config/siteNav';
    import { page } from '$app/state';

    const isIrish = $derived(page.url.pathname.startsWith('/ga'));

    let openMenu = $state<number | null>(null);
    let searchOpen = $state(false);
    let searchTerm = $state('');
    let mobileMenuOpen = $state(false);

    const switchLanguage = $derived.by(() => {
        const currentPath = page.url.pathname;

        function findTranslation(items: typeof navigation): string | null {
            for (const item of items) {
                if (item.children) {
                    const result = findTranslation(item.children);
                    if (result) return result;
                }

                if (isIrish && item.hrefGa === currentPath) {
                    return item.hrefEn ?? null;
                }

                if (!isIrish && item.hrefEn === currentPath) {
                    return item.hrefGa ?? null;
                }
            }

            return null;
        }

        const translatedPath =
            findTranslation(navigation) ??
            currentPath.replace(/^\/(en|ga)/, isIrish ? '/en' : '/ga');

        return translatedPath + page.url.search + page.url.hash;
    });

    function closeMobileMenu() {
        mobileMenuOpen = false;
    }

    function performSearch() {
        const query = searchTerm.trim();

        if (!query) {
            return;
        }

        window.location.href =
            `/${isIrish ? 'ga' : 'en'}/search?q=${encodeURIComponent(query)}`;
    }
</script>

<nav class="navbar">
    <div class="mobile-nav">
        <button class="mobile-menu-button" aria-label="Open menu" onclick={() => mobileMenuOpen = !mobileMenuOpen}>☰</button>

        <div class="mobile-logo">
            <a href={isIrish ? '/ga' : '/en'}>
                <img src="/icons/TG4_Player_Logo_Pink.svg" alt="TG4 Player"/>
            </a>
        </div>

        <div class="mobile-search">
            <button class="search-button" aria-label="Search" onclick={() => searchOpen = !searchOpen}><svg width="12" height="16" viewBox="0 0 12 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M6.91031 0.00528926C6.83613 0.00264463 6.76196 0 6.68648 0C6.67476 0 6.66175 0 6.65004 0C6.63833 0 6.62531 0 6.6136 0C6.53812 0 6.46394 0.00264463 6.38976 0.00528926C3.5892 0.113719 1.30008 2.24264 1.30008 5.42017C1.30008 7.19207 2.02755 8.69686 3.2144 9.67802C3.28207 9.73355 3.35235 9.78777 3.42262 9.84066L0 16H2.82399L5.71435 10.806C5.80414 10.8218 5.89394 10.8364 5.98634 10.8483C6.11908 10.8641 6.25312 10.8774 6.38976 10.884C6.47565 10.8893 6.56285 10.8919 6.65004 10.8932C6.73723 10.8932 6.82442 10.8893 6.91031 10.884C9.85143 10.7279 12 8.46678 12 5.42149C12 2.3762 9.70958 0.112397 6.91031 0.00528926ZM6.91031 8.77223C6.82442 8.78149 6.73853 8.78678 6.65004 8.78942C6.56154 8.78678 6.47565 8.78016 6.38976 8.77223C4.7253 8.6043 3.57749 7.27405 3.57749 5.46777C3.57749 3.66149 4.73181 2.22149 6.38976 2.11041C6.46134 2.10512 6.53291 2.10248 6.60709 2.10248C6.62141 2.10248 6.63572 2.10248 6.65004 2.1038C6.66435 2.1038 6.67867 2.10248 6.69298 2.10248C6.76586 2.10248 6.83874 2.10512 6.91031 2.11041C8.56957 2.22149 9.72389 3.59669 9.72389 5.46777C9.72389 7.33884 8.57477 8.60297 6.91031 8.77223Z" fill="white"/>
</svg>  {isIrish ? 'Cuardaigh' : 'Search'}</button>
        </div>
    </div>
    <div class="nav-left">
        <div class="logo">
            <a href={isIrish ? '/ga' : '/en'}><img src="/icons/TG4_Player_Logo_Pink.svg" alt="TG4 Player"></a>
        </div>
        <ul class="menu">
            {#each navigation as item, index}
                <li class="menu-item" onmouseenter={() => openMenu = index} onmouseleave={() => openMenu = null}>
                    {#if item.children}
                        <button type="button">
                            <span>
                                {isIrish ? item.titleGa : item.titleEn}
                            </span>
                            <span class="arrow">▼</span>
                        </button>
                        {#if openMenu === index}
                            <ul class="dropdown">
                                {#each item.children as child}
                                    <li>
                                        <a href={isIrish ? child.hrefGa : child.hrefEn}>
                                            {isIrish ? child.titleGa : child.titleEn}
                                        </a>
                                    </li>
                                {/each}
                            </ul>
                        {/if}
                    {:else}
                        <a href={isIrish ? item.hrefGa : item.hrefEn}>{isIrish ? item.titleGa : item.titleEn}</a>
                    {/if}
                </li>
            {/each}
        </ul>
    </div>
    <div class="nav-right">
        <div class="search-wrapper">
            {#if searchOpen}
                <input
                    bind:value={searchTerm}
                    placeholder="{isIrish ? 'Cuardaigh' : 'Search'}..."
                    autofocus
                    onkeydown={(event) => {
                        if (event.key === 'Enter') {
                            performSearch();
                        }
                    }}
                />
            {/if}
            <button class="search-button" aria-label="Search" onclick={() => searchOpen = !searchOpen}><svg width="12" height="16" viewBox="0 0 12 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M6.91031 0.00528926C6.83613 0.00264463 6.76196 0 6.68648 0C6.67476 0 6.66175 0 6.65004 0C6.63833 0 6.62531 0 6.6136 0C6.53812 0 6.46394 0.00264463 6.38976 0.00528926C3.5892 0.113719 1.30008 2.24264 1.30008 5.42017C1.30008 7.19207 2.02755 8.69686 3.2144 9.67802C3.28207 9.73355 3.35235 9.78777 3.42262 9.84066L0 16H2.82399L5.71435 10.806C5.80414 10.8218 5.89394 10.8364 5.98634 10.8483C6.11908 10.8641 6.25312 10.8774 6.38976 10.884C6.47565 10.8893 6.56285 10.8919 6.65004 10.8932C6.73723 10.8932 6.82442 10.8893 6.91031 10.884C9.85143 10.7279 12 8.46678 12 5.42149C12 2.3762 9.70958 0.112397 6.91031 0.00528926ZM6.91031 8.77223C6.82442 8.78149 6.73853 8.78678 6.65004 8.78942C6.56154 8.78678 6.47565 8.78016 6.38976 8.77223C4.7253 8.6043 3.57749 7.27405 3.57749 5.46777C3.57749 3.66149 4.73181 2.22149 6.38976 2.11041C6.46134 2.10512 6.53291 2.10248 6.60709 2.10248C6.62141 2.10248 6.63572 2.10248 6.65004 2.1038C6.66435 2.1038 6.67867 2.10248 6.69298 2.10248C6.76586 2.10248 6.83874 2.10512 6.91031 2.11041C8.56957 2.22149 9.72389 3.59669 9.72389 5.46777C9.72389 7.33884 8.57477 8.60297 6.91031 8.77223Z" fill="white"/>
</svg></button>
        </div>

        <a href={switchLanguage} class="language-switch">{isIrish ? 'English' : 'Gaeilge'}</a>

        <button class="profile">Profile ▼</button>
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
                                    <a href={isIrish ? child.hrefGa : child.hrefEn} onclick={closeMobileMenu}>
                                        {isIrish ? child.titleGa : child.titleEn}
                                    </a>
                                </li>
                            {/each}
                        </ul>
                    {:else}
                        <a href={isIrish ? item.hrefGa : item.hrefEn} onclick={closeMobileMenu}>
                            {isIrish ? item.titleGa : item.titleEn}
                        </a>
                    {/if}
                </li>
            {/each}
        </ul>
        <div class="mobile-menu-footer">
            <a href={switchLanguage} onclick={closeMobileMenu}>
                {isIrish ? 'English' : 'Gaeilge'}
            </a>
            <button class="profile">
                Profile
            </button>
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

.search-button {
    background: none;
    border: none;
    padding: 4px 18px;
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

.mobile-nav,
.mobile-menu {
    display: none;
}

@media (max-width: 768px) {
    .navbar {
        height: 64px;
        padding: 0 20px;
    }

    .nav-left,
    .nav-right {
        display: none;
    }

    .mobile-nav {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .mobile-logo img {
        width: 100px;
        height: auto;
    }

    .mobile-menu-button,
    .mobile-search .search-button {
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
        padding: 18px 20px;
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
        padding: 16px 20px;
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
        padding: 12px 20px;
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
        background: var(--tg4-pink);
        padding: 8px 18px;
        font-weight: 700;
    }
}
</style>