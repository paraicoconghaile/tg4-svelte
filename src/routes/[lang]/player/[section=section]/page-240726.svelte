<script lang="ts">
  	let { data } = $props();
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

<!-- <p><a href={`/ga/player/${data.routeGa}`}>GA</a>
<a href={`/en/player/${data.routeEn}`}>EN</a></p>

<nav>
    {#each genres as g}
    	[<a href={`/${data.lang}/player/${g.key[data.lang]}`}>{g.label[data.lang]}</a>]&nbsp;&nbsp;
	{/each}
</nav>

<h1>{data.genre}</h1> -->

{#each data.series as item}
  	<article>
    	<h2>{item.title}</h2>

        <p>{item.programme.custom_fields.s_prodcode}, {item.programme.custom_fields.p_prodcode}</p>

        <p><img src={getImageUrl(item)} alt={item.programme.custom_fields?.seriestitle ?? item.programme.custom_fields.title} onerror={(e) => {e.currentTarget.src = 'https://res.cloudinary.com/tg4/image/upload/w_700,h_395,g_faces,c_fill,f_auto,q_auto/000000.jpg';}}/></p>

        <p>{item.description}</p>

    	<a href={`/${data.lang}/player/${data.lang === 'ga' ? data.routeGa : data.routeEn}/${item.slug}`}>View Episodes</a>
  	</article>
{/each}

<!-- <pre>
	{JSON.stringify(data.series, null, 2)}
</pre> -->