<script lang="ts">
	import type Session from '$lib/types/session';
	import { onMount } from 'svelte';
	import MessageC from './message.svelte';
	import { get } from 'svelte/store';
	import Writebox from './writebox.svelte';

	export let token: string;

	export let session: Session;
	let messages = get(session.messages);

	session.messages.subscribe((newMessages) => {
		messages = newMessages;
	});

	let wsConnected = true;
	let timeout: number;
	session.wsConnected.subscribe((newConnected) => {
		clearTimeout(timeout);

		if (newConnected === wsConnected) return;
		else if (newConnected) wsConnected = newConnected;
		else {
			timeout = setTimeout(() => {
				wsConnected = newConnected;
			}, 1000);
		}
	});

	onMount(async () => {
		await session.loadMessages();
		session.wsConnect(token);
	});
</script>

<div class="flex flex-col my-4 min-w-fit w-full max-w-4xl border-2 rounded-lg">
	<div class="flex-grow h-48 overflow-auto flex-col-reverse px-4 flex mb-2">
		{#each messages.sort((a, b) => b.created_at.getTime() - a.created_at.getTime()) as message (message.id)}
			<MessageC {message} />
		{/each}
	</div>
	{#if !wsConnected}
		<div
			class="bg-orange-400 h-10 text-center text-white font-bold flex justify-center items-center"
		>
			Real-time sync lost. You may need to refresh the page to see new messages.
		</div>
	{/if}
	<div class="flex flex-row h-30">
		<Writebox {session} />
	</div>
</div>
