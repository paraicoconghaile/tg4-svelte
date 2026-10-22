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
        titleEn: 'Live',
        titleGa: 'Beo',
        children: [
            {
                titleEn: 'TG4',
                titleGa: 'TG4',
                hrefEn: '/en/player/live/TG4',
                hrefGa: '/ga/player/live/TG4'
            },
            {
                titleEn: 'Cúla4',
                titleGa: 'Cúla4',
                hrefEn: '/en/player/live/CULA4',
                hrefGa: '/ga/player/live/CULA4'
            },
            {
                titleEn: 'TG4+1',
                titleGa: 'TG4+1',
                hrefEn: '/en/player/live/TG4PLUSONE',
                hrefGa: '/ga/player/live/TG4PLUSONE'
            }
        ]
    },
    {
        titleEn: 'Discover',
        titleGa: 'Aimsigh',
        hrefEn: '/en/player/discover',
        hrefGa: '/ga/player/aimsigh',
        children: [
            {
                titleEn: 'Documentaries',
                titleGa: 'Faisnéis',
                hrefEn: '/en/player/documentaries',
                hrefGa: '/ga/player/faisneis'
            },
            {
                titleEn: 'Music',
                titleGa: 'Ceol',
                hrefEn: '/en/player/music',
                hrefGa: '/ga/player/ceol'
            },
            {
                titleEn: 'Drama',
                titleGa: 'Dramaíocht',
                hrefEn: '/en/player/drama',
                hrefGa: '/ga/player/dramaiocht'
            },
            {
                titleEn: 'Current Affairs',
                titleGa: 'Cúrsaí Reatha',
                hrefEn: '/en/player/current-affairs',
                hrefGa: '/ga/player/cursai-reatha'
            },
            {
                titleEn: 'Entertainment',
                titleGa: 'Siamsaíocht',
                hrefEn: '/en/player/entertainment',
                hrefGa: '/ga/player/siamsaiocht'
            },
            {
                titleEn: 'Sport',
                titleGa: 'Spórt',
                hrefEn: '/en/player/sport',
                hrefGa: '/ga/player/sport'
            },
            {
                titleEn: 'Lifestyle',
                titleGa: 'Saolchláir',
                hrefEn: '/en/player/lifestyle',
                hrefGa: '/ga/player/saolchlar'
            },
            {
                titleEn: 'Cúla4',
                titleGa: 'Cúla4',
                hrefEn: '/en/player/cula4',
                hrefGa: '/ga/player/cula4'
            }
        ]
    },
    /* {
        titleEn: 'Boxsets',
        titleGa: 'Boscaí',
        hrefEn: '/en/boxsets',
        hrefGa: '/ga/boxsets'
    }, */
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
            /* {
                titleEn: 'Live Sport',
                titleGa: 'Spórt Beo',
                hrefEn: '/en/live-sport',
                hrefGa: '/ga/sport-beo'
            } */
        ]
    },
    {
        titleEn: 'Search',
        titleGa: 'Cuardaigh',
        hrefEn: '/en/search',
        hrefGa: '/ga/search'
    }
];