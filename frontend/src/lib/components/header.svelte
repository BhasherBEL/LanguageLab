<script>
	import session from '$lib/stores/JWTSession';
	import { get } from 'svelte/store';
	import Logout from 'svelte-material-icons/Logout.svelte';
	import Login from 'svelte-material-icons/Login.svelte';
</script>

<header class="bg-secondary text-white flex align-middle justify-between px-4 py-2">
	<h1 class="font-bold text-2xl"><a href="/">LanguageLab</a></h1>
	<div class="flex align-middle">
		{#if session.isLoggedIn()}
			<span class="pr-2">Connecté en tant que <strong>{get(session.username)}</strong></span>
			<a href="/logout"><Logout class="h-4/5" /></a>
		{:else}
			<a
				href="/login?redirect={encodeURIComponent(
					window.location.pathname + window.location.search
				)}"><Login /></a
			>
		{/if}
	</div>
</header>
