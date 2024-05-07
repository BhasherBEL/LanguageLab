<script lang="ts">
	import type Session from '$lib/types/session';
	import { onDestroy, onMount } from 'svelte';
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

	$: isTyping = false;
	let timeoutTyping: number;

	session.lastTyping.subscribe((lastTyping) => {
		clearTimeout(timeoutTyping);
		if (!lastTyping) {
			isTyping = false;
			return;
		}

		const diff = new Date().getTime() - lastTyping.getTime();

		if (diff > 2000) {
			isTyping = false;
		}

		isTyping = true;
		timeoutTyping = setTimeout(() => {
			isTyping = false;
		}, 2000 - diff);
	});

	let presenceTimeout: number;

	function presenceIndicator() {
		clearInterval(presenceTimeout);

		presenceTimeout = setInterval(() => {
			session.sendPresence();
		}, 5000);
	}

	onMount(async () => {
		await session.loadMessages();
		session.wsConnect(token);
		presenceIndicator();
	});

	onDestroy(() => {
		clearInterval(presenceTimeout);
	});
</script>

<div class="flex flex-col my-4 min-w-fit w-full max-w-4xl border-2 rounded-lg">
	<div class="flex-grow h-48 overflow-auto flex-col-reverse px-4 flex mb-2">
		<div class:hidden={!isTyping}>
			<span class="loading loading-dots loading-md"></span>
		</div>
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
