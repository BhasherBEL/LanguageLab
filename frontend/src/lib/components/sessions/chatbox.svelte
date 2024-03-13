<script lang="ts">
	import JWTSession from '$lib/stores/JWTSession';
	import Message from '$lib/types/message';
	import type Session from '$lib/types/session';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';

	let message = '';
	export let session: Session;

	$: messages = session.messages;

	onMount(async () => {
		await session.loadMessages();
		messages = session.messages;
	});

	async function sendMessage() {
		if (message.length == 0) return;

		const user = JWTSession.user();
		if (user === null || user == undefined) return;

		console.log(await session.sendMessage(user, message));

		message = '';
		messages = session.messages;
	}
</script>

<div id="mainbox">
	<div id="chatbox">
		{#each messages.sort((a, b) => a.created_at.getTime() - b.created_at.getTime()) as message (message.id)}
			{#if message.user === JWTSession.user()}
				<div>You: {message.content}</div>
			{:else}
				<div>{message.user.username}: {message.content}</div>
			{/if}
		{/each}
	</div>
	<input
		type="text"
		id="chatinput"
		placeholder="Send a message..."
		bind:value={message}
		on:keypress={async (e) => {
			if (e.key === 'Enter') {
				await sendMessage();
			}
		}}
	/>
</div>

<style lang="less">
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
</style>
