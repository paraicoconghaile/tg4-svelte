<script lang="ts">
    import '../app.css';
    import Navbar from '$lib/components/navigation/NavBar.svelte';
    import GoogleAnalytics from '$lib/components/seo/GoogleAnalytics.svelte';

    let { children } = $props();
</script>

<GoogleAnalytics />

<Navbar />

{@render children()}