<script lang="ts">
	import { page } from '$app/stores';
	import { getSessionAPI } from '$lib/api/sessions';
	import Chatbox from '$lib/components/sessions/chatbox.svelte';
	import Session from '$lib/types/session';
	import { getBaseURL } from '$lib/utils/login';
	import { onMount } from 'svelte';
	import { t } from '$lib/services/i18n';
	import { user } from '$lib/types/user';

	let session: Session | null = null;

	onMount(async () => {
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
	{#if session}
		<div class="mx-6 mt-4 text-lg text-center">
			#{session.id}:
			{#each session.users as sessionUser, i (sessionUser.id)}
				{#if sessionUser === $user}
					<span class="font-bold">{sessionUser.nickname}</span> ({$t(
						'users.type.' + sessionUser.type
					).toLowerCase()})<!--
				-->{:else}
					{sessionUser.nickname} ({$t(
						'users.type.' + sessionUser.type
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
