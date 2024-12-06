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
	let metadata: { message: string; date: number }[] = [];
	let lastMessage = '';
	let message = '';
	let showPicker = false;
	let showSpecials = false;
	let textearea: HTMLTextAreaElement;

	$: currentReplyToMessage = $replyToMessage;

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

<div class="flex flex-col w-full py-2 relative">
    {#if currentReplyToMessage}
        <div class="flex items-center justify-between bg-gray-100 p-2 rounded-md mb-1 text-sm text-gray-600">
            <p class="text-xs text-gray-400">
                Replying to: <span class="text-xs text-gray-400">{currentReplyToMessage.content}</span>
            </p>
            <button class="text-xs text-blue-500 underline ml-4 cursor-pointer" on:click={cancelReply}>
                Cancel
            </button>
        </div>
    {/if}

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

    <div class="w-full flex relative">
        <textarea
            bind:this={textearea}
            class="flex-grow border border-gray-300 rounded-md p-2 text-base resize-none"
            placeholder={disabled ? $t('chatbox.disabled') : $t('chatbox.placeholder')}
            {disabled}
            bind:value={message}
            on:keypress={keyPress}
        />

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
                class:hidden={!showPicker}
                class="absolute z-10 bottom-16 right-0 lg:left-0 lg:right-auto hidden"
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

        <div
            class="absolute top-1/2 right-28 kbd transform -translate-y-1/2 text-sm select-none cursor-pointer"
            on:click={() => (showSpecials = !showSpecials)}
            aria-hidden={false}
            role="button"
            tabindex="0"
        >
            É
        </div>

        <button class="btn btn-primary rounded-none size-16" on:click={sendMessage}>
            <Icon src={PaperAirplane} />
        </button>
    </div>
</div>