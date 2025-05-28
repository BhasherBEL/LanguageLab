<script lang="ts">
	import { displayTime } from '$lib/utils/date';
	import { ArrowUturnLeft, Check, Icon, Pencil } from 'svelte-hero-icons';
	import { t } from '$lib/services/i18n';
	import { onMount } from 'svelte';
	import SpellCheck from '$lib/components/icons/spellCheck.svelte';
	import ChatBubble from '$lib/components/icons/chatBubble.svelte';
	import type Feedback from '$lib/types/feedback';
	import linkifyHtml from 'linkify-html';
	import { sanitize } from '$lib/utils/sanitize';
	import CloseIcon from '$lib/components/icons/closeIcon.svelte';
	import Message from '$lib/types/message';
	import type User from '$lib/types/user';
	import { get } from 'svelte/store';
	import { highlightedMessageId } from '$lib/stores/messageHighlight';

	let {
		user,
		message,
		replyTo = $bindable(),
		chatClosed = false
	}: { user: User; message: Message; replyTo: Message | undefined; chatClosed: boolean } = $props();

	let displayedTime = $state(displayTime(message.created_at));

	setInterval(() => {
		displayedTime = displayTime(message.created_at);
	}, 1000);

	let isEdit = $state(false);

	let replyToMessage: Message | undefined = $state(message.replyToMessage);

	let contentDiv: HTMLDivElement | null = $state(null);
	let historyModal: HTMLDialogElement;
	let messageVersions = $state(message.versions);

	let showButtonsTimeout: number | null = $state(null);

	function startEdit() {
		isEdit = true;
		setTimeout(() => {
			if (!contentDiv) return;
			contentDiv.focus();
		}, 0);
	}

	async function endEdit(validate = true) {
		if (!contentDiv) return;

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
		if (content.length <= maxLength) return content;
		return content.slice(0, maxLength) + '...';
	}
	let hightlight: HTMLDivElement;

	onMount(() => {
		document.addEventListener('selectionchange', onTextSelect);
	});

	function getSelectionCharacterOffsetWithin() {
		if (!contentDiv) return { start: 0, end: 0 };

		var start = 0;
		var end = 0;
		var doc = contentDiv.ownerDocument;
		var win = doc.defaultView;
		if (!doc || !win) return { start: 0, end: 0 };
		var sel;
		if (typeof win.getSelection === 'undefined') {
			return { start: 0, end: 0 };
		}
		sel = win.getSelection();
		if (!sel) return { start: 0, end: 0 };
		if (sel.rangeCount <= 0) return { start: 0, end: 0 };

		var range = sel.getRangeAt(0);
		var preCaretRange = range.cloneRange();
		preCaretRange.selectNodeContents(contentDiv);
		preCaretRange.setEnd(range.startContainer, range.startOffset);
		start = preCaretRange.toString().length;
		preCaretRange.setEnd(range.endContainer, range.endOffset);
		end = preCaretRange.toString().length;

		return { start: start, end: end };
	}

	function onTextSelect() {
		if (isEdit || chatClosed) return;
		const selection = window.getSelection();
		if (!selection || selection.rangeCount < 1 || !hightlight) return;
		const range = selection.getRangeAt(0);

		// Clear any existing timeout
		if (showButtonsTimeout) {
			clearTimeout(showButtonsTimeout);
			showButtonsTimeout = null;
		}

		// Check if the selection is within the contentDiv (including nested elements)
		const isWithinContentDiv =
			contentDiv &&
			(contentDiv.contains(range.commonAncestorContainer) ||
				range.commonAncestorContainer === contentDiv ||
				(range.commonAncestorContainer.nodeType === Node.TEXT_NODE &&
					contentDiv.contains(range.commonAncestorContainer.parentElement)));

		if (isWithinContentDiv && !selection.isCollapsed) {
			const rects = range.getClientRects();
			if (!rects.length) {
				hightlight.style.visibility = 'hidden';
				return;
			}
			const rect = rects[rects.length - 1]; // Use last rect for end of selection
			if (!rect) {
				hightlight.style.visibility = 'hidden';
				return;
			}
			// Position to the right of the selection, vertically centered
			const rightX = rect.right + 8;
			const centerY = rect.top + rect.height / 2 - hightlight.clientHeight / 2;

			hightlight.style.top = centerY + 'px';
			hightlight.style.left = rightX + 'px';

			// Show buttons after a short delay (300ms)
			showButtonsTimeout = setTimeout(() => {
				if (hightlight) {
					hightlight.style.visibility = 'visible';
				}
			}, 300);
		} else {
			hightlight.style.visibility = 'hidden';
		}
	}

	async function onSelect(hasComment: boolean) {
		const selection = window.getSelection();
		if (!selection) {
			if (hightlight) hightlight.style.visibility = 'hidden';
			return;
		}
		const range = getSelectionCharacterOffsetWithin();

		const start = range.start;
		const end = range.end;
		let comment: string | null = null;

		if (hasComment) {
			comment = prompt($t('chatbox.comment'));
			if (!comment) return;
		}

		const res = await message.addFeedback(start, end, comment);

		if (res) {
			selection.removeAllRanges();
			hightlight.style.visibility = 'hidden';
			// Clear any pending timeout
			if (showButtonsTimeout) {
				clearTimeout(showButtonsTimeout);
				showButtonsTimeout = null;
			}
		}
	}

	function getParts(content: string, feedbacks: Feedback[]) {
		let parts: { text: string; feedback: Feedback | null }[] = [];
		let current = 0;
		feedbacks.sort((a: Feedback, b: Feedback) => a.start - b.start);
		for (const feedback of feedbacks) {
			if (feedback.start > current) {
				parts.push({ text: content.slice(current, feedback.start), feedback: null });
			}
			parts.push({ text: content.slice(feedback.start, feedback.end), feedback });
			current = feedback.end;
		}
		if (current < content.length) {
			parts.push({ text: content.slice(current), feedback: null });
		}

		return parts;
	}

	let fbs = $state([] as Feedback[]);
	let parts = $state([] as { text: string; feedback: Feedback | null }[]);
	fbs = get(message.feedbacks);
	message.feedbacks.subscribe((value) => {
		fbs = value;
		parts = getParts(message.content, fbs);
	});

	const isSender = message.user.id == user.id;

	// Reactive variable for highlighting
	let isHighlighted = $state(false);

	// Subscribe to highlighted message changes
	$effect(() => {
		const unsubscribe = highlightedMessageId.subscribe((highlightedId) => {
			isHighlighted = highlightedId === message.uuid;
		});
		return unsubscribe;
	});

	async function deleteFeedback(feedback: Feedback | null) {
		if (!feedback) return;
		if (!confirm($t('chatbox.deleteFeedback'))) return;

		await message.deleteFeedback(feedback);
	}
</script>

<div
	class="chat group scroll-smooth rounded-xl transition-colors duration-300"
	class:bg-gray-200={isHighlighted}
	class:target:bg-gray-200={!isHighlighted}
	class:chat-start={!isSender}
	class:chat-end={isSender}
	id={message.uuid}
	data-message-id={message.uuid}
>
	<div class="rounded-full mx-2 chat-image size-12" title={message.user.nickname}>
		<img
			src={`https://gravatar.com/avatar/${message.user.emailHash}?d=identicon`}
			alt={user.nickname}
			class="rounded-full border border-neutral-400 text-sm"
		/>
	</div>

	<div class="chat-bubble text-black" class:bg-blue-50={isSender} class:bg-gray-300={!isSender}>
		{#if replyToMessage}
			<a
				href={`#${replyToMessage.uuid}`}
				class="flex items-center text-[0.65rem] text-gray-400 mb-1 cursor-pointer"
				aria-label="Scroll to replied message"
			>
				{$t('chatbox.replyingTo')}
				<span
					class="italic truncate whitespace-nowrap overflow-hidden max-w-[150px] text-[0.65rem] inline-block"
				>
					{truncateMessage(replyToMessage?.content)}
				</span>
			</a>
		{/if}

		{#if isEdit}
			<div
				contenteditable="true"
				bind:this={contentDiv}
				class="bg-blue-50 whitespace-pre-wrap min-h-8 p-2 text-lg"
			>
				{message.content}
			</div>
			<button
				class="float-end border rounded-full px-4 py-2 mt-2 bg-white text-blue-700"
				onclick={() => endEdit()}
			>
				{$t('button.save')}
			</button>
			<button
				class="float-end border rounded-full px-4 py-2 mt-2 mr-2"
				onclick={() => endEdit(false)}
			>
				{$t('button.cancel')}
			</button>
		{:else}
			<div class="whitespace-pre-wrap text-lg" bind:this={contentDiv}>
				{#each parts as part}
					{#if isEdit || !part.feedback}
						{@html linkifyHtml(sanitize(part.text), { className: 'underline', target: '_blank' })}
					{:else}
						<span
							class="underline relative decoration-wavy hover:cursor-help group/feedback"
							class:decoration-blue-500={part.feedback.content}
							class:decoration-red-500={!part.feedback.content}
							role="button"
							tabindex="0"
						>
							<div
								class="absolute group-hover/feedback:flex hidden bg-gray-800 text-white text-sm h-6 items-center rounded left-1/2 -translate-x-1/2 -top-8 px-2 z-20 whitespace-nowrap"
							>
								{part.feedback.content}
								{#if part.feedback.content}
									<button
										aria-label="close"
										class="ml-1 hover:bg-gray-700 border border-transparent rounded p-0.5"
										onclick={() => deleteFeedback(part.feedback)}
									>
										<CloseIcon />
									</button>
								{/if}
							</div>
							{part.text}
						</span>
					{/if}
				{/each}
			</div>
		{/if}
		{#if !chatClosed}
			{#if isSender}
				<button
					class="absolute bottom-0 left-[-1.5rem] invisible group-hover:visible h-full p-0"
					onclick={() => (isEdit ? endEdit() : startEdit())}
				>
					<Icon src={Pencil} class="w-5 h-full text-gray-500 hover:text-gray-800" />
				</button>
			{/if}
			<button
				class="absolute bottom-0 invisible group-hover:visible h-full p-0"
				class:right-[-1.5rem]={!isSender}
				class:left-[-3.5rem]={isSender}
				onclick={() => (replyTo = message)}
			>
				<Icon src={ArrowUturnLeft} class="w-5 h-full text-gray-500 hover:text-gray-800" />
			</button>
		{/if}
	</div>
	<div class="chat-footer opacity-50">
		<Icon src={Check} class="w-4 inline" />
		{displayedTime}
		{#if message.edited}
			<button class="italic cursor-help" onclick={() => historyModal.showModal()}>
				{$t('chatbox.edited')}
			</button>
		{/if}
	</div>
</div>

<div
	class="fixed invisible z-50 rounded-lg border border-gray-400 bg-white shadow-lg flex"
	bind:this={hightlight}
>
	<button
		onclick={() => onSelect(false)}
		class="p-2 hover:bg-blue-100 rounded-l-lg transition-colors duration-200 flex items-center justify-center w-8 h-8"
		title="Add underline feedback"
		aria-label="Add underline feedback"
	>
		<SpellCheck />
	</button>
	<div class="w-px bg-gray-200"></div>
	<button
		onclick={() => onSelect(true)}
		class="p-2 hover:bg-blue-100 rounded-r-lg transition-colors duration-200 flex items-center justify-center w-8 h-8"
		title="Add comment feedback"
		aria-label="Add comment feedback"
	>
		<ChatBubble />
	</button>
</div>

<dialog bind:this={historyModal} class="modal">
	<div class="modal-box">
		<h3 class="text-xl">{$t('chatbox.history')}</h3>
		<div>
			{#each $messageVersions as version}
				<div class="flex justify-between items-center border-b border-gray-300 py-1">
					<div>
						{version.content}
					</div>
					<div class="whitespace-nowrap">{displayTime(version.date)}</div>
				</div>
			{/each}
		</div>
		<div class="modal-action">
			<form method="dialog">
				<button class="btn btn-primary">{$t('button.close')}</button>
			</form>
		</div>
	</div>
</dialog>
