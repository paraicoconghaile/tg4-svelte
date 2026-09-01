export interface NavItem {
    titleEn: string;
    titleGa: string;
    hrefEn?: string;
    hrefGa?: string;
    children?: NavItem[];
}

export const navigation: NavItem[] = [
    {
        titleEn: 'Home',
        titleGa: 'Baile',
        hrefEn: '/en',
        hrefGa: '/ga'
    },
    {
        titleEn: 'Genres',
        titleGa: 'Seánraí',
        children: [
            {
                titleEn: 'Documentaries',
                titleGa: 'Faisnéis',
                hrefEn: '/en/player/top-documentaries',
                hrefGa: '/ga/player/faisneis'
            },
            {
                titleEn: 'Music',
                titleGa: 'Ceol',
                hrefEn: '/en/player/irish-music-series',
                hrefGa: '/ga/player/ceol'
            },
            {
                titleEn: 'Drama',
                titleGa: 'Dramaíocht',
                hrefEn: '/en/player/drama-tv-shows',
                hrefGa: '/ga/player/dramaiocht'
            },
            {
                titleEn: 'Current Affairs',
                titleGa: 'Cúrsaí Reatha',
                hrefEn: '/en/player/news-stories',
                hrefGa: '/ga/player/nuacht'
            },
            {
                titleEn: 'Entertainment',
                titleGa: 'Siamsaíocht',
                hrefEn: '/en/player/entertainment-shows',
                hrefGa: '/ga/player/siamsaiocht'
            },
            {
                titleEn: 'Sport',
                titleGa: 'Spórt',
                hrefEn: '/en/player/sport-tv-player',
                hrefGa: '/ga/player/sport'
            },
            {
                titleEn: 'Lifestyle',
                titleGa: 'Saolchláir',
                hrefEn: '/en/player/lifestyle-tv-shows',
                hrefGa: '/ga/player/saolchlar'
            },
            {
                titleEn: 'Cúla4',
                titleGa: 'Cúla4',
                hrefEn: '/en/player/childrens-tv-shows',
                hrefGa: '/ga/player/gasuir'
            }
        ]
    },
    {
        titleEn: 'Boxsets',
        titleGa: 'Boscaí',
        hrefEn: '/en/boxsets',
        hrefGa: '/ga/boxsets'
    },
    {
        titleEn: 'Schedule',
        titleGa: 'Sceideal',
        children: [
            {
                titleEn: 'Daily Schedule',
                titleGa: 'Sceideal an Lae',
                hrefEn: '/en/daily-schedule',
                hrefGa: '/ga/sceideal-an-lae'
            },
            {
                titleEn: 'Cúla4 Schedule',
                titleGa: 'Sceideal Cúla4',
                hrefEn: '/en/cula4-schedule',
                hrefGa: '/ga/sceideal-cula4'
            },
            {
                titleEn: 'Sport Schedule',
                titleGa: 'Sceideal Spóirt',
                hrefEn: '/en/sport-schedule',
                hrefGa: '/ga/sceideal-spoirt'
            },
            {
                titleEn: 'Live Sport',
                titleGa: 'Spórt Beo',
                hrefEn: '/en/live-sport',
                hrefGa: '/ga/sport-beo'
            }
        ]
    },
    {
        titleEn: 'Live',
        titleGa: 'Beo',
        children: [
            {
                titleEn: 'TG4 Live',
                titleGa: 'TG4 Beo',
                hrefEn: '/en/live',
                hrefGa: '/ga/live'
            },
            {
                titleEn: 'Cúla4 Live',
                titleGa: 'Cúla4 Beo',
                hrefEn: '/en/cula4-live',
                hrefGa: '/ga/cula4-live'
            }
        ]
    }
];