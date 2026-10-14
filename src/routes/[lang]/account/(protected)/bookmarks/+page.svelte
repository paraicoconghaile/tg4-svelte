<script lang="ts">
    import { getContext, onMount } from 'svelte';

    const account = getContext<{
        pu: any;
        profile: any;
    }>('tg4-account');

    let loading = $state(true);
    let error = $state('');
    let bookmarks = $state<any[]>([]);

    onMount(async () => {
        try {
            const profile = account.profile;

            if (!profile) {
                error = 'Unable to load your account.';
                return;
            }

            if (!profile.profile?.verified) {
                error = 'Your account must be verified to view bookmarks.';
                return;
            }

            const result = await account.pu.getPlaylists('watch_later');
            console.log('Bookmark playlist result:', result);
            console.log('Individual bookmarks:', result?.bookmarks);

            bookmarks = result?.bookmarks ?? [];
        } catch (err) {
            console.error('Unable to load bookmarks:', err);
            error = 'Unable to load your bookmarks. Please try again.';
        } finally {
            loading = false;
        }
    });
</script>