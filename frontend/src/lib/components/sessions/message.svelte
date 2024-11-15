<script lang="ts">
	import type Message from '$lib/types/message';
	import { displayTime } from '$lib/utils/date';
	import { Check, Icon, Pencil, ArrowUturnLeft } from 'svelte-hero-icons';
	import { user } from '$lib/types/user';
	import { t } from '$lib/services/i18n';
	import { onMount } from 'svelte';
	import SpellCheck from '$lib/components/icons/spellCheck.svelte';
	import ChatBubble from '../icons/chatBubble.svelte';
	import type Feedback from '$lib/types/feedback';
	import linkifyHtml from 'linkify-html';
	import { sanitize } from '$lib/utils/sanitize';
	import { initiateReply } from '$lib/utils/replyUtils';

	export let message: Message;
	export let messages: Message[];

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
	let historyModal: HTMLDialogElement;
	$: messageVersions = message.versions;

	let isReplying = false;
	let replyingToMessage: Message | null = null; // Store the entire message object being replied to

	let replyingTo: Message | null = null;
	let replyContent = '';

	async function sendReply() {}

	function cancelReply() {
		isReplying = false;
		replyingToMessage = null; // Clear the reply state
	}

	async function findMessageById(id: string): Promise<Message | null> {
		try {
			console.log('Finding message by id:', id);
			const resolvedMessage = await message.getMessageById(Number(id));
			console.log('Resolved Message:', resolvedMessage);
			return resolvedMessage;
		} catch (error) {
			console.error(`Error resolving message ID ${id}:`, error);
			return null;
		}
	}

	function startEdit() {
		isEdit = true;
		setTimeout(() => {
			if (!contentDiv) return;
			contentDiv.focus();
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

	const isSender = message.user.id == $user?.id;
</script>

<!-- Display the replied-to message context -->
{#if replyToMessage}
	<div class="reply-context">
		<p class="replying-to-label">Replying to:</p>
		<p class="replying-to-content">{replyToMessage.content}</p>
	</div>
{/if}

<!-- Messages Display -->
<div class="chat group" class:chat-start={!isSender} class:chat-end={isSender}>
	<div class="rounded-full mx-2 chat-image size-12" title={message.user.nickname}></div>
	<div
		class="chat-bubble whitespace-pre-wrap"
		class:bg-blue-700={isSender}
		class:bg-gray-300={!isSender}
		class:text-black={!isSender}
		class:text-white={isSender}
	>
		{#if message.replyTo}
			<!-- Display Original Message if this is a Reply -->
			<div class="reply-to">
				<p class="replying-to-text">
					Replying to: <span class="replying-to-content"
						>{findMessageById(message.replyTo)?.content}</span
					>
				</p>
			</div>
		{/if}
		<div contenteditable={isEdit} bind:this={contentDiv} class:bg-blue-900={isEdit}>
			{@html linkifyHtml(sanitize(message.content), { className: 'underline', target: '_blank' })}
		</div>

		<button class="reply-icon" on:click={() => initiateReply(message)}>
			<Icon src={ArrowUturnLeft} class="w-4 h-4 text-gray-800" />
		</button>

		{#if isEdit}
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
		{/if}
		{#if isSender}
			<button
				class="absolute left-[-1.5rem] mt-2 mr-2 invisible group-hover:visible"
				on:click={() => (isEdit ? endEdit() : startEdit())}
			>
				<Icon src={Pencil} class="w-4 h-4 text-gray-800" />
			</button>
		{/if}
	</div>
	<div class="chat-footer opacity-50">
		<Icon src={Check} class="w-4 inline" />
		{displayedTime}
		{#if message.edited}
			<span class="italic">Edited</span>
		{/if}
	</div>
</div>

<!-- Reply Input (shown only when actively replying) -->
{#if isReplying}
	<div class="reply-input-container">
		<input
			type="text"
			placeholder="Type your reply..."
			bind:value={replyContent}
			class="message-input"
		/>
		<button class="send-button" on:click={sendReply}>Send</button>
	</div>
{/if}

<style>
	/* Style the reply preview when replying to a specific message */
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
	/* Chat message bubble */
	.chat-bubble {
		padding: 0.75rem;
		margin-bottom: 0.5rem;
		border-radius: 10px;
		position: relative;
	}
	.reply-to {
		background-color: #e9f4ff;
		padding: 0.5rem;
		border-left: 3px solid #007bff;
		border-radius: 5px;
		margin-bottom: 0.5rem;
	}
	/* Positioning and styling for reply icon */
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
	/* Input area for reply message */
	.reply-input-container {
		display: flex;
		align-items: center;
		margin-top: 0.5rem;
		gap: 0.5rem;
	}
	.message-input {
		flex: 1;
		padding: 8px;
		border: 1px solid #ccc;
		border-radius: 5px;
	}
	.send-button {
		background-color: #007bff;
		color: white;
		padding: 8px 12px;
		border: none;
		border-radius: 5px;
		cursor: pointer;
	}
	.reply-context {
		padding: 0.5rem;
		background-color: #f3f4f6;
		border-left: 3px solid #007bff;
		margin-bottom: 0.5rem;
		border-radius: 5px;
		font-size: 0.9rem;
		color: #555;
	}

	.replying-to-label {
		font-weight: bold;
		margin-bottom: 0.2rem;
	}

	.replying-to-content {
		color: #333;
		font-style: italic;
	}
</style>
