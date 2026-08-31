<script lang="ts">
  	let { data } = $props();
    import { genres } from '$lib/config/playerNav';

    const poster =
        data.series.categories.image?.xlarge ??
        data.series.series.mainImage?.large ??
        data.series.series.poster ??
        'https://res.cloudinary.com/tg4/image/upload/w_1440,h_810,g_faces,c_fill,f_auto,q_auto/000000.jpg';
    
    const description = $derived(
        data.lang === 'ga'
            ? data.series.series.descGa
            : data.series.series.descEn
    );

    const episodesBySeries = $derived.by(() => {
    const grouped = new Map<number, typeof data.episodes>();

    for (const ep of data.episodes) {
            const key = ep.seriesNumber;
            if (!grouped.has(key)) {
                grouped.set(key, []);
            }
            grouped.get(key)!.push(ep);
        }
        return [...grouped.entries()];
    });

  	function getImageUrl(ep: any) {
    	if (ep?.prodCode) {
      		return `https://res.cloudinary.com/tg4/image/upload/w_700,h_395,g_faces,c_fill,f_auto,q_auto:eco/${ep.prodCode}.jpg`;
    	}

    	if (ep?.seriesCode) {
      		return `https://res.cloudinary.com/tg4/image/upload/w_700,h_395,g_faces,c_fill,f_auto,q_auto:eco/${ep.seriesCode}.jpg`;
    	}

    	return (ep.poster || 'https://res.cloudinary.com/tg4/image/upload/w_700,h_395,g_faces,c_fill,f_auto,q_auto/000000.jpg');
  	}

  	//console.log("Data", JSON.stringify(data, null, 2));
</script>

<section class="episode-page">
    <section class="episode-hero">
        <img class="hero-image" src={poster} alt={data.seriesTitle} />
        <div class="hero-overlay">
            <div class="hero-content">
                <h1>{data.series.series.name}</h1>

                {#if description}
                    <p>{description}</p>
                {/if}
                <div class="hero-buttons">
                    <a
                        class="play-button"
                        href={`/${data.lang}/player/${data.slug}/${data.episodes[0]?.episodeID}`}
                    >
                        ▶&nbsp; {data.lang === 'ga' ? 'Féach' : 'Watch now'}
                    </a>
                    <!-- <a
                        class="back-button"
                        href={`/${data.lang}/player/${data.section}`}
                    >
                        Back
                    </a> -->
                </div>
            </div>
        </div>
    </section>

    <!-- Episodes -->
    <section class="episodes">
        {#each episodesBySeries as [seriesNumber, episodes]}
            <section class="series">
                <h2>
                    {data.lang === 'ga' ? `Sraith ${seriesNumber}` : `Series ${seriesNumber}`}
                </h2>
                <div class="episode-grid">
                    {#each episodes as ep}
                        <article class="episode">
                            <div class="episode-media">
                                <img
                                    class="episode-image"
                                    src={getImageUrl(ep)}
                                    alt={ep.custom_fields?.seriestitle ?? ep.seriesTitle}
                                    onerror={(e) => {
                                        e.currentTarget.src =
                                            'https://res.cloudinary.com/tg4/image/upload/w_700,h_395,g_faces,c_fill,f_auto,q_auto/000000.jpg';
                                    }}
                                />

                                <a href={`/${data.lang}/player/${data.slug}/${ep.episodeID}`}><svg
                                    class="play-icon"
                                    width="40"
                                    height="40"
                                    viewBox="0 0 40 40"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <rect width="40" height="40" fill="#EBEBEB"/>
                                    <path d="M30.6867 20.4249L25.9734 15.8788L11.0911 30.2412L15.8031 34.7886L30.6867 20.4249Z" fill="#2B2A2A"/>
                                    <path d="M25.9539 24.9922L30.6645 20.4435L15.7823 6.08105L11.0703 10.6285L25.9539 24.9922Z" fill="#2B2A2A"/>
                                </svg></a>
                            </div>
                           
                            <div class="episode-info">
                                <h3>{data.lang === 'ga' ? 'Eipeasóid' : 'Episode'} {ep.episodeNumber}</h3>
                                <p>S{ep.seriesNumber} E{ep.episodeNumber}</p>
                                <p>{ep.episodeDescription}</p>
                            </div>
                        </article>
                    {/each}
                </div>
            </section>
        {/each}
    </section>
</section>

<style>
.episode-page {
    max-width: var(--page-width);
    margin: 0 auto;
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

/* --------------------------------
   HERO
-------------------------------- */
.episode-hero {
    position: relative;
    width: 100%;
    height: 810px;
    overflow: hidden;
}

.hero-image {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

/* Dark gradient over image */
.hero-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: flex-end;
    padding: 70px;
    background:
        linear-gradient(
            to top,
            rgba(0,0,0,.85) 0%,
            rgba(0,0,0,.45) 35%,
            rgba(0,0,0,0) 70%
        );
    color: white;
}

.hero-content {
    max-width: 650px;
}

.hero-content h1 {
    margin: 0 0 15px;
    font-size: 3.5rem;
    line-height: 1.05;
}

.hero-content p {
    margin: 0 0 25px;
    font-size: 1.2rem;
    line-height: 1.5;
}

/* --------------------------------
   BUTTONS
-------------------------------- */
.hero-buttons {
    display: flex;
    gap: 12px;
}

.play-button, .back-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 12px 26px;
    text-decoration: none;
    font-weight: 700;
    transition: transform .2s ease, background .2s ease;
}

.play-button {
    background: white;
    color: #2b2a2a;
}

.back-button {
    background: var(--tg4-pink);
    color: white;
}

.play-button:hover, .back-button:hover {
    transform: translateY(-2px);
}

/* --------------------------------
   EPISODES
-------------------------------- */
.episodes {
    padding: 50px 0;
}

.episodes > h2 {
    margin: 0 0 25px;
}

.episode-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
}

.episode {
    min-width: 0;
}

.episode-image {
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
    display: block;
}

.episode-info {
    padding: 15px 0;
}

.episode-info h3 {
    margin: 0 0 8px;
    font-size: 1.1rem;
}

.episode-info p {
    margin: 0 0 8px;
}

.episode-media {
    position: relative;
}

.play-icon {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 40px;
    height: 40px;
    transition: transform .2s ease;
}

.episode:hover .play-icon {
    transform: scale(1.1);
}

/* --------------------------------
   MOBILE
-------------------------------- */
@media (max-width: 900px) {
    .episode-hero {
        height: 650px;
    }
    .hero-overlay {
        padding: 40px;
    }
    .hero-content h1 {
        font-size: 2.8rem;
    }
}

@media (max-width: 600px) {
    .episode-hero {
        height: 500px;
    }
    .hero-overlay {
        padding: 25px;
    }
    .hero-content h1 {
        font-size: 2.2rem;
    }
    .hero-content p {
        font-size: 1rem;
    }
    .episode {
        grid-template-columns: 1fr;
    }
}
</style>

<!-- <pre>
    {JSON.stringify(data.episodes, null, 2)}
</pre> -->