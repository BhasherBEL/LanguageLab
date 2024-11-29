<script lang="ts">
	import type Message from '$lib/types/message';
	import { displayTime } from '$lib/utils/date';
	import { Check, Icon, Pencil, ArrowUturnLeft } from 'svelte-hero-icons';
	import { user } from '$lib/types/user';
	import { t } from '$lib/services/i18n';
	import linkifyHtml from 'linkify-html';
	import { sanitize } from '$lib/utils/sanitize';
	import { initiateReply } from '$lib/utils/replyUtils';

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

	function truncateMessage(content: string, maxLength: number = 20): string {
    if (content.length > maxLength) {
        return content.slice(0, maxLength) + '...';
    }
    return content;
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
		data-is-sender={isSender}
	>
		{#if replyToMessage}
		<div class="replying-to-text">
			Replying to: <span class="replying-to-content">{truncateMessage(replyToMessage.content)}</span>
		</div>
		
		{/if}

		<div contenteditable={isEdit} bind:this={contentDiv}>
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
	.chat-bubble {
    white-space: normal; /* Allow text to wrap onto the next line */
    word-wrap: break-word; /* Break words if they are too long */
    word-break: break-word; /* Ensure long words are broken */
    overflow-wrap: break-word; /* Prevent overflow by wrapping */
}


	/* Adjust for sent (blue) bubbles */
	.chat-bubble.bg-blue-700 {
		background-color: #007bff;
		color: white;
	}

	.chat-bubble.bg-blue-700::after {
		content: '';
		position: absolute;
		bottom: 0;
		right: -8px; /* Position the arrow at the right side */
		width: 0;
		height: 0;
		border-style: solid;
		border-width: 8px 0 8px 8px; /* Create a triangle */
		border-color: transparent transparent transparent #007bff; /* Match bubble color */
	}

	/* Adjust for received (gray) bubbles */
	.chat-bubble.bg-gray-300 {
		background-color: #f1f1f1;
		color: #000;
	}

	.chat-bubble.bg-gray-300::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: -8px; /* Position the arrow at the left side */
		width: 0;
		height: 0;
		border-style: solid;
		border-width: 8px 8px 8px 0; /* Create a triangle */
		border-color: transparent #f1f1f1 transparent transparent; /* Match bubble color */
	}

	/* Replying-to text compact styling */
	.replying-to-text {
	display: flex; /* Use flexbox for proper alignment */
	align-items: center; /* Vertically align the text and content */
	font-size: 0.85rem; /* Adjust the text size */
	color: #bbb; /* Use a subtle color */
	margin-bottom: 4px; /* Add a small margin for spacing */
}

.replying-to-content {
	font-style: italic; /* Optionally italicize */
	text-overflow: ellipsis; /* Truncate long text */
	white-space: nowrap; /* Prevent wrapping */
	overflow: hidden; /* Ensure no overflow */
	max-width: 150px; /* Set a maximum width */
	display: inline-block; /* Ensure inline alignment */
}



	/* When the bubble is blue (sent by the user) */
	.chat-bubble.bg-blue-700 .replying-to-text {
		color: rgb(196, 229, 240); /* Use lighter color for "Replying to" */
	}

	/* Compact reply input */
	.reply-input-container {
		display: flex;
		align-items: center;
		margin-top: 0.5rem;
		gap: 0.3rem; /* Reduce gap between input and button */
	}

	.message-input {
		flex: 1;
		padding: 6px 10px; /* Reduce input box padding */
		border: 1px solid #ccc;
		border-radius: 5px;
		font-size: 0.9rem; /* Adjust font size for smaller input box */
	}

	.send-button {
		background-color: #007bff;
		color: white;
		padding: 6px 10px; /* Adjust padding for smaller button */
		border: none;
		border-radius: 5px;
		font-size: 0.9rem; /* Adjust font size */
		cursor: pointer;
	}

	/* Adjust chat layout */
	.chat {
		margin-bottom: 6px; /* Reduce spacing between messages */
	}

	.chat-footer {
		font-size: 0.75rem; /* Smaller timestamp text */
		margin-top: 2px; /* Less space above timestamp */
		opacity: 0.7; /* Slightly faded text */
	}

	/* General hover effect for buttons */
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
		opacity: 1; /* Make visible on hover */
	}
</style>
