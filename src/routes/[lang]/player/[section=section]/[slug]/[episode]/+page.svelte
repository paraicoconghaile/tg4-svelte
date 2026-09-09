<script lang="ts">
    let { data } = $props();
    let isIrish = $derived(data.lang === 'ga');
    
    import { genres } from '$lib/config/playerNav';

    function getImageUrl(data: any) {
        if (data.video?.prodCode) {
            return `https://res.cloudinary.com/tg4/image/upload/w_700,h_395,g_faces,c_fill,f_auto,q_auto:eco/${data.video.prodCode}.jpg`;
        }

        if (data.video?.seriesCode) {
            return `https://res.cloudinary.com/tg4/image/upload/w_700,h_395,g_faces,c_fill,f_auto,q_auto:eco/${data.video.seriesCode}.jpg`;
        }

        return (video.poster || 'https://res.cloudinary.com/tg4/image/upload/w_700,h_395,g_faces,c_fill,f_auto,q_auto/000000.jpg');
    }

    //console.log("Data", JSON.stringify(data, null, 2));
</script>

<section class="episode-page">
    <nav>
        {#each genres as g}
            <a class="language-switch" href={`/${data.lang}/player/${g.key[data.lang]}`}>{g.label[data.lang]}</a>&nbsp;&nbsp;
        {/each}
    </nav>
    
    <h1>{data.video.seriesTitle}</h1>

    <p>
        {data.video.description}
    </p>

    <p><img src={getImageUrl(data)} alt={data.video.seriesTitle ?? data.video.seriesTitle} onerror={(e) => {e.currentTarget.src = 'https://res.cloudinary.com/tg4/image/upload/w_700,h_395,g_faces,c_fill,f_auto,q_auto/000000.jpg';}}/></p>

    <p><a class="language-switch" href={`/${data.lang}/player/${data.backRoute}/${data.slug}`}>{data.backLabel}</a></p>
</section>

<style>
.episode-page {
    max-width: var(--page-width);
    margin: 0 auto;
    background-color: #403f3f;
    padding: 20px;
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


.episodes {
    margin: 0 auto;
    max-width: var(--episode-width);
}
</style>

<!-- <pre>
    {JSON.stringify(data.video, null, 2)}
</pre> -->