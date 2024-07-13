<script lang="ts">
	import type Message from '$lib/types/message';
	import { displayTime } from '$lib/utils/date';
	import {
		ChatBubbleBottomCenter,
		ChatBubbleBottomCenterText,
		Check,
		Icon,
		Pencil,
		PencilSquare
	} from 'svelte-hero-icons';
	import { user } from '$lib/types/user';
	import Gravatar from 'svelte-gravatar';
	import { t } from '$lib/services/i18n';
	import { onMount } from 'svelte';
	import SpellCheck from '$lib/components/icons/spellCheck.svelte';
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
		const selection = window.getSelection();
		if (!selection) return;
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
			hightlight.style.top = rect.bottom + 'px';
			hightlight.style.left = rect.right + 'px';
			hightlight.style.visibility = 'visible';
		} else {
			hightlight.style.visibility = 'hidden';
		}
	}

	async function onSpellSelect() {
		const selection = window.getSelection();
		if (!selection) {
			hightlight.style.visibility = 'hidden';
			return;
		}
		const range = getSelectionCharacterOffsetWithin();

		const start = range.start;
		const end = range.end;
		console.log(start, end);

		const res = await message.addSpellCheck(start, end);

		if (res) {
			selection.removeAllRanges();
			hightlight.style.visibility = 'hidden';
			contentDiv.innerHTML = sanitize(message.content)
				.replaceAll('¤µ', '<span class="decoration-wavy decoration-orange-500 underline">')
				.replaceAll('µ¤', '</span>');
		}
	}

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
	<div
		class="chat-bubble whitespace-pre-wrap"
		class:bg-blue-700={isSender}
		class:bg-gray-300={!isSender}
		class:text-black={!isSender}
		class:text-white={isSender}
	>
		<div contenteditable={isEdit} bind:this={contentDiv} class:bg-blue-900={isEdit}>
			{@html sanitize(message.content)
				.replaceAll('¤µ', '<span class="decoration-wavy decoration-orange-500 underline">')
				.replaceAll('µ¤', '</span>')}
		</div>
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
									{@html sanitize(version.content)
										.replaceAll(
											'¤µ',
											'<span class="decoration-wavy decoration-orange-500 underline">'
										)
										.replaceAll('µ¤', '</span>')}
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
		on:click={onSpellSelect}
		class="bg-opacity-0 bg-blue-500 hover:bg-opacity-50 p-2 pl-4 rounded-l-full"
	>
		<SpellCheck />
	</button><!---
	--><button
		class="bg-opacity-0 bg-blue-500 hover:bg-opacity-50 p-2 pr-4 rounded-r-full hover:cursor-not-allowed"
	>
		<Icon src={ChatBubbleBottomCenterText} size="20" />
	</button>
</div>
