<script lang="ts">
    let { data } = $props();

    let isIrish = $derived(data.lang === 'ga');
    const schedule = data.schedule;

    console.log('Schedule data:', schedule);
</script>

<section class="schedule">
    <h1>{isIrish ? 'Sceideal an Lae' : 'Daily Schedule'}</h1>

    {#each schedule as programme}
        <article class="schedule-row">

            <div class="schedule-time">
                {programme.time}
            </div>

            <div class="schedule-content">
                <h2>
                    {programme.title}
                </h2>

                {#if programme.engtext || programme.gaetext}
                    <p class="description">
                        {isIrish ? programme.gaetext : programme.engtext}
                    </p>
                {/if}

                {#if programme.subtitle}
                    <p class="subtitle">
                        {programme.subtitle}
                    </p>
                {/if}

            </div>

        </article>

        <hr />
    {/each}
</section>

<style>
    .schedule {
        max-width: 1340px;
        margin: 40px auto;
    }

    .schedule h1 {
        margin-bottom: 30px;
    }

    .schedule-row {
        display: grid;
        grid-template-columns: 100px 1fr;
        gap: 30px;
        padding: 20px 0;
    }

    .schedule-time {
        font-size: 1.2rem;
        font-weight: 700;
    }

    .schedule-content h2 {
        margin: 0 0 8px;
        font-size: 1.4rem;
    }

    .description {
        margin: 0 0 8px;
        font-size: 1rem;
    }

    .subtitle {
        margin: 0;
        font-size: .9rem;
        opacity: .7;
    }

    hr {
        border: 0;
        border-top: 1px solid #ccc;
        margin: 0;
    }

    @media (max-width: 600px) {
        .schedule-row {
            grid-template-columns: 70px 1fr;
            gap: 15px;
        }

        .schedule-time {
            font-size: 1rem;
        }

        .schedule-content h2 {
            font-size: 1.15rem;
        }
    }
</style>

<!-- <pre>
    {JSON.stringify(data.schedule, null, 2)}
</pre> -->