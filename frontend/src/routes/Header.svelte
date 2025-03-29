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
				{#if user}
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
		<ul class="menu menu-horizontal p-0 flex items-center">
			{#if user?.type === 2}
				<li>
					<details>
						<summary class="px-3">
							<img
								src={`https://gravatar.com/avatar/${user.emailHash}?d=identicon`}
								alt={''}
								class="rounded-full border text-sm size-8 border-neutral-400"
							/>
							{user.nickname}
						</summary>
						<ul class="menu menu-sm dropdown-content absolute right-0">
							<li>
								<a data-sveltekit-reload href="/logout" class="whitespace-nowrap">
									{$t('header.signout')}
								</a>
							</li>
						</ul>
					</details>
				</li>
			{/if}
			{#if user?.type === 1}
				<li>
					<details>
						<summary class="px-3">
							<img
								src={`https://gravatar.com/avatar/${user.emailHash}?d=identicon`}
								alt={''}
								class="rounded-full border text-sm size-8 border-neutral-400"
							/>
							{user.nickname}
						</summary>
						<ul class="menu menu-sm dropdown-content absolute right-0">
							<li>
								<a data-sveltekit-reload href="/logout" class="whitespace-nowrap">
									{$t('header.signout')}
								</a>
							</li>
							<li>
								<a data-sveltekit-reload href="/tutor/profile" class="whitespace-nowrap">
									{$t('header.tutor.profile')}
								</a>
							</li>
						</ul>
					</details>
				</li>
			{/if}
			{#if user?.type === 0}
					<li>
						<details>
							<summary class="p-3">
								<Icon src={Cog6Tooth} class="h-5 w-5" />
							</summary>
							<ul class="menu menu-sm dropdown-content absolute right-0 z-10">
								<li>
									<a data-sveltekit-reload href="/admin/users">
										{$t('header.admin.users')}
									</a>
								</li>
								<li>
									<a data-sveltekit-reload href="/admin/sessions">
										{$t('header.admin.sessions')}
									</a>
								</li>
								<li>
									<a data-sveltekit-reload href="/admin/studies">
										{$t('header.admin.studies')}
									</a>
								</li>
								<li>
									<a data-sveltekit-reload href="/logout" class="whitespace-nowrap">
										{$t('header.signout')}
									</a>
								</li>
							</ul>
						</details>
					</li>
			{:else if !user}
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
