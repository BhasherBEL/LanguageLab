<script lang="ts">
	import session from '$lib/stores/JWTSession';
	import { get } from 'svelte/store';
	import Logout from 'svelte-material-icons/Logout.svelte';
	import Login from 'svelte-material-icons/Login.svelte';
	import LocalSelector from './header/localSelector.svelte';
	import { _ } from '$lib/services/i18n';
	import { Cog6Tooth, ExclamationTriangle, Icon } from 'svelte-hero-icons';
	import { onMount } from 'svelte';
	import { getUserMetadataAPI } from '$lib/api/users';

	$: displayMetadataWarning = false;

	onMount(async () => {
		if (session.isLoggedIn()) {
			const user_id = session.user()?.id;

			if (!user_id) return;

			const res = await getUserMetadataAPI(user_id);

			if (!res) {
				displayMetadataWarning = true;
			}
		}
	});
</script>

<header class="bg-secondary text-white flex align-middle justify-between px-4 py-2">
	<h1 class="font-bold text-2xl"><a href="/">{$_('header.appName')}</a></h1>
	<div class="flex align-middle">
		{#if session.user()?.type === 0}
			<a href="/admin/" class="mr-4 mt-0.5">
				<Icon src={Cog6Tooth} class="size-6" />
			</a>
		{/if}
		{#if session.isLoggedIn()}
			<span class="pr-2">{$_('header.connectedAs')} <strong>{get(session.nickname)}</strong></span>
			<a href="/logout/"><Logout class="h-4/5" /></a>
		{:else}
			<a
				href="/login/?redirect={encodeURIComponent(
					window.location.pathname + window.location.search
				)}"><Login /></a
			>
		{/if}
		<LocalSelector class="ml-2" />
	</div>
</header>

{#if displayMetadataWarning}
	<a href="/first-login" class="bg-orange-500 block text-white text-center p-4 flex justify-center">
		<Icon src={ExclamationTriangle} size="24" />
		&nbsp;
		{$_('header.metadataWarning')}
		&nbsp;
		<Icon src={ExclamationTriangle} size="24" />
	</a>
{/if}
