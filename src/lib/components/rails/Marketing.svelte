<script lang="ts">
    import { withBase } from '$lib/utils/paths';
    
    let {
        rail,
        isIrish
    } = $props();

    const image = $derived(rail.image);
    const buttonText = $derived(isIrish ? rail.actionButtonTextGa : rail.actionButtonTextEn);
    const buttonUrl = $derived(
    rail.actionButtonUrl ??
    (rail.items?.[0]?.series?.slug
        ? withBase(`/${isIrish ? 'ga' : 'en'}/player/${rail.items[0].series.slug}`)
        : rail.items?.[0]?.video?.vid
            ? withBase(`/${isIrish ? 'ga' : 'en'}/player/${rail.items[0].video.vid}`)
            : null));
    const altText = $derived(isIrish ? rail.image?.altTextGa : rail.image?.altTextEn);

    /* console.log('========== MARKETING RAIL JSON ==========');
    console.log("Marketing Rail Data:", JSON.stringify(rail, null, 2));
    console.log('================================'); */
</script>

<section class="marketing-rail">
    {#if image}
        <div class="marketing-image">
            <!-- <img src={image.xLarge ?? image.large} alt={altText ?? ''} /> -->

            <picture>
                {#if rail.phoneImage}
                    <source media="(max-width: 599px)" srcset={rail.phoneImage.xLarge ?? rail.phoneImage.large} />
                {/if}

                <img src={image.xLarge ?? image.large} alt={altText ?? ''} />
            </picture>

            <div class="overlay">
                <div class="marketing-text">
                    <h2>{isIrish ? rail.titleGa : rail.titleEn}</h2>
                    <p>{isIrish ? rail.subtitleGa : rail.subtitleEn}</p>
                </div>

                {#if buttonText}
                    <div class="marketing-action"
        class:position-left={rail.actionButtonPosition === 'LEFT'}
        class:position-center={rail.actionButtonPosition === 'CENTER'}
        class:position-right={rail.actionButtonPosition === 'RIGHT'}>
                        <a href={buttonUrl} class="marketing-button">{buttonText}</a>
                    </div>
                {/if}
            </div>
        </div>
    {/if}
</section>

<style>
.marketing-rail {
    max-width: var(--page-width);
    margin: 0 auto;
    position: relative;
    padding: 30px 0 20px 0;
    background: var(--tg4-grey-2);
}

.marketing-image {
    position: relative;
    width: 100%;
}

.marketing-image img {
    display: block;
    width: 100%;
    object-fit: cover;
}

.overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 70px;
    color: white;
    z-index: 2;
}

.marketing-text {
    text-align: left;
    max-width: 500px;
}

.marketing-text h2 {
    margin: 0 0 10px;
}

.marketing-text p {
    margin: 0;
}

.marketing-action {
    display: flex;
    align-items: center;
    width: 100%;
}

.marketing-action.position-left {
    justify-content: flex-start;
}

.marketing-action.position-center {
    justify-content: center;
}

.marketing-action.position-right {
    justify-content: flex-end;
}

.marketing-button {
    display: inline-block;
    background: var(--tg4-pink);
    color: white;
    padding: 12px 28px;
    text-decoration: none;
    font-weight: 700;
    font-size: 1rem;
    transition: background .2s ease;
    cursor: pointer;
}

.marketing-button:hover {
    background: rgba(0,0,0,.85);
}

@media (max-width: 600px) {
    .overlay {
        padding: 0 20px;
    }
    .marketing-action {
        /* no longer positioned from bottom */
    }
    .marketing-button {
        padding: 10px 20px;
    }
}

@media (max-width: 450px) {
    .marketing-text h2 {
        margin: 0;
    }
    .marketing-button {
        padding: 4px 10px;
    }
}

@media (max-width: 330px) {
    .marketing-text h2 {
        font-size: 1.5rem;
    }

    .marketing-text p {
        font-size: 0.8rem;
    }
    .marketing-button {
        font-size: 0.8rem;
    }
}
</style>