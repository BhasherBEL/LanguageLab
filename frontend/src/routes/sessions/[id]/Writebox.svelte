<script lang="ts">
	import config from '$lib/config';
	import { t } from '$lib/services/i18n';
	import { toastAlert } from '$lib/utils/toasts';
	import { Icon, PaperAirplane } from 'svelte-hero-icons';
	import { onMount } from 'svelte';
	import autosize from 'svelte-autosize';
	import type User from '$lib/types/user';

	import { replyToMessage, clearReplyToMessage } from '$lib/utils/replyUtils';

	onMount(async () => {
		await import('emoji-picker-element');
	});

	const { user, session } = $props();

	let currentReplyToMessage = $state($replyToMessage);
	let metadata: { message: string; date: number }[] = [];
	let lastMessage = '';
	let message = $state('');
	let showPicker = $state(false);
	let showSpecials = $state(false);
	let textearea: HTMLTextAreaElement;

	function cancelReply() {
		clearReplyToMessage();
	}

	let disabled =
		session.users.find((u: User) => user.id === u.id) === undefined ||
		new Date().getTime() > session.end_time.getTime() + 3600000 ||
		new Date().getTime() < session.start_time.getTime() - 3600000;

	async function sendMessage() {
		message = message.trim();
		if (message.length == 0) return;

		try {
			const m = await session.sendMessage(
				structuredClone($user),
				message,
				[...metadata],
				$replyToMessage?.id || null
			);

			if (m === null) {
				toastAlert($t('chatbox.sendError'));
				return;
			}

			message = '';
			metadata = [];
			setTimeout(() => {
				autosize.update(textearea);
			}, 10);
			clearReplyToMessage();
		} catch (error) {
			console.error('Failed to send message:', error);
			toastAlert($t('chatbox.sendError'));
		}
	}

	function keyPress(event: KeyboardEvent) {
		if (message === lastMessage) return;

		if (metadata.length === 0 || metadata[metadata.length - 1].message !== message) {
			metadata.push({ message: message, date: new Date().getTime() });
		}
		lastMessage = message;

		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			sendMessage();
		} else {
			session.sendTyping();
		}
	}
</script>

<div class="flex flex-col w-full py-2 relative mb-2">
	{#if currentReplyToMessage}
		<div
			class="flex items-center justify-between bg-gray-100 p-2 rounded-md mb-1 text-sm text-gray-600"
		>
			<p class="text-xs text-gray-400">
				Replying to: <span class="text-xs text-gray-400">{currentReplyToMessage.content}</span>
			</p>
			<button class="text-xs text-blue-500 underline ml-4 cursor-pointer" onclick={cancelReply}>
				Cancel
			</button>
		</div>
	{/if}

	{#if showSpecials}
		<ul class="flex justify-around divide-x-2 border-b-2 py-1 flex-wrap md:flex-nowrap">
			{#each config.SPECIAL_CHARS as char (char)}
				<button
					class="border-none"
					onclick={() => {
						message += char;
						textearea.focus();
					}}
				>
					<kbd class="kbd">
						{char}
					</kbd>
				</button>
			{/each}
		</ul>
	{/if}
	<div class="w-full flex items-center relative">
		<div
			class="text-2xl select-none cursor-pointer mx-4"
			onclick={() => (showPicker = !showPicker)}
			data-tooltip-target="tooltip-emoji"
			data-tooltip-placement="right"
			data-riple-light="true"
			aria-hidden={false}
			role="button"
			tabindex="0"
		>
			😀
		</div>
		<div class="relative">
			<div
				id="tooltip-emoji"
				data-tooltip="tooltip-emoji"
				role="tooltip"
				class:hidden={!showPicker}
				class="absolute z-10 tooltip bottom-16 right-0 lg:left-0 lg:right-auto"
			>
				<emoji-picker
					class="light"
					onemoji-click={(event) => {
						message += event.detail.unicode;
						textearea.focus();
					}}
				>
				</emoji-picker>
			</div>
		</div>
		<textarea
			bind:this={textearea}
			class="flex-grow p-2 resize-none overflow-hidden py-4 pr-12 border rounded-[32px]"
			placeholder={disabled ? $t('chatbox.disabled') : $t('chatbox.placeholder')}
			{disabled}
			bind:value={message}
			use:autosize
			rows={1}
			onkeypress={keyPress}
		></textarea>
		<div
			class="absolute right-28 kbd text-sm select-none cursor-pointer"
			onclick={() => (showSpecials = !showSpecials)}
			aria-hidden={false}
			role="button"
			tabindex="0"
		>
			É
		</div>
		<button class="btn btn-primary rounded-full size-14 mx-4" onclick={sendMessage}>
			<Icon src={PaperAirplane} />
		</button>
	</div>
</div>
