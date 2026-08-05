export const genres = [
    {
        key: { ga: 'faisneis', en: 'top-documentaries' },
        label: { ga: 'Fáisnéis', en: 'Documentaries' }
    },
    {
        key: { ga: 'ceol', en: 'irish-music-series' },
        label: { ga: 'Ceol', en: 'Music' }
    },
    {
        key: { ga: 'dramaiocht', en: 'drama-tv-shows' },
        label: { ga: 'Drámaíocht', en: 'Drama' }
    },
    {
        key: { ga: 'nuacht', en: 'news-stories' },
        label: { ga: 'Cúrsaí Reatha', en: 'Current Affairs' }
    },
    {
        key: { ga: 'siamsaiocht', en: 'entertainment-shows' },
        label: { ga: 'Siamsaíocht', en: 'Entertainment' }
    },
    {
        key: { ga: 'sport', en: 'sport-tv-player' },
        label: { ga: 'Spórt', en: 'Sport' }
    },
    {
        key: { ga: 'saolchlar', en: 'lifestyle-tv-shows' },
        label: { ga: 'Saolchláir', en: 'Lifestyle' }
    },
    {
        key: { ga: 'gasuir', en: 'childrens-tv-shows' },
        label: { ga: 'Cúla4', en: 'Cúla4' }
    }
];

export function getGenreByKey(section: string) {
    return genres.find(
        (g) => g.key.ga === section || g.key.en === section
    );
}