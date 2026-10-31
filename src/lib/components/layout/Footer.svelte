<script lang="ts">
    let { lang = 'ga' } = $props<{ lang: string }>();

    const footerContent = {
        ga: [
                {
                title: 'Brandaí Eile',
                links: [
                    { label: 'Cúla4', url: 'https://www.cula4.com/en', external: true },
                    { label: 'Molscéal', url: 'https://www.molsceal.ie', external: true },
                    { label: 'BLOC', url: 'https://bloc.tg4.ie/en', external: true },
                    { label: 'Cine4', url: 'https://www.cine4.ie/en/produced-films', external: true },
                    { label: 'Cartlann TG4', url: 'https://www.tg4.ie/ga/brandai-eile/tg4-archive/' },
                    { label: 'Gradam Ceoil TG4', url: 'https://www.tg4.ie/ga/brandai-eile/gradam-ceoil/gradaim-reatha/' },
                    { label: 'Nuacht', url: 'https://www.tg4.ie/ga/brandai-eile/nuacht/' },
                    { label: 'Aimsir TG4', url: 'https://www.tg4.ie/ga/brandai-eile/an-aimsir/' },
                    { label: 'TG4 Foghlaim', url: 'https://foghlaim.tg4.ie', external: true }
                ]
            },
            {
                title: 'Eolas',
                links: [
                    { label: 'Treoir', url: 'https://www.tg4.ie/ga/eolas/treoir/' },
                    { label: 'Aip Seinnteoir TG4', url: 'https://www.tg4.ie/ga/eolas/aip-seinnteoir-tg4/' },
                    { label: 'Comórtais', url: 'https://www.tg4.ie/ga/eolas/comortais/' },
                    { label: 'Nuachtlitir', url: 'https://www.tg4.ie/ga/eolas/nuachtlitir/' },
                    { label: 'Preas', url: 'https://www.tg4.ie/ga/eolas/preas/' },
                    { label: 'Gradaim', url: 'https://www.tg4.ie/ga/eolas/gradaim/' },
                    { label: 'Téarmaí & Coinníollacha', url: 'https://www.tg4.ie/ga/eolas/tearmai/' },
                    { label: 'Príobháideachas', url: 'https://www.tg4.ie/ga/eolas/priobhaideachas/' },
                    { label: 'Siopa', url: 'https://www.tg4.ie/ga/eolas/siopa/' },
                    { label: 'Ceisteanna Coitianta', url: 'https://www.tg4.ie/ga/eolas/faq/' },
                    { label: 'Teagmháil', url: 'https://www.tg4.ie/ga/eolas/teagmhail/' },
                    { label: 'Fotheidil', url: 'https://www.tg4.ie/ga/eolas/fotheidil/' },
                    { label: 'Inrochtaineacht', url: 'https://www.tg4.ie/ga/eolas/inrochtaineacht/' },
                    { label: 'Gearán Faoi Rochtain ar Sheirbhísí', url: 'https://www.tg4.ie/ga/eolas/gearan-faoi-rochtain-ar-sheirbhisi/' },
                    { label: 'Gearáin Fhoirmiúla', url: 'https://www.tg4.ie/ga/eolas/gearain-fhoirmiula/' }
                ]
            },
            {
                title: 'Corparáid',
                links: [
                    { label: 'Buneolas', url: 'https://www.tg4.ie/ga/corporate/buneolas/' },
                    { label: 'Bord TG4', url: 'https://www.tg4.ie/ga/corporate/bord-tg4/' },
                    { label: 'Rialachas Corparáideach', url: 'https://www.tg4.ie/ga/corporate/rialachas-corparaideach/' },
                    { label: 'Foireann TG4', url: 'https://www.tg4.ie/ga/corporate/foireann-tg4/' },
                    { label: 'Folúntais', url: 'https://www.tg4.ie/ga/corporate/foluntais/' },
                    { label: 'Tairiscintí', url: 'https://www.tg4.ie/ga/corporate/tairiscinti/' },
                    { label: 'Soláthar', url: 'https://www.tg4.ie/ga/corporate/solathar/' },
                    { label: 'Díolacháin', url: 'https://www.tg4.ie/ga/corporate/diolachain/' },
                    { label: 'Traenáil & Forbairt', url: 'https://www.tg4.ie/ga/corporate/traenail-forbairt/' },
                    { label: 'Saoráil Faisnéise', url: 'https://www.tg4.ie/ga/corporate/saorail-faisneise/' }
                ]
            },
            {
                title: 'Coimisiúin',
                links: [
                    { label: 'Coimisiúnú', url: 'https://www.tg4.ie/ga/coimisiuin/coimisiunu/' },
                    { label: 'Treoirlínte', url: 'https://www.tg4.ie/ga/coimisiuin/treoirlinte/' }
                ]
            }
        ],
        en: [
                {
                title: 'Brandaí Eile',
                links: [
                    { label: 'Cúla4', url: 'https://www.cula4.com/en', external: true },
                    { label: 'Molscéal', url: 'https://www.molsceal.ie', external: true },
                    { label: 'BLOC', url: 'https://bloc.tg4.ie/en', external: true },
                    { label: 'Cine4', url: 'https://www.cine4.ie/en/produced-films', external: true },
                    { label: 'Cartlann TG4', url: 'https://www.tg4.ie/ga/brandai-eile/tg4-archive/' },
                    { label: 'Gradam Ceoil TG4', url: 'https://www.tg4.ie/ga/brandai-eile/gradam-ceoil/gradaim-reatha/' },
                    { label: 'Nuacht', url: 'https://www.tg4.ie/ga/brandai-eile/nuacht/' },
                    { label: 'Aimsir TG4', url: 'https://www.tg4.ie/ga/brandai-eile/an-aimsir/' },
                    { label: 'TG4 Foghlaim', url: 'https://foghlaim.tg4.ie', external: true }
                ]
            },
            {
                title: 'Eolas',
                links: [
                    { label: 'Treoir', url: 'https://www.tg4.ie/ga/eolas/treoir/' },
                    { label: 'Aip Seinnteoir TG4', url: 'https://www.tg4.ie/ga/eolas/aip-seinnteoir-tg4/' },
                    { label: 'Comórtais', url: 'https://www.tg4.ie/ga/eolas/comortais/' },
                    { label: 'Nuachtlitir', url: 'https://www.tg4.ie/ga/eolas/nuachtlitir/' },
                    { label: 'Preas', url: 'https://www.tg4.ie/ga/eolas/preas/' },
                    { label: 'Gradaim', url: 'https://www.tg4.ie/ga/eolas/gradaim/' },
                    { label: 'Téarmaí & Coinníollacha', url: 'https://www.tg4.ie/ga/eolas/tearmai/' },
                    { label: 'Príobháideachas', url: 'https://www.tg4.ie/ga/eolas/priobhaideachas/' },
                    { label: 'Siopa', url: 'https://www.tg4.ie/ga/eolas/siopa/' },
                    { label: 'Ceisteanna Coitianta', url: 'https://www.tg4.ie/ga/eolas/faq/' },
                    { label: 'Teagmháil', url: 'https://www.tg4.ie/ga/eolas/teagmhail/' },
                    { label: 'Fotheidil', url: 'https://www.tg4.ie/ga/eolas/fotheidil/' },
                    { label: 'Inrochtaineacht', url: 'https://www.tg4.ie/ga/eolas/inrochtaineacht/' },
                    { label: 'Gearán Faoi Rochtain ar Sheirbhísí', url: 'https://www.tg4.ie/ga/eolas/gearan-faoi-rochtain-ar-sheirbhisi/' },
                    { label: 'Gearáin Fhoirmiúla', url: 'https://www.tg4.ie/ga/eolas/gearain-fhoirmiula/' }
                ]
            },
            {
                title: 'Corparáid',
                links: [
                    { label: 'Buneolas', url: 'https://www.tg4.ie/ga/corporate/buneolas/' },
                    { label: 'Bord TG4', url: 'https://www.tg4.ie/ga/corporate/bord-tg4/' },
                    { label: 'Rialachas Corparáideach', url: 'https://www.tg4.ie/ga/corporate/rialachas-corparaideach/' },
                    { label: 'Foireann TG4', url: 'https://www.tg4.ie/ga/corporate/foireann-tg4/' },
                    { label: 'Folúntais', url: 'https://www.tg4.ie/ga/corporate/foluntais/' },
                    { label: 'Tairiscintí', url: 'https://www.tg4.ie/ga/corporate/tairiscinti/' },
                    { label: 'Soláthar', url: 'https://www.tg4.ie/ga/corporate/solathar/' },
                    { label: 'Díolacháin', url: 'https://www.tg4.ie/ga/corporate/diolachain/' },
                    { label: 'Traenáil & Forbairt', url: 'https://www.tg4.ie/ga/corporate/traenail-forbairt/' },
                    { label: 'Saoráil Faisnéise', url: 'https://www.tg4.ie/ga/corporate/saorail-faisneise/' }
                ]
            },
            {
                title: 'Coimisiúin',
                links: [
                    { label: 'Coimisiúnú', url: 'https://www.tg4.ie/ga/coimisiuin/coimisiunu/' },
                    { label: 'Treoirlínte', url: 'https://www.tg4.ie/ga/coimisiuin/treoirlinte/' }
                ]
            }
        ],
    };

    let sections = $derived(
        footerContent[lang === 'en' ? 'en' : 'ga']
    );
</script>

<footer class="tg4-footer">
    <div class="footer-inner">
        {#each sections as section}
            <section class="footer-prog-block">
                <h2>{section.title}</h2>
                <ul>
                    {#each section.links as link}
                        <li>
                            <a
                                href={link.url}
                                target={link.external ? '_blank' : undefined}
                                rel={link.external ? 'noopener noreferrer' : undefined}
                            >
                                {link.label}
                            </a>
                        </li>
                    {/each}
                </ul>
            </section>
        {/each}
    </div>
</footer>

<style>
.tg4-footer {
    max-width: var(--page-width);
    margin: 0 auto;
    padding: 20px;
    background-color: var(--genre-background);
}

.footer-inner {
    max-width: var(--episode-width);
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 40px;
}

.footer-prog-block h2 {
    font-size: 24px;
    font-weight: 600;
    margin: 0 0 20px;
}

.footer-prog-block ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.footer-prog-block li {
    margin-bottom: 11px;
}

.footer-prog-block a {
    color: #bbb;
    text-decoration: none;
    font-size: 14px;
    transition: color 0.2s ease;
}

.footer-prog-block a:hover {
    color: #fff;
    text-decoration: underline;
}

@media (max-width: 900px) {
    .footer-inner {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 35px;
    }
}

@media (max-width: 500px) {
    .tg4-footer {
        padding: 35px 20px;
    }

    .footer-inner {
        grid-template-columns: 1fr;
        gap: 30px;
    }
}
</style>