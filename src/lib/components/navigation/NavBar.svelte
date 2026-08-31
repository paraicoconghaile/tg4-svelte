<script lang="ts">
    import { navigation } from '$lib/config/siteNav';
    import { page } from '$app/state';

    const isIrish = $derived(page.url.pathname.startsWith('/ga'));

    let openMenu = $state<number | null>(null);
    let searchOpen = $state(false);
    let searchTerm = $state('');

    const switchLanguage = $derived.by(() => {
        const url = new URL(page.url);

        if (url.pathname.startsWith('/ga')) {
            url.pathname = url.pathname.replace(/^\/ga/, '/en');
        } else if (url.pathname.startsWith('/en')) {
            url.pathname = url.pathname.replace(/^\/en/, '/ga');
        }

        return url.pathname + url.search + url.hash;
    });
</script>

<nav class="navbar">
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
                                        <a
                                            href={isIrish
                                                ? child.hrefGa
                                                : child.hrefEn}
                                        >
                                            {isIrish
                                                ? child.titleGa
                                                : child.titleEn}
                                        </a>
                                    </li>
                                {/each}
                            </ul>
                        {/if}
                    {:else}
                        <a href={isIrish ? item.hrefGa : item.hrefEn}>
                            {isIrish ? item.titleGa : item.titleEn}
                        </a>
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
                    placeholder="Search..."
                    autofocus
                />
            {/if}
            <button
                class="search-button"
                aria-label="Search"
                onclick={() => searchOpen = !searchOpen}
            >
                🔍
            </button>
        </div>

        <a href={switchLanguage} class="language-switch">
            {isIrish ? 'English' : 'Gaeilge'}
        </a>

        <button class="profile">
            Profile ▼
        </button>
    </div>
</nav>

<style>
.navbar {
    max-width: 1440px;
    height: 80px;
    margin: auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
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
    gap: 40px;
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
    padding: 0;
    color: var(--tg4-white);
    font-size: 1.4rem;
    cursor: pointer;
}

.search-button:hover {
    color: var(--tg4-pink);
}

.search-wrapper input {
    width: 220px;
    margin-right: 12px;
    padding: 10px 15px;
    border: 1px solid var(--grey-300);
    font-family: var(--font-body);
    background: var(--tg4-white);
    color: var(--tg4-black);
}
</style>