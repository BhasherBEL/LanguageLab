<script lang="ts">
	import config from '$lib/config';
	import { t } from '$lib/services/i18n';
	import type Session from '$lib/types/session';
	import { toastAlert } from '$lib/utils/toasts';
	import { Icon, PaperAirplane } from 'svelte-hero-icons';
	import { user, users } from '$lib/types/user';
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

	async function sendMessage() {
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

		session.sendTyping(get(users));
	}
</script>

<div class="w-full">
	<ul class="flex justify-around divide-x-2 border-y-2 py-1">
		{#each config.SPECIAL_CHARS as char (char)}
			<button
				class="border-none"
				on:click={() => {
					message += char;
				}}
			>
				<kbd class="kbd">
					{char}
				</kbd>
			</button>
		{/each}
		<kbd
			class="kbd"
			on:click={() => (showPicker = !showPicker)}
			data-tooltip-target="tooltip-emoji"
			data-tooltip-placement="right"
			data-riple-light="true"
			aria-hidden={false}
			role="button"
			tabindex="0"
		>
			😀
		</kbd>
		<div class="relative">
			<div
				id="tooltip-emoji"
				data-tooltip="tooltip-emoji"
				role="tooltip"
				class:hidden={!showPicker}
				class="absolute z-10 tooltip bottom-0 left-0"
			>
				<emoji-picker class="light" on:emoji-click={(event) => (message += event.detail.unicode)}>
				</emoji-picker>
			</div>
		</div>
	</ul>
	<div class="w-full flex">
		<textarea
			class="flex-grow rounded-md p-2 resize-none overflow-y-hidden"
			placeholder={$t('chatbox.placeholder')}
			bind:value={message}
			on:keypress={(e) => keyPress(e)}
			on:keypress={async (e) => {
				if (e.key === 'Enter' && !e.shiftKey) {
					await sendMessage();
				} else {
					keyPress(e);
				}
			}}
		/>
		<button class="btn btn-primary size-16" on:click={sendMessage}>
			<Icon src={PaperAirplane} />
		</button>
	</div>
</div>
