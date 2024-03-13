<script>
	import session from '$lib/stores/JWTSession';
	import { get } from 'svelte/store';
	import Logout from 'svelte-material-icons/Logout.svelte';
	import Login from 'svelte-material-icons/Login.svelte';
</script>

<header>
	<h1>LanguageLab</h1>
	<span>
		{#if session.isLoggedIn()}
			<span>Connecté en tant que <strong>{get(session.username)}</strong></span>
			<a href="/logout"><Logout /></a>
		{:else}
			<a
				href="/login?redirect={encodeURIComponent(
					window.location.pathname + window.location.search
				)}"><Login /></a
			>
		{/if}
	</span>
</header>

<style lang="less">
	header {
		background-color: #00214e;
		color: white;
		padding: 0.5em 1em;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	h1 {
		margin: 0;
		font-size: 1.5em;
	}

	a {
		color: inherit;
		text-decoration: none;
	}
</style>
