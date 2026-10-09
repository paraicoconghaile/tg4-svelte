export function isProfileComplete(profile: any): boolean {
    const firstName = profile?.profile?.firstName;
    const lastName = profile?.profile?.lastName;
    const preferences = profile?.preferences;

    return (
        typeof firstName === 'string' &&
        !!firstName.trim() &&
        typeof lastName === 'string' &&
        !!lastName.trim() &&
        preferences?.age === true &&
        !!preferences?.gender &&
        !!preferences?.nationality &&
        !!preferences?.residence &&
        !!preferences?.irish
    );
}