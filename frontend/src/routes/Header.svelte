<script lang="ts">
	import LocalSelector from '$lib/components/header/localSelector.svelte';
	import { t } from '$lib/services/i18n';
	import { ExclamationTriangle, Icon, Bars3, Language, Cog6Tooth } from 'svelte-hero-icons';
	import { page } from '$app/stores';
	import type User from '$lib/types/user';

	let { user }: { user: User | null } = $props();

	let displayMetadataWarning = $state(false);

	if (user) {
		if (!user.home_language || !user.target_language || !user.birthdate || !user.gender) {
			displayMetadataWarning = true;
		}
	}
</script>

<header class="navbar shadow bg-gray-200">
	<div class="navbar-start">
		<div class="dropdown sm:hidden p-0">
			<div tabindex="0" role="button" class="btn btn-ghost">
				<Icon src={Bars3} class="h-5 w-5" />
			</div>
			<ul
				tabindex="-1"
				class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
			>
				<li>
					<span>{$t('header.language')}</span>
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
		<ul class="menu menu-horizontal p-0 flex items-center z-10">
			{#if user}
				<li>
					<details>
						<summary class="px-3">
							<img
								src={user.is_human
									? `https://gravatar.com/avatar/${user.emailHash}?d=identicon`
									: 'https://kagi.com/proxy/i?c=lWla4SiEvVNmj85b_dW2HcBDkb-62vZXR0vAz8RZagrJAq-uBHz_ZPgDAhAjEFBBVAgZajhLcQwLCzs3rqJkAErjciPVInG9yIs59P_iME2LlRYKsHHbmqTN3IM-opwDi1tbTtM9VQuuFHT6vK-jnaGME1IXira-_R5CPTq9rd4%3D'}
								alt={''}
								class="rounded-full border text-sm size-8 border-neutral-400"
							/>
							{user.nickname}
						</summary>
						<ul class="menu menu-sm dropdown-content absolute right-0 z-10 p-l-2 m-0">
							{#if user?.type < 2}
								<li class="m-0 p-0">
									<a
										data-sveltekit-reload
										href="/tutor/profile?redirect={encodeURIComponent(
											$page.url.pathname + $page.url.search
										)}"
									>
										{$t('header.profile')}
									</a>
								</li>
							{/if}
							{#if user?.type === 0}
								<li class="m-0 p-0">
									<a data-sveltekit-reload href="/admin/users">
										{$t('header.admin.users')}
									</a>
								</li>
								<li class="m-0 p-0">
									<a data-sveltekit-reload href="/admin/sessions">
										{$t('header.admin.sessions')}
									</a>
								</li>
								<li class="m-0 p-0">
									<a data-sveltekit-reload href="/admin/studies">
										{$t('header.admin.studies')}
									</a>
								</li>
								<li class="m-0 p-0">
									<a data-sveltekit-reload href="/admin/agents">
										{$t('header.admin.agents')}
									</a>
								</li>
								<li class="m-0 p-0">
									<a data-sveltekit-reload href="/admin/tasks">
										{$t('header.admin.tasks')}
									</a>
								</li>
							{/if}
							<li class="border-t m-0 p-0">
								<a data-sveltekit-reload href="/logout">
									{$t('header.signout')}
								</a>
							</li>
						</ul>
					</details>
				</li>
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
