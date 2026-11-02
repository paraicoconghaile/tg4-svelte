<script lang="ts">
    import '../app.css';
    import Navbar from '$lib/components/navigation/NavBar.svelte';

    let { children } = $props();
</script>

<Navbar />

{@render children()}