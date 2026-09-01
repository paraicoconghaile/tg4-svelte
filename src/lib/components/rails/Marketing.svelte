<script lang="ts">
    let {
        rail,
        isIrish
    } = $props();

    const image = rail.image;

    const buttonText = isIrish
        ? rail.actionButtonTextGa
        : rail.actionButtonTextEn;

    const buttonUrl = rail.actionButtonUrl;

    const altText = isIrish
        ? rail.image?.altTextGa
        : rail.image?.altTextEn;
</script>

<section
    class="marketing-rail"
    style={`background:${rail.backgroundColor ?? '#2B2A2A'};`}
>
    {#if image}
        <div class="marketing-image">

            <img
                src={image.xLarge ?? image.large}
                alt={altText ?? ''}
            />

            {#if buttonText && buttonUrl}
                <div
                    class="marketing-action"
                    class:left={rail.actionButtonPosition === 'LEFT'}
                    class:center={rail.actionButtonPosition === 'CENTER'}
                    class:right={rail.actionButtonPosition === 'RIGHT'}
                >
                    <a
                        href={buttonUrl}
                        class="marketing-button"
                    >
                        {buttonText}
                    </a>
                </div>
            {/if}

        </div>
    {/if}
</section>

<style>
.marketing-rail {
    max-width: 1440px;
    margin: 20px auto;
    position: relative;
}

.marketing-image {
    position: relative;
    width: 100%;
}

.marketing-image img {
    display: block;
    width: 100%;
    aspect-ratio: 3.5556 / 1;
    object-fit: cover;
}

.marketing-action {
    position: absolute;
    bottom: 40px;
    display: flex;
}

.marketing-action.left {
    left: 40px;
}

.marketing-action.center {
    left: 50%;
    transform: translateX(-50%);
}

.marketing-action.right {
    right: 40px;
}

.marketing-button {
    display: inline-block;
    background: var(--tg4-pink);
    color: var(--tg4-white);
    padding: 12px 28px;
    text-decoration: none;
    font-weight: 700;
    font-size: 1rem;
    transition: background .2s ease;
}

.marketing-button:hover {
    background: #ff4b91;
}

@media (max-width: 600px) {
    .marketing-action {
        bottom: 20px;
    }

    .marketing-action.left {
        left: 20px;
    }

    .marketing-action.right {
        right: 20px;
    }

    .marketing-button {
        padding: 10px 20px;
    }
}
</style>