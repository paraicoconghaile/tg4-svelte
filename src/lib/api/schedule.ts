export async function getSchedule(date: string, channel?: string) {
    let url = `https://g7bsckmzzc.execute-api.eu-west-1.amazonaws.com/prod/tg4-Schedule?date=${date}`;

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