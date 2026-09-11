<script lang="ts">
    let {
        schedule: initialSchedule,
        channel = ''
    } = $props();

    import { page } from '$app/state';

    let isIrish = $derived(page.url.pathname.startsWith('/ga'));
    let locale = $derived(isIrish ? 'ga-IE' : 'en-IE');

    const weekdaysEn = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
    ];

    const weekdaysGa = [
        'Dé Domhnaigh',
        'Dé Luain',
        'Dé Máirt',
        'Dé Céadaoin',
        'Déardaoin',
        'Dé hAoine',
        'Dé Sathairn'
    ];

    /* $effect(() => {
        console.log(
            'SCHEDULE:',
            page.url.pathname,
            'lang:',
            data.lang,
            'isIrish:',
            isIrish,
            'locale:',
            locale
        );
    }); */

    let schedule = $state(initialSchedule);

    let openProgramme = $state<number | null>(null);
    let datesContainer: HTMLDivElement;

    const dates = Array.from({ length: 10 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i);
        return date;
    });

    let selectedDate = $state(dates[0]);

    function toggleProgramme(index: number) {
        openProgramme = openProgramme === index ? null : index;
    }

    async function selectDate(date: Date) {
        selectedDate = date;
        openProgramme = null;

        const apiDate = formatDateForApi(date);

        console.log('Loading schedule for:', apiDate, 'channel:', channel);

        try {
            const channelParam = channel
                ? `&channel=${encodeURIComponent(channel)}`
                : '';

            const response = await fetch(
                `/api/schedule?date=${apiDate}${channelParam}`
            );

            if (!response.ok) {
                throw new Error(`Failed to load schedule: ${response.status}`);
            }

            schedule = await response.json();

            console.log('Schedule loaded:', schedule);
        } catch (error) {
            console.error('Schedule loading error:', error);
        }
    }

    function formatDateForApi(date: Date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    function scrollDates(direction: number) {
        datesContainer?.scrollBy({
            left: direction * 200,
            behavior: 'smooth'
        });
    }

    //console.log('Schedule data:', schedule);
</script>

<section class="schedule-page">
    <section class="schedule">
        <h1>
            {#if channel === 'C4'}
                {isIrish ? 'Sceideal Cúla4' : 'Cúla4 Schedule'}
            {:else}
                {isIrish ? 'Sceideal an Lae' : 'Daily Schedule'}
            {/if}
        </h1>

        <div class="date-slider">
            <button
                class="date-arrow"
                aria-label={isIrish ? 'Dátaí roimhe seo' : 'Previous dates'}
                onclick={() => scrollDates(-1)}
            >
                ‹
            </button>

            <div class="dates" bind:this={datesContainer}>
                {#each dates as date, index}
                    <button
                        class:active={date.toDateString() === selectedDate.toDateString()}
                        class="date"
                        onclick={() => selectDate(date)}
                    >
                        <span class="date-day">
                            {#if index === 0}
                                {isIrish ? 'INNIU' : 'TODAY'}
                            {:else}
                                {isIrish
                                    ? weekdaysGa[date.getDay()]
                                    : weekdaysEn[date.getDay()]
                                }
                            {/if}
                        </span>

                        <span class="date-number">
                            {date.toLocaleDateString(locale, {
                                day: '2-digit',
                                month: '2-digit'
                            })}
                        </span>
                    </button>
                {/each}
            </div>

            <button
                class="date-arrow"
                aria-label={isIrish ? 'Na chéad dátaí eile' : 'Next dates'}
                onclick={() => scrollDates(1)}
            >
                ›
            </button>
        </div>

        {#each schedule as programme, index}
            <article class="schedule-row">

                <div class="schedule-time">
                    {programme.time}
                </div>

                <div class="schedule-main">

                    <div class="schedule-title-row">
                        <div class="schedule-title">
                            <h2>{programme.title}</h2>

                            {#if programme.subtitle}
                                <p class="subtitle">
                                    {programme.subtitle}
                                </p>
                            {/if}
                        </div>

                        <div class="schedule-toggle">
                            <button
                                class="toggle-button"
                                onclick={() => toggleProgramme(index)}
                                aria-label={
                                    openProgramme === index
                                        ? 'Close programme details'
                                        : 'Show programme details'
                                }
                            >
                                {openProgramme === index ? '×' : '↓'}
                            </button>
                        </div>
                    </div>

                    {#if openProgramme === index}
                        <div class="programme-details">
                            <p class="description">
                                {isIrish ? programme.gaetext : programme.engtext}
                            </p>
                        </div>
                    {/if}

                </div>

            </article>
            <hr />
        {/each}
    </section>
</section>

<!-- <pre>
    {JSON.stringify(initialSchedule, null, 2)}
</pre> -->