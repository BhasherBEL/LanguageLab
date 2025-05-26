<script lang="ts">
	import config from '$lib/config';
	import { t } from '$lib/services/i18n';
	import { toastAlert } from '$lib/utils/toasts';
	import { Icon, PaperAirplane } from 'svelte-hero-icons';
	import { onMount } from 'svelte';
	import autosize from 'svelte-autosize';
	import type User from '$lib/types/user';

	import type Session from '$lib/types/session';
	import type Message from '$lib/types/message';

	onMount(async () => {
		await import('emoji-picker-element');
	});

	let {
		user,
		session,
		replyTo = $bindable(),
		chatClosed = false
	}: { user: User; session: Session; replyTo: Message | undefined; chatClosed: boolean } = $props();

	let metadata: { message: string; date: number }[] = [];
	let lastMessage = '';
	let message = $state('');
	let showPicker = $state(false);
	let showSpecials = $state(false);
	let textearea: HTMLTextAreaElement;

	function cancelReply() {
		replyTo = undefined;
	}

	async function sendMessage() {
		message = message.trim();
		if (message.length == 0) return;

		try {
			const m = await session.sendMessage(
				user,
				message,
				[...metadata],
				replyTo?.message_id || null
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
			cancelReply();
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

<div class="flex flex-col w-full relative">
	{#if replyTo}
		<div
			class="flex items-center justify-between bg-gray-100 p-2 rounded-md mb-2 text-sm text-gray-600"
		>
			<p class="text-xs text-gray-400">
				Replying to: <span class="text-xs text-gray-400">{replyTo.content}</span>
			</p>
			<button class="text-xs text-blue-500 underline ml-4 cursor-pointer" onclick={cancelReply}>
				Cancel
			</button>
		</div>
	{/if}

	{#if showSpecials}
		<ul class="flex justify-around divide-x-2 border-b-2 py-1 flex-wrap md:flex-nowrap mb-2">
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

	<div class="w-full flex items-center gap-3">
		<!-- Emoji picker button -->
		<div
			class="text-2xl select-none cursor-pointer flex-shrink-0"
			onclick={() => (showPicker = !showPicker)}
			data-tooltip-target="tooltip-emoji"
			data-tooltip-placement="right"
			data-riple-light="true"
			aria-hidden={false}
			role="button"
			tabindex="0"
			title="Add emoji"
		>
			😀
		</div>

		<!-- Emoji picker -->
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
					onemoji-click={(event: any) => {
						message += event.detail.unicode;
						textearea.focus();
					}}
				>
				</emoji-picker>
			</div>
		</div>

		<!-- Textarea container -->
		<div class="flex-grow relative">
			<textarea
				bind:this={textearea}
				class="w-full p-3 resize-none overflow-hidden py-4 pr-12 border rounded-[32px] border-gray-300 focus:border-primary focus:outline-none transition-colors"
				placeholder={chatClosed ? $t('chatbox.disabled') : $t('chatbox.placeholder')}
				disabled={chatClosed}
				bind:value={message}
				use:autosize
				rows={1}
				onkeypress={keyPress}
			></textarea>
			<!-- Special characters button -->
			<div
				class="absolute right-3 top-1/2 transform -translate-y-1/2 kbd text-sm select-none cursor-pointer hover:bg-gray-200 transition-colors"
				onclick={() => (showSpecials = !showSpecials)}
				aria-hidden={false}
				role="button"
				tabindex="0"
				title="Special characters"
			>
				É
			</div>
		</div>

		<!-- Send button -->
		<button
			class="btn btn-primary rounded-full size-14 flex-shrink-0 hover:scale-105 transition-transform"
			onclick={sendMessage}
			title="Send message"
			aria-label="Send message"
		>
			<Icon src={PaperAirplane} size="20" />
		</button>
	</div>
</div>
