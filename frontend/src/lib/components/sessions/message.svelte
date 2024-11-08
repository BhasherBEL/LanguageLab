<script lang="ts">
	import type Message from '$lib/types/message';
	import { displayTime } from '$lib/utils/date';
	import { Check, Icon, Pencil } from 'svelte-hero-icons';
	import { user } from '$lib/types/user';
	import Gravatar from 'svelte-gravatar';
	import { t } from '$lib/services/i18n';
	import { onMount } from 'svelte';
	import SpellCheck from '$lib/components/icons/spellCheck.svelte';
	import ChatBubble from '../icons/chatBubble.svelte';
	import type Feedback from '$lib/types/feedback';
	import linkifyHtml from 'linkify-html';
	import { sanitize } from '$lib/utils/sanitize';

	export let message: Message;

	let timer: number;
	$: displayedTime = displayTime(message.created_at);
	$: {
		clearInterval(timer);
		timer = setInterval(() => {
			displayedTime = displayTime(message.created_at);
		}, 1000);
	}
	let isEdit = false;
	let contentDiv: HTMLDivElement;
	let historyModal: HTMLDialogElement;
	$: messageVersions = message.versions;

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

	let hightlight: HTMLDivElement;

	onMount(() => {
		document.addEventListener('selectionchange', onTextSelect);
	});

	function getSelectionCharacterOffsetWithin() {
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
		if (isEdit) return;
		const selection = window.getSelection();
		if (!selection || selection.rangeCount < 1 || !hightlight) return;
		const range = selection.getRangeAt(0);
		const start = range.startOffset;
		const end = range.endOffset;
		if (range.commonAncestorContainer.parentElement === contentDiv && end - start > 0) {
			const rects = range.getClientRects();
			if (!rects.length) {
				hightlight.style.visibility = 'hidden';
				return;
			}
			const rect = rects[rects.length - 1];
			if (!rect) {
				hightlight.style.visibility = 'hidden';
				return;
			}
			hightlight.style.top = (rect.top + rect.bottom - hightlight.clientHeight) / 2 + 'px';
			hightlight.style.left = rect.right + 10 + 'px';
			hightlight.style.visibility = 'visible';
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

	$: fbs = message.feedbacks;
	$: parts = getParts(message.content, $fbs);

	const isSender = message.user.id == $user?.id;
</script>

<div class="chat group" class:chat-start={!isSender} class:chat-end={isSender}>
	<div class="rounded-full mx-2 chat-image size-12" title={message.user.nickname}>
		<Gravatar
			email={message.user.email}
			size={64}
			title={message.user.nickname}
			class="rounded-full"
		/>
	</div>
	<div class="chat-bubble text-black" class:bg-blue-200={isSender} class:bg-gray-300={!isSender}>
		{#if isEdit}
			<div
				contenteditable="true"
				bind:this={contentDiv}
				class="bg-blue-200 whitespace-pre-wrap min-h-8"
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
					{:else if part.feedback.content}
						<span class="tooltip tooltip-accent" data-tip={part.feedback.content}
							><!--
						--><span class="underline decoration-wavy decoration-blue-500 hover:cursor-help"
								><!--
						-->{part.text}<!--
					--></span
							><!--
					--></span
						>
					{:else}
						<span class="underline decoration-wavy decoration-red-500 decoration-1"
							><!--
						-->{part.text}<!--
					--></span
						>
					{/if}
				{/each}
			</div>
		{/if}
		{#if isSender}
			<button
				class="absolute bottom-2 left-[-1.5rem] invisible group-hover:visible"
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
			<button class="italic cursor-help" on:click={historyModal.showModal()}>
				{$t('chatbox.edited')}
			</button>
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
		{/if}
	</div>
</div>

<div class="absolute invisible rounded-full border-black border bg-white" bind:this={hightlight}>
	<button
		on:click={() => onSelect(false)}
		class="bg-opacity-0 bg-blue-500 hover:bg-opacity-50 p-2 pl-4 rounded-l-full"
	>
		<SpellCheck />
	</button><!---
	--><button
		on:click={() => onSelect(true)}
		class="bg-opacity-0 bg-blue-500 hover:bg-opacity-50 p-2 pr-4 rounded-r-full"
	>
		<ChatBubble />
	</button>
</div>
