<script lang="ts">
	import favicon from '$lib/assets/icons/favicon.svg';
    import '../app.css';
    import Navbar from '$lib/components/navigation/NavBar.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Navbar isIrish={false} />

{@render children()}