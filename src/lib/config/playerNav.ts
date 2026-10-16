export const genres = [
    {
        key: { ga: 'faisneis', en: 'documentaries' },
        label: { ga: 'Fáisnéis', en: 'Documentaries' }
    },
    {
        key: { ga: 'ceol', en: 'music' },
        label: { ga: 'Ceol', en: 'Music' }
    },
    {
        key: { ga: 'dramaiocht', en: 'drama' },
        label: { ga: 'Drámaíocht', en: 'Drama' }
    },
    {
        key: { ga: 'cursai-reatha', en: 'current-affairs' },
        label: { ga: 'Cúrsaí Reatha', en: 'Current Affairs' }
    },
    {
        key: { ga: 'siamsaiocht', en: 'entertainment' },
        label: { ga: 'Siamsaíocht', en: 'Entertainment' }
    },
    {
        key: { ga: 'sport', en: 'sport' },
        label: { ga: 'Spórt', en: 'Sport' }
    },
    {
        key: { ga: 'saolchlar', en: 'lifestyle' },
        label: { ga: 'Saolchláir', en: 'Lifestyle' }
    },
    {
        key: { ga: 'cula4', en: 'cula4' },
        label: { ga: 'Cúla4', en: 'Cúla4' }
    }
];

export function getGenreByKey(section: string) {
    return genres.find(
        (g) => g.key.ga === section || g.key.en === section
    );
}