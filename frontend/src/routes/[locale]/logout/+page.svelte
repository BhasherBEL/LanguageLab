<script lang="ts">
	import { getBaseURL } from '$lib/utils/login';
	import { clearAuthTokens } from 'axios-jwt';
	import { onMount } from 'svelte';

	onMount(async () => {
		localStorage.clear();
		await clearAuthTokens();
		window.location.href = getBaseURL();
	});
</script>
