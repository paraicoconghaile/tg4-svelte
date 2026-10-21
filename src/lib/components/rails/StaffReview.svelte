<script lang="ts">
    import { withBase } from '$lib/utils/paths';

    let { rail, isIrish } = $props();

    const series = $derived(rail.items?.[0]?.series);
    const review = $derived(rail.staffReview);

    const image = $derived(
        rail?.image?.xLarge ?? series?.boxsetImage?.large ?? series?.poster
    );

    const href = $derived(
        withBase(`/${isIrish ? 'ga' : 'en'}/player/${series?.slug ?? ''}`)
    );
</script>

{#if series && review}
    <section class="staff-review" style={`--rail-bg: ${rail.backgroundColor}; --rail-text: ${rail.textColor};`}>
        <div class="intro" style={`background:${rail.backgroundColor}; color:${rail.textColor};`}>
            <div class="rating" role="img" aria-label={`${review.rating} out of 5 stars`}>
                {#if review.showStaffPickIcon}
                    <img
                        class="reviewer-image"
                        src={review.authorImageUrl}
                        alt=""
                    />
                {/if}
                {#each Array.from({ length: 5 }, (_, i) => i + 1) as star}
                    <span class:filled={star <= review.rating}>★</span>
                {/each}
            </div>

            <h2>{isIrish ? review.titleGa : review.titleEn}</h2>

            <p class="review-text">{isIrish ? review.reviewGa : review.reviewEn}</p>

            <!-- <h3>{series.name}</h3>
            <p class="series-description">
                {isIrish ? series.taglineGa ?? series.descGa : series.taglineEn ?? series.descEn}
            </p> -->

            <div class="staff-pick">
                <p>{isIrish ? `ROGHA AN RÉALTA` : `STAR PICK`}<br /><svg width="48" height="18" viewBox="0 0 48 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M48.0003 0H30.3633V17.5712H48.0003V0Z" fill="#FF126C"/>
<path d="M45.0792 11.8532H43.0308V14.9627L40.3573 15.7936V11.8532H33.2992C33.2498 11.483 33.2334 11.0799 33.2334 10.7591C33.2334 5.70821 37.075 2.22852 41.8298 2.22852C42.1506 2.22852 42.6524 2.22852 43.0391 2.29433V9.5334H45.0874V11.8532H45.0792ZM35.981 9.5334H40.3491V4.85268C38.0869 5.28044 36.2689 7.1478 35.981 9.5334Z" fill="#EBEBEB"/>
<path d="M29.0961 0H0V17.5712H29.0961V0Z" fill="#FF126C"/>
<path d="M9.47572 4.73972V15.4091H6.8022V4.73972H2.54102V2.41992H14.1318L12.9883 4.73972H9.47572Z" fill="#EBEBEB"/>
<path d="M26.5459 8.85062C26.5459 12.7992 23.5762 15.4069 20.0554 15.4069C16.2384 15.4069 13.4004 12.6018 13.4004 8.78481C13.4004 4.83623 16.3701 2.22852 19.932 2.22852C22.3505 2.22852 24.769 3.50358 26.0441 6.1771H22.696C22.186 5.43674 21.24 4.77042 19.9238 4.77042C17.7438 4.77042 16.1973 6.48147 16.1973 8.8424C16.1973 11.1786 17.8179 12.865 20.0965 12.865C21.8981 12.865 23.1402 11.8285 23.6091 10.3149H19.5536L20.6559 8.08559H26.5459V8.85062Z" fill="#EBEBEB"/>
</svg></p>
            </div>
        </div>

        <a class="content-card" href={href}>
            <img
                src={image}
                alt={isIrish
                    ? series.mainImage?.altTextGa ?? series.name
                    : series.mainImage?.altTextEn ?? series.name}
            />

            <div class="play-box">
                <svg
                    viewBox="18 0 38 56"
                    width="20"
                    height="28"
                    aria-hidden="true"
                >
                    <path
                        d="M55.9383 27.9696L46.9742 19.3235L35.2362 30.6515L18.6702 46.6389L27.6318 55.2875L55.9383 27.9696Z"
                        fill="#2B2A2A"
                    />
                    <path
                        d="M46.9354 36.6571L55.8945 28.0061L44.1565 16.6781L27.5905 0.690705L18.6289 9.33929L46.9354 36.6571Z"
                        fill="#2B2A2A"
                    />
                </svg>
            </div>
        </a>
    </section>
{/if}

<style>
.staff-review {
    max-width: var(--page-width);
    min-height: 400px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 5px;
}

.intro {
    background: var(--rail-bg);
    color: var(--rail-text);
    padding: 30px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%
}

.intro h2 {
    margin: 0 0 16px;
    font-weight: 400;
}

.intro h3 {
    margin: 20px 0 8px;
    font-size: 1.5rem;
}

.intro p {
    margin: 0;
    font-size: 1.25rem;
    line-height: 1.25;
}

.staff-pick {
    align-self: flex-start;
    margin-bottom: 16px;
    font-size: 0.9rem;
    font-weight: 700;
}

.series-description {
    opacity: 0.85;
}

.content-card {
    position: relative;
    display: block;
    min-width: 0;
    overflow: hidden;
    background: white;
    color: inherit;
    text-decoration: none;
}

.content-card img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.content-card:hover .play-box {
    transform: scale(1.1);
    background: var(--tg4-pink);
}

.reviewer-image {
    width: 64px;
    height: 64px;
    object-fit: cover;
    border-radius: 50%;
    margin-bottom: 16px;
    margin-right: 16px;
}

.rating {
    display: flex;
    gap: 4px;
    margin-bottom: 16px;
    font-size: 2rem;
}

.rating span {
    color: #bdbdbd;
}

.rating span.filled {
    color: #f5a623;
}

.staff-pick {
    margin-top: auto;
    padding-top: 24px;
}

.staff-pick p {
    margin: 0 0 8px;
    font-size: 1.25rem;
    font-weight: 700;
}

@media (max-width: 900px) {
    .staff-review {
        min-height: 344px;
    }

    .intro {
        padding: 20px;
    }
}

@media (max-width: 600px) {
    .play-box {
        width: 34px;
        height: 34px;
    }
}

@media (max-width: 500px) {
    .staff-review {
        grid-template-columns: 1fr;
        min-height: auto;
    }

    .intro {
        grid-row: 1;
    }

    .content-card {
        grid-row: 2;
        min-height: 250px;
    }
}
</style>
