const API_URL = 'https://g7bsckmzzc.execute-api.eu-west-1.amazonaws.com/prod/tg4-Schedule';

export async function getSchedule(date: string, channel?: string) {
    let url = `${API_URL}?date=${date}`;

    if (channel) {
        url += `&channel=${encodeURIComponent(channel)}`;
    }

    //console.log('SCHEDULE API URL:', url);
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Schedule API error: ${response.status}`);
    }

    return await response.json();
}

export async function getSportSchedule() {
    const url = `${API_URL}?playercat=${encodeURIComponent('Spórt')}`;
    //console.log('SPORT SCHEDULE API URL:', url);
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(
            `Sport Schedule API error: ${response.status}`
        );
    }

    return await response.json();
}