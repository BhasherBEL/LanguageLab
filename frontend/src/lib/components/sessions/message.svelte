<script lang="ts">
	import type Message from '$lib/types/message';
	import { displayTime } from '$lib/utils/date';
	import { Check, Icon } from 'svelte-hero-icons';
	import { user } from '$lib/types/user';
	import Gravatar from 'svelte-gravatar';

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
	<div class="rounded-full mx-2 chat-image size-12" title={message.user.nickname}>
		<Gravatar
			email={message.user.email}
			size={64}
			title={message.user.nickname}
			class="rounded-full"
		/>
	</div>
	<div class="chat-bubble whitespace-pre-wrap" class:chat-bubble-primary={!isSender}>
		{message.content}
	</div>
	<div class="chat-footer opacity-50">
		<Icon src={Check} class="w-4 inline" />
		{displayedTime}
	</div>
</div>
