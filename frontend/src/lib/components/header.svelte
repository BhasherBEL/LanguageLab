<script lang="ts">
	import Logout from 'svelte-material-icons/Logout.svelte';
	import Login from 'svelte-material-icons/Login.svelte';
	import LocalSelector from './header/localSelector.svelte';
	import { t } from '$lib/services/i18n';
	import { Clock, Cog6Tooth, ExclamationTriangle, Icon } from 'svelte-hero-icons';
	import { onMount } from 'svelte';
	import { user } from '$lib/types/user';
	import { page } from '$app/stores';

	$: displayMetadataWarning = false;

	onMount(async () => {
		if ($user) {
			if (!$user.home_language || !$user.target_language || !$user.birthdate) {
				displayMetadataWarning = true;
			}
		}
	});
</script>

<header class="bg-gray-500 text-white flex align-middle justify-between p-4">
	<h1 class="font-bold text-2xl"><a data-sveltekit-reload href="/">{$t('header.appName')}</a></h1>
	<div class="flex align-middle">
		{#if $user?.type === 0}
			<a data-sveltekit-reload href="/admin" class="mr-4 mt-0.5">
				<Icon src={Cog6Tooth} class="size-6" />
			</a>
		{/if}
		{#if $user?.type === 0 || $user?.type === 1}
			<a data-sveltekit-reload href="/tutor/timeslots" class="mr-4 mt-0.5">
				<Icon src={Clock} class="size-6" />
			</a>
		{/if}
		{#if $user?.type === 2}
			<a data-sveltekit-reload href="/timeslots" class="mr-4 mt-0.5">
				<Icon src={Clock} class="size-6" />
			</a>
		{/if}
		{#if $user}
			<span class="pr-2">{$t('header.connectedAs')} <strong>{$user.nickname}</strong></span>
			<a data-sveltekit-reload href="/logout"><Logout class="h-4/5" size={24} /></a>
		{:else}
			<a
				data-sveltekit-reload
				href="/login?redirect={encodeURIComponent($page.url.pathname + $page.url.search)}"
			>
				<Login size={24} />
			</a>
		{/if}
		<LocalSelector class="ml-2" />
	</div>
</header>

{#if displayMetadataWarning}
	<a
		data-sveltekit-reload
		href="/register"
		class="bg-orange-500 text-white text-center p-4 flex justify-center"
	>
		<Icon src={ExclamationTriangle} size="24" />
		&nbsp;
		{$t('header.metadataWarning')}
		&nbsp;
		<Icon src={ExclamationTriangle} size="24" />
	</a>
{/if}
