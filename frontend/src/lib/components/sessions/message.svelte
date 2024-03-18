<script lang="ts">
	import JWTSession from '$lib/stores/JWTSession';
	import type Message from '$lib/types/message';
	import { displayTime } from '$lib/utils/date';

	export let message: Message;

	let timer: number;
	$: displayedTime = displayTime(message.created_at);
	$: {
		clearInterval(timer);
		timer = setInterval(() => {
			displayedTime = displayTime(message.created_at);
		}, 1000);
	}

	const isSender = message.user == JWTSession.user();
</script>

<div class="w-full flex" class:justify-end={isSender}>
	<div
		class="rounded-b-xl my-2 p-4 w-fit"
		class:bg-blue-200={isSender}
		class:bg-gray-200={!isSender}
		class:rounded-tl-xl={isSender}
		class:rounded-tr-xl={!isSender}
	>
		<div class="font-bold mb-1 capitalize">
			{message.user.email}
		</div>
		<div class="max-w-3xl">{message.content}</div>
		<div class="text-right text-gray-500">
			{displayedTime}
		</div>
	</div>
</div>
