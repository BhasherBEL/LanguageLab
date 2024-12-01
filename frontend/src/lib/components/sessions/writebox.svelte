<script lang="ts">
	import config from '$lib/config';
	import { t } from '$lib/services/i18n';
	import type Session from '$lib/types/session';
	import { toastAlert } from '$lib/utils/toasts';
	import { Icon, PaperAirplane } from 'svelte-hero-icons';
	import { user } from '$lib/types/user';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';

	import { replyToMessage, clearReplyToMessage } from '$lib/utils/replyUtils';

	onMount(async () => {
		await import('emoji-picker-element');
	});

	export let session: Session;

	// State for replying
	let currentReplyToMessage = null;
	console.log('Reply To Message2:', replyToMessage); // Debugging
	let metadata: { message: string; date: number }[] = [];
	let lastMessage = '';
	let message = '';
	let showPicker = false;
	let showSpecials = false;
	let textearea: HTMLTextAreaElement;

	$: currentReplyToMessage = $replyToMessage;
	$: {
		console.log('Reactive currentReplyToMessage:', currentReplyToMessage);
	}

	function cancelReply() {
		clearReplyToMessage();
	}

	// User and disabled checks
	let us = get(user);
	let disabled =
		us == null ||
		session.users.find((u) => us.id === u.id) === undefined ||
		new Date().getTime() > session.end_time.getTime() + 3600000 ||
		new Date().getTime() < session.start_time.getTime() - 3600000;

	// Send message logic
	async function sendMessage() {
		message = message.trim();
		if (message.length == 0) return;

		if ($user === null) {
			toastAlert('You must be logged in to send a message.');
			return;
		}

		try {
			// Clone objects to avoid readonly issues
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

			// Reset after sending
			message = '';
			metadata = [];
			clearReplyToMessage();
		} catch (error) {
			console.error('Failed to send message:', error);
			toastAlert('Failed to send your message. Please try again.');
		}
	}

	function keyPress(event: KeyboardEvent) {
		if (message === lastMessage) return;

		// Add metadata only if unique
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

<div class="chat-input-container">
	<!-- Reply Preview -->
	{#if currentReplyToMessage}
		<div class="reply-preview">
			<p class="replying-to-text">
				Replying to: <span class="replying-to-content">{currentReplyToMessage.content}</span>
			</p>
			<button class="cancel-reply" on:click={cancelReply}>Cancel</button>
		</div>
	{/if}

	<!-- Special Characters -->
	{#if showSpecials}
		<ul class="flex justify-around divide-x-2 border-b-2 py-1 flex-wrap md:flex-nowrap">
			{#each config.SPECIAL_CHARS as char (char)}
				<button
					class="border-none"
					on:click={() => {
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

	<!-- Message Input -->
	<div class="w-full flex relative">
		<textarea
			bind:this={textearea}
			class="flex-grow p-2 resize-none overflow-y-hidden pr-16"
			placeholder={disabled ? $t('chatbox.disabled') : $t('chatbox.placeholder')}
			{disabled}
			bind:value={message}
			on:keypress={keyPress}
		/>
		<!-- Emoji Picker -->
		<div
			class="absolute top-1/2 right-20 transform -translate-y-1/2 text-lg select-none cursor-pointer"
			on:click={() => (showPicker = !showPicker)}
			data-tooltip-target="tooltip-emoji"
			data-tooltip-placement="right"
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
					on:emoji-click={(event) => {
						message += event.detail.unicode;
						textearea.focus();
					}}
				>
				</emoji-picker>
			</div>
		</div>

		<!-- Special Characters Button -->
		<div
			class="absolute top-1/2 right-28 kbd transform -translate-y-1/2 text-sm select-none cursor-pointer"
			on:click={() => (showSpecials = !showSpecials)}
			aria-hidden={false}
			role="button"
			tabindex="0"
		>
			É
		</div>

		<!-- Send Button -->
		<button class="btn btn-primary rounded-none size-16" on:click={sendMessage}>
			<Icon src={PaperAirplane} />
		</button>
	</div>
</div>

<style>
	.chat-input-container {
		display: flex;
		flex-direction: column;
		width: 100%;
		padding: 0.5rem 0;
		position: relative;
	}

	.reply-preview {
		display: flex;
		align-items: center;
		justify-content: space-between;
		background: #f8f9fa;
		padding: 0.5rem;
		border-radius: 0.25rem;
		margin-bottom: 0.1rem;
		font-size: 0.875rem;
		color: #6c757d;
	}

	.replying-to-text {
		margin: 0;
		font-size: 0.75rem;
		color: #bbb;
	}

	.replying-to-content {
		font-size: 0.75rem;
		color: #bbb;
	}

	.cancel-reply {
		font-size: 0.75rem;
		color: #007bff;
		border: none;
		background: none;
		text-decoration: underline;
		cursor: pointer;
		margin-left: 1rem;
	}

	textarea {
		flex-grow: 1;
		border: 1px solid #ced4da;
		border-radius: 0.25rem;
		padding: 0.5rem;
		font-size: 1rem;
		resize: none;
		box-sizing: border-box;
	}
</style>
