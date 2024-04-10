<script lang="ts">
	import { page } from '$app/stores';
	import { getSessionAPI } from '$lib/api/sessions';
	import Header from '$lib/components/header.svelte';
	import Chatbox from '$lib/components/sessions/chatbox.svelte';
	import JWTSession from '$lib/stores/JWTSession';
	import Session from '$lib/types/session';
	import { getBaseURL, requireLogin } from '$lib/utils/login';
	import { onMount } from 'svelte';
	import { _ } from '$lib/services/i18n';

	let session: Session | null = null;

	onMount(async () => {
		requireLogin();

		const param = $page.url.searchParams.get('id');
		if (!param) {
			window.location.href = getBaseURL();
			return;
		}

		const id = parseInt(param);

		if (!id) return;
		else {
			session = Session.parse(await getSessionAPI(id));
		}
	});
</script>

<div class="h-screen flex flex-col">
	<Header />
	{#if session}
		<div class="mx-6 mt-4 text-lg text-center">
			#{session.id}:
			{#each session.users as user, i (user.id)}
				{#if user === JWTSession.user()}
					<span class="font-bold">{user.nickname}</span> ({$_(
						'users.type.' + user.type
					).toLowerCase()})<!--
				-->{:else}
					{user.nickname} ({$_(
						'users.type.' + user.type
					).toLowerCase()})<!--
				-->{/if}<!--
				-->{#if i < session.users.length - 1}
					,&nbsp;
				{/if}
			{/each}
		</div>
		<div class="flex flex-row flex-grow justify-evenly">
			<Chatbox {session} />
		</div>
	{/if}
</div>
