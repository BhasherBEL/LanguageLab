<script lang="ts">
	import JWTSession from '$lib/stores/JWTSession';
	import type Session from '$lib/types/session';
	import { onMount } from 'svelte';
	import MessageC from './message.svelte';
	import { Icon, PaperAirplane } from 'svelte-hero-icons';
	import { toastAlert } from '$lib/utils/toasts';
	import { get } from 'svelte/store';
	import { _ } from '$lib/services/i18n';

	let message = '';
	export let session: Session;
	let htmlMessages: HTMLElement;
	let messages = get(session.messages);

	session.messages.subscribe((newMessages) => {
		messages = newMessages;
	});

	let wsConnected = get(session.wsConnected);
	session.wsConnected.subscribe((newConnected) => {
		wsConnected = newConnected;
	});

	onMount(async () => {
		await session.loadMessages();
		session.wsConnect();
	});

	async function sendMessage() {
		if (message.length == 0) return;

		const user = JWTSession.user();
		if (user === null || user == undefined) return;

		const m = await session.sendMessage(user, message);

		if (m === null) {
			toastAlert($_('chatbox.sendError'));
			return;
		}

		message = '';
	}
</script>

<div class="flex flex-col md:my-8 min-w-fit w-full max-w-4xl border-2">
	<div
		class="flex-grow h-48 overflow-auto flex-col-reverse px-4 flex mb-2"
		bind:this={htmlMessages}
	>
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
	<div class="flex flex-row h-20">
		<textarea
			class="flex-grow border-2 border-gray-300 rounded-md p-2 resize-none overflow-y-hidden"
			placeholder={$_('chatbox.placeholder')}
			bind:value={message}
			on:keypress={async (e) => {
				if (e.key === 'Enter' && !e.shiftKey) {
					await sendMessage();
				}
			}}
		/>
		<button class="w-12 button rounded-md" on:click={sendMessage}>
			<Icon src={PaperAirplane} />
		</button>
	</div>
</div>
