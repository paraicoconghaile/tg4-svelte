<script lang="ts">
  	let { data } = $props();
    let isIrish = $derived(data.lang === 'ga');
    
    import { genres } from '$lib/config/playerNav';

    function getImageUrl(item: any) {
        if (item.programme.custom_fields?.p_prodcode) {
            return `https://res.cloudinary.com/tg4/image/upload/w_700,h_395,g_faces,c_fill,f_auto,q_auto:eco/${item.programme.custom_fields.p_prodcode}.jpg`;
        }

        if (item.programme.custom_fields?.s_prodcode) {
            return `https://res.cloudinary.com/tg4/image/upload/w_700,h_395,g_faces,c_fill,f_auto,q_auto:eco/${item.programme.custom_fields.s_prodcode}.jpg`;
        }

        return (item.programme.poster || 'https://res.cloudinary.com/tg4/image/upload/w_700,h_395,g_faces,c_fill,f_auto,q_auto/000000.jpg');
    }

  	//console.log(data);
</script>

<section class="series-page">
    <section class="episodes">
        <h1>{data.lang === 'ga' ? data.labelGa : data.labelEn}</h1>

        <div class="series-grid">
            {#each data.series as item}
                <a class="series-card" href={`/${data.lang}/player/${item.slug}`}>
                    <img src={getImageUrl(item)} alt={item.title} onerror={(e) => {e.currentTarget.src = 'https://res.cloudinary.com/tg4/image/upload/w_700,h_395,g_faces,c_fill,f_auto,q_auto/000000.jpg';}}/>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                </a>
            {/each}
        </div>
    </section>
</section>

<style>
.series-page {
    max-width: var(--page-width);
    margin: 0 auto;
    padding: 20px;
    background-color: #403f3f;
}

.episodes {
    margin: 0 auto;
    max-width: var(--episode-width);
}

.series-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
}

.series-card {
    text-decoration: none;
    color: var(--text-primary);
}

.series-card img {
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
    display: block;
}

.series-card h3 {
    margin-top: 12px;
    font-size: 1.1rem;
}

@media(max-width:1000px){
    .series-grid {grid-template-columns: repeat(3,1fr);}
}

@media(max-width:700px){
    .series-grid {grid-template-columns: repeat(2,1fr);}
}

@media(max-width:450px){
    .series-grid {grid-template-columns: 1fr;}
}

/* .language-switch {
    background: var(--tg4-pink);
    color: var(--tg4-white);
    padding: 4px 18px;
    font-weight: 700;
    transition: background .2s ease;
}

.language-switch:hover {
    background: #ff4b91;
} */
</style>

<!-- <pre>
	{JSON.stringify(data, null, 2)}
</pre> -->