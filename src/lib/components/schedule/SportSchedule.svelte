<script lang="ts">
    import { page } from '$app/state';

    let { schedule } = $props();

    let isIrish = $derived(
        page.url.pathname.startsWith('/ga')
    );

    let openProgramme = $state<string | null>(null);

    const irishDays: Record<string, string> = {
        Sunday: 'Dé Domhnaigh',
        Monday: 'Dé Luain',
        Tuesday: 'Dé Máirt',
        Wednesday: 'Dé Céadaoin',
        Thursday: 'Déardaoin',
        Friday: 'Dé hAoine',
        Saturday: 'Dé Sathairn'
    };

    const irishMonths: Record<string, string> = {
        January: 'Eanáir',
        February: 'Feabhra',
        March: 'Márta',
        April: 'Aibreán',
        May: 'Bealtaine',
        June: 'Meitheamh',
        July: 'Iúil',
        August: 'Lúnasa',
        September: 'Meán Fómhair',
        October: 'Deireadh Fómhair',
        November: 'Samhain',
        December: 'Nollaig'
    };

    function getDisplayDate(item: any) {
        const date = new Date(item.odate);

        // Handle schedules where the broadcast time is 24:00 or later
        if (parseInt(item.time.substring(0, 2)) >= 24) {
            date.setDate(date.getDate() + 1);
        }

        return date;
    }

    function getDayName(date: Date) {
        const englishDay = date.toLocaleString('en-US', {
            weekday: 'long'
        });

        return isIrish
            ? irishDays[englishDay]
            : englishDay;
    }

    function getDateLabel(date: Date) {
        if (isIrish) {
            const month = date.toLocaleString('en-US', {
                month: 'long'
            });

            return `${date.getDate()} ${irishMonths[month]}`;
        }

        return date.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }

    // Group programmes by their schedule date
    let groupedSchedule = $derived.by(() => {
        const groups: Record<string, any[]> = {};

        for (const item of schedule ?? []) {
            const date = getDisplayDate(item);
            const key = date.toISOString().split('T')[0];

            if (!groups[key]) {
                groups[key] = [];
            }

            groups[key].push(item);
        }

        return Object.entries(groups);
    });

    function toggleProgramme(id: string) {
        openProgramme =
            openProgramme === id ? null : id;
    }
</script>

<section class="schedule-page">
    <section class="schedule">
        <h1>{isIrish ? 'Sceideal Spóirt' : 'Sport Schedule'}</h1>

        {#if groupedSchedule.length > 0}
            {#each groupedSchedule as [dateKey, events], dayIndex}
                {@const displayDate = getDisplayDate(events[0])}
                <section class="sport-day">
                    <p class="sport-day-heading">{getDayName(displayDate)}, {getDateLabel(displayDate)}</p>
                    <hr />

                    {#each events as item, eventIndex}
                        {@const imageCode = item.pcode || item.scode}
                        {@const eventId = `${dateKey}-${eventIndex}`}

                        <article class="sport-item">
                            <button
                                class="sport-item-header"
                                onclick={() => toggleProgramme(eventId)}
                                aria-expanded={openProgramme === eventId}
                            >

                                <span class="sport-time">{item.time}</span>

                                <span class="sport-title">
                                    {item.title}
                                    {#if item.subtitle}
                                        {' '}{item.subtitle}
                                    {/if}
                                </span>

                                <span class="toggle-button">{openProgramme === eventId ? '×' : '↓'}</span>
                            </button>

                            {#if openProgramme === eventId}
                                <div class="sport-details">
                                    {#if isIrish ? item.gaetext : item.engtext}
                                        <p class="description">{isIrish ? item.gaetext : item.engtext}</p>
                                    {/if}

                                    <div class="sport-image">
                                        <img
                                            src={`https://res.cloudinary.com/tg4/image/upload/w_262,h_147,g_faces,c_fill,f_auto,q_auto/${imageCode}.jpg`}
                                            alt={item.title}
                                            onerror={(event) => {
                                                event.currentTarget.src =
                                                    'https://d1og0s8nlbd0hm.cloudfront.net/images/TG4-Sport.png';
                                            }}
                                        />
                                    </div>

                                    {#if item.islive == 1}
                                        <span class="sport-live">LIVE</span>
                                    {/if}
                                </div>
                            {/if}
                        </article>
                    {/each}
                </section>
            {/each}
        {:else}
            <p>{isIrish ? 'Níl aon sceideal spóirt ar fáil.' : 'No sport schedule available.'}</p>
        {/if}
    </section>
</section>

<style>
.sport-day {
    margin-bottom: 45px;
}

.sport-day-heading {
    margin: 0 0 15px;
    font-size: 1.25rem;
    font-weight: 700;
}

.sport-item {
    padding: 0;
}

.sport-item-header {
    width: 100%;
    display: grid;
    grid-template-columns: 100px 1fr 40px;
    gap: 30px;
    align-items: center;
    padding: 20px 0;
    border: 0;
    background: transparent;
    color: inherit;
    text-align: left;
    font: inherit;
    cursor: pointer;
}

.sport-item-header:hover .toggle-button {
    color: var(--tg4-pink);
}

.sport-time {
    font-size: 1rem;
    font-weight: 500;
    line-height: 1.2;
    margin-bottom: 5px;
}

.sport-title {
    font-size: 1.125rem;
    font-weight: 700;
    line-height: 1.2;
}

.sport-details {
    padding: 0 70px 25px 130px;
}

.sport-details .description {
    margin: 0 0 20px;
    font-size: 16px;
    font-weight: 500;
    line-height: 1.5;
}

.sport-image {
    max-width: 500px;
}

.sport-image img {
    display: block;
    width: 100%;
    height: auto;
}

.sport-live {
    display: inline-block;
    margin-top: 15px;
    font-size: 0.8rem;
    font-weight: 700;
}

@media (max-width: 600px) {
    .sport-item-header {
        grid-template-columns: 65px 1fr 32px;
        gap: 15px;
    }

    .sport-time {
        font-size: 1rem;
    }

    .sport-title {
        font-size: 1rem;
    }

    .sport-details {
        padding: 0 0 20px 80px;
    }
}
</style>

<!-- <pre>
    {JSON.stringify(initialSchedule, null, 2)}
</pre> -->