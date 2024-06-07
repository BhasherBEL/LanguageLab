<script lang="ts">
	import type Message from '$lib/types/message';
	import { displayTime } from '$lib/utils/date';
	import { Check, Icon, Pencil } from 'svelte-hero-icons';
	import { user } from '$lib/types/user';
	import Gravatar from 'svelte-gravatar';
	import { t } from '$lib/services/i18n';

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
			{message.content}
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
								<div>{version.content}</div>
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
