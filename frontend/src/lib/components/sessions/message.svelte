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

<div class="w-full flex my-2" class:flex-row-reverse={isSender}>
	<div class="flex flex-col">
		<div class="rounded-full size-14 mx-2 bg-gray-200" title={message.user.nickname}>
			{#if message.user.type == 0}
				<Icon src={Sparkles} class="w-6 m-auto" />
			{:else if message.user.type == 1}
				<Icon src={AcademicCap} class="w-8 m-auto" />
			{:else}
				<Icon src={User} class="w-8 m-auto" />
			{/if}
		</div>
		<div class="text-center text-gray-400 text-sm">
			{displayedTime}
		</div>
	</div>
	<div
		class="rounded-b-xl p-4 w-fit h-fit"
		class:bg-blue-200={isSender}
		class:bg-gray-200={!isSender}
		class:rounded-tl-xl={isSender}
		class:rounded-tr-xl={!isSender}
	>
		<div class="max-w-3xl">{message.content}</div>
	</div>
</div>
