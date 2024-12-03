<script lang="ts">
	import type Message from '$lib/types/message';
	import { displayTime } from '$lib/utils/date';
	import { Check, Icon, Pencil, ArrowUturnLeft } from 'svelte-hero-icons';
	import { user } from '$lib/types/user';
	import { t } from '$lib/services/i18n';
	import linkifyHtml from 'linkify-html';
	import { sanitize } from '$lib/utils/sanitize';
	import { initiateReply } from '$lib/utils/replyUtils';
	import CloseIcon from '../icons/closeIcon.svelte';

	export let message: Message;

	let timer: number;
	$: displayedTime = displayTime(message.created_at);
	$: {
		clearInterval(timer);
		timer = setInterval(() => {
			displayedTime = displayTime(message.created_at);
		}, 1000);
	}

	let replyToMessage: Message | null = null;

	$: if (message.replyTo) {
		findMessageById(message.replyTo).then((msg) => {
			replyToMessage = msg;
		});
	}

	let isEdit = false;
	let contentDiv: HTMLDivElement;

	async function findMessageById(id: string): Promise<Message | null> {
		try {
			const resolvedMessage = await message.getMessageById(Number(id));
			return resolvedMessage;
		} catch (error) {
			console.error(`Error resolving message ID ${id}:`, error);
			return null;
		}
	}

	function startEdit() {
		isEdit = true;
		setTimeout(() => {
			contentDiv?.focus();
		}, 0);
	}

	async function endEdit(validate = true) {
		if (!validate) {
			contentDiv.innerText = message.content;
			isEdit = false;
			return;
		}

		if (contentDiv.innerText.trim() === message.content) {
			isEdit = false;
			return;
		}

		const res = await message.update(contentDiv.innerText.trim(), []);

		if (res) {
			isEdit = false;
		}
	}

	function truncateMessage(content: string, maxLength: number = 20): string {
		if (content.length > maxLength) {
			return content.slice(0, maxLength) + '...';
		}
		return content;
	}

	function scrollToMessage(messageId: number | undefined): void {
		if (!messageId) return;
		const elementId = `message-${messageId}`;
		const element = document.getElementById(elementId);

		if (element) {
			element.scrollIntoView({ behavior: 'smooth', block: 'center' });

			const currentHash = window.location.hash;
			if (currentHash === `#${elementId}`) {
				window.location.hash = '';
				setTimeout(() => {
					window.location.hash = elementId;
				}, 50);
			} else {
				window.location.hash = elementId;
			}
		} else {
			console.warn(`Message with ID ${messageId} not found in DOM.`);
		}
	}

	const isSender = message.user.id == $user?.id;

	async function deleteFeedback(feedback: Feedback | null) {
		if (!feedback) return;
		if (!confirm($t('chatbox.deleteFeedback'))) return;

		await message.deleteFeedback(feedback);
	}
</script>

<!-- Messages Display -->
<div
	id={`message-${message.id}`}
	class="chat group"
	class:chat-start={!isSender}
	class:chat-end={isSender}
>
	<div class="rounded-full mx-2 chat-image size-12" title={message.user.nickname}></div>
	<div
		class="chat-bubble whitespace-pre-wrap"
		class:bg-blue-700={isSender}
		class:bg-gray-300={!isSender}
		class:text-black={!isSender}
		class:text-white={isSender}
		data-is-sender={isSender}
	>
		{#if replyToMessage}
			<button
				class="replying-to-text"
				on:click={() => scrollToMessage(replyToMessage?.id)}
				aria-label="Scroll to replied message"
			>
				{$t('chatbox.replyingTo')}
				<span class="replying-to-content">{truncateMessage(replyToMessage?.content)}</span>
			</button>
		{/if}

		<div contenteditable={isEdit} bind:this={contentDiv}>
			{@html linkifyHtml(sanitize(message.content), { className: 'underline', target: '_blank' })}
		</div>

		<button class="reply-icon" on:click={() => initiateReply(message)}>
			<Icon src={ArrowUturnLeft} class="w-4 h-4 text-gray-800" />
		</button>

		{#if isEdit}
			<div
				contenteditable="true"
				bind:this={contentDiv}
				class="bg-blue-50 whitespace-pre-wrap min-h-8"
			>
				{message.content}
			</div>
			<button
				class="float-end border rounded-full px-4 py-2 mt-2 bg-white text-blue-700"
				on:click={() => endEdit()}
			>
				{$t('button.save')}
			</button>
			<button
				class="float-end border rounded-full px-4 py-2 mt-2 mr-2"
				on:click={() => endEdit(false)}
			>
				{$t('button.cancel')}
			</button>
		{:else}
			<div class="whitespace-pre-wrap" bind:this={contentDiv}>
				{#each parts as part}
					{#if isEdit || !part.feedback}
						{@html linkifyHtml(sanitize(part.text), { className: 'underline', target: '_blank' })}
					{:else}
						<!-- prettier-ignore -->
						<span class=""
							><!--
						--><span
								class="underline group/feedback relative decoration-wavy hover:cursor-help"
								class:decoration-blue-500={part.feedback.content}
								class:decoration-red-500={!part.feedback.content}
								><div
									class="absolute group-hover/feedback:flex hidden bg-secondary h-6 items-center rounded left-1/2 transform -translate-x-1/2 -top-6 px-2 z-10"
								><!--
									-->{part.feedback.content}<button
										aria-label="close"
										class:ml-1={part.feedback.content}
										class="hover:border-inherit border border-transparent rounded"
										on:click={() => deleteFeedback(part.feedback)}
									>
										<CloseIcon />
									</button>
								</div
								><!--
						-->{part.text}<!--
					--></span
							><!--
					--></span
						>
					{/if}
				{/each}
			</div>
		{/if}
		{#if isSender}
			<button
				class="absolute bottom-0 left-[-1.5rem] invisible group-hover:visible h-full p-0"
				on:click={() => (isEdit ? endEdit() : startEdit())}
			>
				<Icon src={Pencil} class="w-5 h-full text-gray-500 hover:text-gray-800" />
			</button>
		{/if}
	</div>
	<div class="chat-footer opacity-50">
		<Icon src={Check} class="w-4 inline" />
		{displayedTime}
		{#if message.edited}
			<button class="italic cursor-help" on:click={() => historyModal.showModal()}>
				{$t('chatbox.edited')}
			</button>
		{/if}
	</div>
</div>

<style>
	/* General styling for chat bubbles */
	.chat-bubble {
		white-space: normal;
		word-wrap: break-word;
		word-break: break-word;
		overflow-wrap: break-word;
	}

	/* Sent (blue) bubble styles */
	.chat-bubble.bg-blue-700 {
		background-color: #007bff;
		color: white;
	}

	.chat-bubble.bg-blue-700::after {
		content: '';
		position: absolute;
		bottom: 0;
		right: -8px;
		width: 0;
		height: 0;
		border-style: solid;
		border-width: 8px 0 8px 8px;
		border-color: transparent transparent transparent #007bff;
	}

	/* Received (gray) bubble styles */
	.chat-bubble.bg-gray-300 {
		background-color: #f1f1f1;
		color: #000;
	}

	.chat-bubble.bg-gray-300::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: -8px;
		width: 0;
		height: 0;
		border-style: solid;
		border-width: 8px 8px 8px 0;
		border-color: transparent #f1f1f1 transparent transparent;
	}

	/* Styling for "Replying to" text */
	.replying-to-text {
		cursor: pointer;
		display: flex;
		align-items: center;
		font-size: 0.65rem;
		color: #bbb;
		margin-bottom: 4px;
	}

	.replying-to-content {
		font-style: italic;
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
		max-width: 150px;
		font-size: 0.65rem;
		display: inline-block;
	}

	/* Sent bubble adjustment for "Replying to" text */
	.chat-bubble.bg-blue-700 .replying-to-text {
		color: rgb(196, 229, 240);
	}

	/* General chat layout adjustments */
	.chat {
		margin-bottom: 6px;
	}

	.chat-footer {
		font-size: 0.75rem;
		margin-top: 2px;
		opacity: 0.7;
	}

	/* Hover effects for reply icon */
	.reply-icon {
		position: absolute;
		right: -1.5rem;
		top: 50%;
		transform: translateY(-50%);
		cursor: pointer;
		opacity: 0;
		transition: opacity 0.2s;
	}

	.group:hover .reply-icon {
		opacity: 1;
	}

	/* Highlight animation for target messages */
	.chat:target {
		animation:
			highlight 1.5s ease-in-out,
			pulse 1.5s infinite;
	}

	@keyframes highlight {
		0% {
			background-color: rgba(255, 255, 0, 0.6);
		}
	}
</style>
