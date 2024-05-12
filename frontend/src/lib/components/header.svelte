<script lang="ts">
	import LocalSelector from './header/localSelector.svelte';
	import { t } from '$lib/services/i18n';
	import { ExclamationTriangle, Icon, Cog6Tooth } from 'svelte-hero-icons';
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

<header class="bg-gray-500 text-white flex align-middle items-center justify-between p-2 h-16">
	<h1 class="font-bold text-3xl">
		<a data-sveltekit-reload href="/">{$t('header.appName')}</a>
	</h1>
	<div class="flex align-middle items-center">
		{#if $user}
			<p>{$t('header.connectedAs')} <strong>{$user.nickname}</strong></p>
			<ul class="menu menu-horizontal px-1">
				<li>
					<details>
						<summary>
							<Icon src={Cog6Tooth} size="24" />
						</summary>
						<ul class="p-2 text-primary-content absolute right-0 whitespace-nowrap">
							{#if $user?.type === 0}
								<li>
									<a data-sveltekit-reload href="/admin" class="mr-4 mt-0.5">
										{$t('header.admin')}
									</a>
								</li>
							{/if}
							{#if $user?.type === 0 || $user?.type === 1}
								<li>
									<a data-sveltekit-reload href="/tutor/timeslots" class="mr-4 mt-0.5"
										>{$t('header.availability')}</a
									>
								</li>
							{/if}
							{#if $user?.type === 2}
								<li>
									<a data-sveltekit-reload href="/timeslots" class="mr-4 mt-0.5">
										{$t('header.tutorSelection')}
									</a>
								</li>
							{/if}
							<li>
								<LocalSelector class="ml-4 mt-3" />
							</li>
							<li>
								<a data-sveltekit-reload href="/logout" class="whitespace-nowrap">
									{$t('header.signout')}
								</a>
							</li>
						</ul>
					</details>
				</li>
			</ul>
		{:else}
			<a
				data-sveltekit-reload
				href="/login?redirect={encodeURIComponent($page.url.pathname + $page.url.search)}"
			>
				<button class="btn mr-4 btn-primary btn-outline p-2">
					{$t('header.signin')}
				</button>
			</a>
			<a data-sveltekit-reload href="/register">
				<button class="btn btn-primary btn-outline">
					{$t('header.register')}
				</button>
			</a>
			<LocalSelector class="ml-4" />
		{/if}
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
