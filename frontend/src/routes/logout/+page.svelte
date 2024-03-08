<script lang="ts">
	import { clearAuthTokens } from 'axios-jwt';
	import { onMount } from 'svelte';

	onMount(async () => {
		localStorage.clear();
		await clearAuthTokens();
		window.location.href = '/';
	});
</script>
