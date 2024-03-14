<script lang="ts">
	import { page } from '$app/stores';
	import { getSessionAPI } from '$lib/api/sessions';
	import Header from '$lib/components/header.svelte';
	import Chatbox from '$lib/components/sessions/chatbox.svelte';
	import Session from '$lib/types/session';
	import { requireLogin } from '$lib/utils/login';
	import { onMount } from 'svelte';

	let session: Session | null = null;

	onMount(async () => {
		requireLogin();

		const param = $page.url.searchParams.get('id');
		if (!param) return;

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
		<div class="flex flex-row flex-grow justify-evenly">
			<Chatbox {session} />
		</div>
	{/if}
</div>
