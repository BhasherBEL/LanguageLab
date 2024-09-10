<script lang="ts">
	import config from '$lib/config';
	import { t } from '$lib/services/i18n';
	import type Session from '$lib/types/session';
	import { toastAlert } from '$lib/utils/toasts';
	import { Icon, PaperAirplane } from 'svelte-hero-icons';
	import { user } from '$lib/types/user';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';

	onMount(async () => {
		await import('emoji-picker-element');
	});

	export let session: Session;

	let metadata: { message: string; date: number }[] = [];
	let lastMessage = '';
	let message = '';
	let showPicker = false;
	let showSpecials = false;
	let textearea: HTMLTextAreaElement;

	let us = get(user);
	let disabled =
		us == null ||
		session.users.find((u) => us.id === u.id) === undefined ||
		new Date().getTime() > session.end_time.getTime() + 3600000 ||
		new Date().getTime() < session.start_time.getTime() - 3600000;

	async function sendMessage() {
		message = message.trim();
		if (message.length == 0) return;

		if ($user === null) return;

		const m = await session.sendMessage($user, message, metadata);

		if (m === null) {
			toastAlert($t('chatbox.sendError'));
			return;
		}

		message = '';
		metadata = [];
	}

	function keyPress() {
		if (message === lastMessage) return;

		metadata.push({ message: message, date: new Date().getTime() });
		lastMessage = message;

		session.sendTyping();
	}
</script>

<div class="w-full border-t-2">
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
			class="flex-grow p-2 resize-none overflow-y-hidden pr-16"
			placeholder={disabled ? $t('chatbox.disabled') : $t('chatbox.placeholder')}
			{disabled}
			bind:value={message}
			on:keypress={(e) => keyPress()}
			on:keypress={async (e) => {
				if (e.key === 'Enter' && !e.shiftKey) {
					await sendMessage();
				} else {
					keyPress();
				}
			}}
		/>
		<div
			class="absolute top-1/2 right-20 transform -translate-y-1/2 text-lg select-none cursor-pointer"
			on:click={() => (showPicker = !showPicker)}
			data-tooltip-target="tooltip-emoji"
			data-tooltip-placement="right"
			data-riple-light="true"
			aria-hidden={false}
			role="button"
			tabindex="0"
		>
			😀
		</div>
		<div class="relative">
			<div
				id="tooltip-emoji"
				data-tooltip="tooltip-emoji"
				role="tooltip"
				class:hidden={!showPicker}
				class="absolute z-10 tooltip bottom-16 right-0 lg:left-0 lg:right-auto"
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
