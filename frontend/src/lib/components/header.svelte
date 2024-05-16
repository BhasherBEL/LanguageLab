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
			if (!$user.home_language || !$user.target_language || !$user.birthdate || !$user.gender) {
				displayMetadataWarning = true;
			}
		}
	});
</script>

<header class="navbar shadow">
	<div class="flex-1">
		<h1 class="btn btn-ghost text-xl text-gray-600">
			<a data-sveltekit-reload href="/">{$t('header.appName')}</a>
		</h1>
	</div>
	<div class="flex-none">
		{#if $user}
			<p>{$t('header.connectedAs')} <strong>{$user.nickname}</strong></p>
			<ul class="menu menu-horizontal pr-0">
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
								<LocalSelector />
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
				<button class="btn btn-sm btn-primary mr-4">
					{$t('header.signin')}
				</button>
			</a>
			<a data-sveltekit-reload href="/register">
				<button class="btn btn-sm btn-primary">
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
		class="bg-warning text-white text-center p-2 flex justify-center"
	>
		<Icon src={ExclamationTriangle} size="24" />
		&nbsp;
		{$t('header.metadataWarning')}
		&nbsp;
		<Icon src={ExclamationTriangle} size="24" />
	</a>
{/if}
