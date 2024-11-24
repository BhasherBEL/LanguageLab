<script lang="ts">
	import type Message from '$lib/types/message';
	import { displayTime } from '$lib/utils/date';
	import { Check, Icon, Pencil, ArrowUturnLeft } from 'svelte-hero-icons';
	import { user } from '$lib/types/user';
	import { t } from '$lib/services/i18n';
	import linkifyHtml from 'linkify-html';
	import { sanitize } from '$lib/utils/sanitize';
	import { initiateReply } from '$lib/utils/replyUtils';

	export let message: Message; // Keep export if this is external

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

	let isReplying = false;

	let replyContent = '';

	async function sendReply() {}

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

	const isSender = message.user.id == $user?.id;
</script>

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
		{#if replyToMessage}
			<!-- Display the replied-to message context -->
			<div class="reply-to">
				<p class="replying-to-text">
					Replying to: <span class="replying-to-content">{replyToMessage.content}</span>
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

<!-- Reply Input -->
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
	/* Remove unused selectors */
	.reply-to {
		background-color: #e9f4ff;
		padding: 0.5rem;
		border-left: 3px solid #007bff;
		border-radius: 5px;
		margin-bottom: 0.5rem;
	}

	.replying-to-text {
		color: #555;
		font-size: 0.9rem;
	}

	.replying-to-content {
		font-weight: bold;
		color: #333;
	}

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
</style>
