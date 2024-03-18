<script lang="ts">
	import session from '$lib/stores/JWTSession';
	import { get } from 'svelte/store';
	import Logout from 'svelte-material-icons/Logout.svelte';
	import Login from 'svelte-material-icons/Login.svelte';
	import LocalSelector from './header/localSelector.svelte';
	import { _ } from '$lib/services/i18n';
	import { Cog6Tooth, Icon } from 'svelte-hero-icons';
</script>

<header class="bg-secondary text-white flex align-middle justify-between px-4 py-2">
	<h1 class="font-bold text-2xl"><a href="/">{$_('header.appName')}</a></h1>
	<div class="flex align-middle">
		{#if session.user()?.type === 0}
			<a href="/admin" class="mr-4 mt-0.5">
				<Icon src={Cog6Tooth} class="size-6" />
			</a>
		{/if}
		{#if session.isLoggedIn()}
			<span class="pr-2">{$_('header.connectedAs')} <strong>{get(session.nickname)}</strong></span>
			<a href="/logout"><Logout class="h-4/5" /></a>
		{:else}
			<a
				href="/login?redirect={encodeURIComponent(
					window.location.pathname + window.location.search
				)}"><Login /></a
			>
		{/if}
		<LocalSelector />
	</div>
</header>
