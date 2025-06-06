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

		const selection = window.getSelection();
		if (!selection || selection.rangeCount === 0) return { start: 0, end: 0 };

		const range = selection.getRangeAt(0);
		
		// Get the original message content for position calculation
		const originalContent = message.content;
		
		try {
			// Get all text content from the contentDiv to reconstruct the original text
			const allTextContent = contentDiv.textContent || '';
			
			// If the text content doesn't match the original, something is wrong
			if (allTextContent !== originalContent) {
				console.warn('Text content mismatch:', { allTextContent, originalContent });
				// Fallback: try to use the range's toString() method and find it in original content
				const selectedText = range.toString();
				const startIndex = originalContent.indexOf(selectedText);
				if (startIndex !== -1) {
					return { start: startIndex, end: startIndex + selectedText.length };
				}
				return { start: 0, end: 0 };
			}

			// Create a temporary range to calculate positions
			const tempRange = document.createRange();
			tempRange.selectNodeContents(contentDiv);
			
			// Calculate start position
			const beforeRange = tempRange.cloneRange();
			beforeRange.setEnd(range.startContainer, range.startOffset);
			const start = beforeRange.toString().length;
			
			// Calculate end position
			beforeRange.setEnd(range.endContainer, range.endOffset);
			const end = beforeRange.toString().length;

			// Ensure positions are within bounds
			const finalStart = Math.max(0, Math.min(start, originalContent.length));
			const finalEnd = Math.max(finalStart, Math.min(end, originalContent.length));

			// Debug logging
			console.log('Selection calculation:', {
				originalContent: originalContent,
				selectedText: originalContent.slice(finalStart, finalEnd),
				rangeText: range.toString(),
				start: finalStart,
				end: finalEnd,
				textContentMatch: allTextContent === originalContent
			});

			return { start: finalStart, end: finalEnd };

		} catch (error) {
			console.error('Error calculating selection offset:', error);
			// Fallback: try to find the selected text in the original content
			const selectedText = range.toString();
			const startIndex = originalContent.indexOf(selectedText);
			if (startIndex !== -1) {
				return { start: startIndex, end: startIndex + selectedText.length };
			}
			return { start: 0, end: 0 };
		}
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
		
		console.log('onSelect called with hasComment:', hasComment);
		console.log('Current selection:', selection.toString());
		
		const range = getSelectionCharacterOffsetWithin();
		console.log('Calculated range:', range);

		const start = range.start;
		const end = range.end;
		let comment: string | null = null;

		if (hasComment) {
			comment = prompt($t('chatbox.comment'));
			if (!comment) return;
		}

		console.log('Adding feedback:', { start, end, comment, messageId: message.id });
		const res = await message.addFeedback(start, end, comment);
		console.log('Feedback result:', res);

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
		if (feedbacks.length === 0) {
			return [{ text: content, feedback: null, allFeedbacks: [] }];
		}

		// Create an array to track all feedback boundaries
		const boundaries: { position: number; type: 'start' | 'end'; feedback: Feedback }[] = [];
		
		feedbacks.forEach(feedback => {
			boundaries.push({ position: feedback.start, type: 'start', feedback });
			boundaries.push({ position: feedback.end, type: 'end', feedback });
		});

		// Sort boundaries by position, with 'end' events before 'start' events at the same position
		boundaries.sort((a, b) => {
			if (a.position !== b.position) {
				return a.position - b.position;
			}
			// If positions are equal, process 'end' before 'start' to handle adjacent ranges
			return a.type === 'end' ? -1 : 1;
		});

		const parts: { text: string; feedback: Feedback | null; allFeedbacks: Feedback[] }[] = [];
		let currentPos = 0;
		const activeFeedbacks: Feedback[] = [];

		boundaries.forEach(boundary => {
			// Add text part before this boundary if there's content
			if (boundary.position > currentPos) {
				const text = content.slice(currentPos, boundary.position);
				// Use the first active feedback (prioritize by order they were added)
				const activeFeedback = activeFeedbacks.length > 0 ? activeFeedbacks[0] : null;
				parts.push({ text, feedback: activeFeedback, allFeedbacks: [...activeFeedbacks] });
			}

			// Update active feedbacks
			if (boundary.type === 'start') {
				activeFeedbacks.push(boundary.feedback);
			} else {
				const index = activeFeedbacks.findIndex(f => f.id === boundary.feedback.id);
				if (index !== -1) {
					activeFeedbacks.splice(index, 1);
				}
			}

			currentPos = boundary.position;
		});

		// Add remaining text if any
		if (currentPos < content.length) {
			parts.push({ text: content.slice(currentPos), feedback: null, allFeedbacks: [] });
		}

		const result = parts.filter(part => part.text.length > 0);
		
		return result;
	}

	let fbs = $state([] as Feedback[]);
	let parts = $state([] as { text: string; feedback: Feedback | null; allFeedbacks: Feedback[] }[]);
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
							class:decoration-blue-500={part.allFeedbacks.some(f => f.content)}
							class:decoration-red-500={part.allFeedbacks.every(f => !f.content)}
							role="button"
							tabindex="0"
						>
							<div
								class="absolute group-hover/feedback:flex hidden bg-gray-800 text-white text-sm rounded left-1/2 -translate-x-1/2 -top-2 px-2 py-1 z-20 whitespace-nowrap max-w-xs"
								style="transform: translateX(-50%) translateY(-100%);"
							>
								{#if part.allFeedbacks.length === 1}
									<!-- Single feedback -->
									<div class="flex items-center">
										{part.allFeedbacks[0].content || 'Marked text'}
										{#if part.allFeedbacks[0].content}
											<button
												aria-label="close"
												class="ml-1 hover:bg-gray-700 border border-transparent rounded p-0.5"
												onclick={() => deleteFeedback(part.allFeedbacks[0])}
											>
												<CloseIcon />
											</button>
										{/if}
									</div>
								{:else}
									<!-- Multiple overlapping feedbacks -->
									<div class="flex flex-col gap-1 max-w-xs">
										{#each part.allFeedbacks as feedback, index}
											<div class="flex items-center text-xs border-b border-gray-600 pb-1 last:border-b-0">
												<span class="flex-1 truncate">
													{feedback.content || 'Marked text'}
												</span>
												{#if feedback.content}
													<button
														aria-label="close"
														class="ml-1 hover:bg-gray-700 border border-transparent rounded p-0.5"
														onclick={() => deleteFeedback(feedback)}
													>
														<CloseIcon />
													</button>
												{/if}
											</div>
										{/each}
									</div>
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
