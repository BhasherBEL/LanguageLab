<script lang="ts">
	import JWTSession from '$lib/stores/JWTSession';
	import Message from '$lib/types/message';
	import type Session from '$lib/types/session';
	import { onMount } from 'svelte';
	import MessageC from './message.svelte';
	import { Icon, PaperAirplane } from 'svelte-hero-icons';

	let message = '';
	export let session: Session;
	let htmlMessages: HTMLElement;
	let scrollBottom = 0;

	$: messages = session.messages;

	onMount(async () => {
		await session.loadMessages();
		messages = session.messages;

		console.log(messages);

		// scrollToBottom();
	});

	async function sendMessage() {
		if (message.length == 0) return;

		const user = JWTSession.user();
		if (user === null || user == undefined) return;

		console.log(await session.sendMessage(user, message));

		message = '';
		messages = session.messages;
	}

	function scrollToBottom() {
		htmlMessages.scroll({
			top: htmlMessages.scrollHeight,
			behavior: 'smooth'
		});
		console.log(htmlMessages.scrollTop, htmlMessages.scrollHeight, htmlMessages.clientHeight);
	}
</script>

<div class="flex flex-col md:my-8 min-w-fit w-full max-w-4xl border-2">
	<div
		class="flex-grow h-48 overflow-auto flex-col-reverse px-4 flex"
		bind:this={htmlMessages}
		on:scroll={() =>
			(scrollBottom =
				htmlMessages.scrollHeight - htmlMessages.scrollTop - htmlMessages.clientHeight)}
	>
		{#each messages.sort((a, b) => b.created_at.getTime() - a.created_at.getTime()) as message (message.id)}
			<MessageC {message} />
		{/each}
	</div>
	<div class="flex flex-row h-20 mt-2">
		<textarea
			class="flex-grow border-2 border-gray-300 rounded-md p-2 resize-none overflow-y-hidden"
			placeholder="Send a message..."
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

<!-- <style lang="less">
	#mainbox {
		display: flex;
		flex-direction: column;
		height: 90%;
		margin-top: 50px;
		width: clamp(300px, 50%, 800px);
		border: 2px solid black;
		border-radius: 5px;
	}

	#chatbox {
		flex-grow: 1;
	}

	#chatinput {
		height: 50px;
	}
</style> -->
