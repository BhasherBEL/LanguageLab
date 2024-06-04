<script lang="ts">
	import LocalSelector from './header/localSelector.svelte';
	import { t } from '$lib/services/i18n';
	import {
		ExclamationTriangle,
		Icon,
		Bars3,
		UserCircle,
		Language,
		Cog6Tooth
	} from 'svelte-hero-icons';
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
	<div class="navbar-start">
		<div class="dropdown sm:hidden p-0">
			<div tabindex="0" role="button" class="btn btn-ghost">
				<Icon src={Bars3} class="h-5 w-5" />
			</div>
			<ul
				tabindex="0"
				class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
			>
				{#if $user}
					<li><a href="/">Item 1</a></li>
					<li>
						<a href="/">Parent</a>
						<ul class="p-2">
							<li><a href="/">Submenu 1</a></li>
							<li><a href="/">Submenu 2</a></li>
						</ul>
					</li>
					<li><a href="/">Item 3</a></li>
				{/if}
				<li>
					<a>{$t('header.language')}</a>
					<ul class="p-2">
						<LocalSelector />
					</ul>
				</li>
			</ul>
		</div>
		<h1 class="btn btn-ghost text-lg text-gray-600">
			<a data-sveltekit-reload href="/">{$t('header.appName')}</a>
		</h1>
	</div>
	<div class="navbar-end hidden sm:flex">
		<ul class="menu menu-horizontal p-0">
			{#if $user}
				<li>
					<details>
						<summary class="p-3">
							<Icon src={UserCircle} class="h-5 w-5" />
							{$user.nickname}
						</summary>
						<ul class="menu menu-sm dropdown-content absolute right-0">
							{#if $user?.type === 0 || $user?.type === 1}
								<li>
									<a data-sveltekit-reload href="/tutor/timeslots">
										{$t('header.availability')}
									</a>
								</li>
							{/if}
							{#if $user?.type === 2}
								<li>
									<a data-sveltekit-reload href="/timeslots">
										{$t('header.tutorSelection')}
									</a>
								</li>
							{/if}
							<li>
								<a data-sveltekit-reload href="/logout" class="whitespace-nowrap">
									{$t('header.signout')}
								</a>
							</li>
						</ul>
					</details>
				</li>
				{#if $user?.type === 0}
					<li>
						<details>
							<summary class="p-3">
								<Icon src={Cog6Tooth} class="h-5 w-5" />
							</summary>
							<ul class="menu menu-sm dropdown-content absolute right-0">
								<li>
									<a data-sveltekit-reload href="/admin">
										{$t('header.admin')}
									</a>
								</li>
								<li><a>Submenu 2</a></li>
							</ul>
						</details>
					</li>
				{/if}
			{:else}
				<li>
					<a
						class="btn btn-sm my-auto"
						data-sveltekit-reload
						href="/login?redirect={encodeURIComponent($page.url.pathname + $page.url.search)}"
					>
						{$t('header.signin')}
					</a>
				</li>
				<!-- <li>
					<a class="btn btn-primary" data-sveltekit-reload href="/register">
						{$t('header.register')}
					</a>
				</li> -->
			{/if}
			<li>
				<details>
					<summary class="p-3">
						<Icon src={Language} class="h-5 w-5" />
					</summary>
					<ul class="menu menu-sm dropdown-content absolute right-0">
						<LocalSelector />
					</ul>
				</details>
			</li>
		</ul>
	</div>
</header>

{#if displayMetadataWarning}
	<a
		data-sveltekit-reload
		href="/register"
		class="alert alert-warning rounded-none text-base-100 text-sm p-2 flex justify-center"
	>
		<Icon src={ExclamationTriangle} class="h-5 w-5" />
		&nbsp;
		{$t('header.metadataWarning')}
	</a>
{/if}
