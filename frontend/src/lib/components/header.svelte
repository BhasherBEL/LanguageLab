<script lang="ts">
	import Logout from 'svelte-material-icons/Logout.svelte';
	import Login from 'svelte-material-icons/Login.svelte';
	import LocalSelector from './header/localSelector.svelte';
	import { t } from '$lib/services/i18n';
	import { Clock, Cog6Tooth, ExclamationTriangle, Icon } from 'svelte-hero-icons';
	import { onMount } from 'svelte';
	import { getUserMetadataAPI } from '$lib/api/users';
	import type User from '$lib/types/user';

	export let data: any;

	const user: User | null = data?.user;

	$: displayMetadataWarning = false;

	onMount(async () => {
		if (user) {
			const res = await getUserMetadataAPI(user.id);

			if (!res) {
				displayMetadataWarning = true;
			}
		}
	});
</script>

<header class="bg-secondary text-white flex align-middle justify-between px-4 py-2">
	<h1 class="font-bold text-2xl"><a href="/">{$t('header.appName')}</a></h1>
	<div class="flex align-middle">
		{#if user?.type === 0}
			<a href="/admin/" class="mr-4 mt-0.5">
				<Icon src={Cog6Tooth} class="size-6" />
			</a>
		{/if}
		{#if user?.type === 0 || user?.type === 1}
			<a href="/timeslots/set/" class="mr-4 mt-0.5">
				<Icon src={Clock} class="size-6" />
			</a>
		{/if}
		{#if user?.type === 2}
			<a href="/timeslots/" class="mr-4 mt-0.5">
				<Icon src={Clock} class="size-6" />
			</a>
		{/if}
		{#if user}
			<span class="pr-2">{$t('header.connectedAs')} <strong>{user.nickname}</strong></span>
			<a href="/logout/"><Logout class="h-4/5" /></a>
		{:else}
			<!--<a href="/login/?redirect={encodeURIComponent($page.url.pathname + $page.url.search)}"
				><Login /></a
			>-->
			<a href="/login">
				<Login />
			</a>
		{/if}
		<LocalSelector class="ml-2" />
	</div>
</header>

{#if displayMetadataWarning}
	<a href="/first-login" class="bg-orange-500 block text-white text-center p-4 flex justify-center">
		<Icon src={ExclamationTriangle} size="24" />
		&nbsp;
		{$t('header.metadataWarning')}
		&nbsp;
		<Icon src={ExclamationTriangle} size="24" />
	</a>
{/if}
