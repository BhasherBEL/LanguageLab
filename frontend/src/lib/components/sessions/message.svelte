<script lang="ts">
	import JWTSession from '$lib/stores/JWTSession';
	import type Message from '$lib/types/message';

	export let message: Message;

	const isSender = message.user == JWTSession.user();
</script>

<div class="w-full flex" class:justify-end={isSender}>
	<div
		class="bg-gray-200 rounded-b-xl my-2 p-4 w-fit"
		class:bg-blue-200={isSender}
		class:rounded-tl-xl={isSender}
		class:rounded-tr-xl={!isSender}
	>
		<div class="font-bold mb-1 capitalize">
			{message.user.username}
		</div>
		<div class="max-w-3xl">{message.content}</div>
	</div>
</div>
