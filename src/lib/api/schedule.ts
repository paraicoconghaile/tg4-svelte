export async function getSchedule() {
    const url =
        'https://g7bsckmzzc.execute-api.eu-west-1.amazonaws.com/prod/tg4-Schedule';

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Schedule API Error: ${response.status}`);
    }

    return response.json();
}