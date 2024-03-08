<script>
	import Header from '$lib/components/header.svelte';
	import { requireLogin } from '$lib/utils/login';
	import { onMount } from 'svelte';

	onMount(() => requireLogin());
</script>

<Header />

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
