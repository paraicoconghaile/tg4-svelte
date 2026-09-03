<script lang="ts">
  	let { data } = $props();
    let isIrish = $derived(data.lang === 'ga');
    
    import { genres } from '$lib/config/playerNav';

  	function getImageUrl(ep: any) {
    	if (ep?.prodCode) {
      		return `https://res.cloudinary.com/tg4/image/upload/w_700,h_395,g_faces,c_fill,f_auto,q_auto:eco/${ep.prodCode}.jpg`;
    	}

    	if (ep?.seriesCode) {
      		return `https://res.cloudinary.com/tg4/image/upload/w_700,h_395,g_faces,c_fill,f_auto,q_auto:eco/${ep.seriesCode}.jpg`;
    	}

    	return (ep.poster || 'https://res.cloudinary.com/tg4/image/upload/w_700,h_395,g_faces,c_fill,f_auto,q_auto/000000.jpg');
  	}

  	//console.log(data);
</script>

<section class="episode-page">
    <nav>
        {#each genres as g}
            <a class="language-switch" href={`/${data.lang}/player/${g.key[data.lang]}`}>{g.label[data.lang]}</a>&nbsp;&nbsp;
        {/each}
    </nav>

    <h1>{data.seriesTitle}</h1>

    {#each data.episodes as ep}
        <article>
        	<h2>{ep.title}</h2>
        	<p><img src={getImageUrl(ep)} alt={ep.custom_fields?.seriestitle ?? ep.seriesTitle} onerror={(e) => {e.currentTarget.src = 'https://res.cloudinary.com/tg4/image/upload/w_700,h_395,g_faces,c_fill,f_auto,q_auto/000000.jpg';}}/></p>
        	<p>Series {ep.seriesNumber}, Episode {ep.episodeNumber}</p>
            <p>{ep.seriesDescription}</p>
            <p>{ep.episodeDescription}</p>
            <p><a class="language-switch" href={`/${data.lang}/player/${data.section}/${data.slug}/${ep.episodeID}`}>GO ({ep.episodeID}) ></a></p>
        </article>
    {/each}
</section>

<style>
.episode-page {
    max-width: var(--page-width);
    margin: 0 auto;
    padding: 40px 20px;
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

<!-- <pre>
	{JSON.stringify(data.episodes, null, 2)}
</pre> -->