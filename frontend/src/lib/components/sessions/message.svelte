<script lang="ts">
	import type Message from '$lib/types/message';
	import { displayTime } from '$lib/utils/date';
	import { AcademicCap, Icon, Sparkles, User } from 'svelte-hero-icons';
	import { user } from '$lib/types/user';

	export let message: Message;

	let timer: number;
	$: displayedTime = displayTime(message.created_at);
	$: {
		clearInterval(timer);
		timer = setInterval(() => {
			displayedTime = displayTime(message.created_at);
		}, 1000);
	}

	const isSender = message.user.id == $user?.id;
</script>

<div class="chat" class:chat-start={!isSender} class:chat-end={isSender}>
	<div class="rounded-full p-3 mx-2 bg-gray-200 chat-image" title={message.user.nickname}>
		{#if message.user.type == 0}
			<Icon src={Sparkles} class="w-6 m-auto" />
		{:else if message.user.type == 1}
			<Icon src={AcademicCap} class="w-6 m-auto" />
		{:else}
			<Icon src={User} class="w-6 m-auto" />
		{/if}
	</div>
	<div class="chat-bubble" class:chat-bubble-secondary={isSender}>
		{message.content}
	</div>
	<div class="chat-footer opacity-50">
		{displayedTime}
	</div>
</div>
