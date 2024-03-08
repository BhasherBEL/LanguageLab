<script>
	import session from '$lib/stores/session';
	import { get } from 'svelte/store';
	import Logout from 'svelte-material-icons/Logout.svelte';
</script>

<header>
	<h1>LanguageLab</h1>
	<span>
		{#if session.isLoggedIn}
			<span>Connecté en tant <strong>{get(session.username)}</strong></span>
			<a href="/logout">
				<Logout />
			</a>
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
