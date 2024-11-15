<script lang="ts">
	import config from '$lib/config';
	import { t } from '$lib/services/i18n';
	import type Session from '$lib/types/session';
	import type Message from '$lib/types/message';
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
        toastAlert("You must be logged in to send a message.");
        return;
    }

    try {
        const m = await session.sendMessage(
            $user,
            message,
            metadata,
            $replyToMessage?.id || null // Access the reactive value of replyToMessage
        );

        if (m === null) {
            toastAlert($t('chatbox.sendError'));
            return;
        }

        // Reset state after sending
        message = '';
        metadata = [];
        clearReplyToMessage(); // Clear reply state
    } catch (error) {
        console.error("Failed to send message:", error);
        toastAlert("Failed to send your message. Please try again.");
    }
}

	// Handle typing events
	function keyPress(event: KeyboardEvent) {
		if (message === lastMessage) return;

		metadata.push({ message: message, date: new Date().getTime() });
		lastMessage = message;

		// Send message on Enter, prevent new line unless Shift is held
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			sendMessage();
		} else {
			session.sendTyping();
		}
	}
</script>

<!-- Reply Preview -->
{#if currentReplyToMessage}
    <div class="reply-preview">
        <p class="replying-to-text">
            Replying to: <span class="replying-to-content">{currentReplyToMessage.content}</span>
        </p>
        <button class="cancel-reply" on:click={cancelReply}>Cancel</button>
    </div>
{/if}



<div class="w-full border-t-2">
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
	.reply-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  background-color: #f0f4f8;
  border-left: 4px solid #007bff;
  margin-bottom: 0.5rem;
  border-radius: 5px;
}

.replying-to-text {
  color: #555;
  font-size: 0.9rem;
}

.replying-to-content {
  font-weight: bold;
  color: #333;
}

.cancel-reply {
  font-size: 0.8rem;
  color: #007bff;
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: underline;
}

</style>
