<script lang="ts">
	import config from '$lib/config';
	import { t } from '$lib/services/i18n';
	import { toastAlert } from '$lib/utils/toasts';
	import { Icon, PaperAirplane } from 'svelte-hero-icons';
	import { onMount } from 'svelte';
	import autosize from 'svelte-autosize';
	import type User from '$lib/types/user';

	onMount(async () => {
		await import('emoji-picker-element');
	});

	const { user, session } = $props();

	let metadata: { message: string; date: number }[] = [];
	let lastMessage = '';
	let message = $state('');
	let showPicker = $state(false);
	let showSpecials = $state(false);
	let textearea: HTMLTextAreaElement;

	let disabled =
		session.users.find((u: User) => user.id === u.id) === undefined ||
		new Date().getTime() > session.end_time.getTime() + 3600000 ||
		new Date().getTime() < session.start_time.getTime() - 3600000;

	async function sendMessage() {
		message = message.trim();
		if (message.length == 0) return;

		const m = await session.sendMessage(user, message, metadata);

		if (m === null) {
			toastAlert($t('chatbox.sendError'));
			return;
		}

		message = '';
		metadata = [];
		setTimeout(() => {
			autosize.update(textearea);
		}, 10);
	}

	function keyPress() {
		if (message === lastMessage) return;

		metadata.push({ message: message, date: new Date().getTime() });
		lastMessage = message;

		session.sendTyping();
	}
</script>

<div class="w-full mb-2">
	{#if showSpecials}
		<ul class="flex justify-around divide-x-2 border-b-2 py-1 flex-wrap md:flex-nowrap">
			{#each config.SPECIAL_CHARS as char (char)}
				<button
					class="border-none"
					onclick={() => {
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
	<div class="w-full flex items-center relative">
		<div
			class="text-2xl select-none cursor-pointer mx-4"
			onclick={() => (showPicker = !showPicker)}
			data-tooltip-target="tooltip-emoji"
			data-tooltip-placement="right"
			data-riple-light="true"
			aria-hidden={false}
			role="button"
			tabindex="0"
		>
			😀
		</div>
		<div>
			<div
				id="tooltip-emoji"
				data-tooltip="tooltip-emoji"
				role="tooltip"
				class:hidden={!showPicker}
				class="absolute z-10 tooltip bottom-16 right-0 lg:left-0 lg:right-auto"
			>
				<emoji-picker
					class="light"
					onemoji-click={(event: any) => {
						message += event.detail.unicode;
						textearea.focus();
					}}
				>
				</emoji-picker>
			</div>
		</div>
		<textarea
			bind:this={textearea}
			class="flex-grow p-2 resize-none overflow-hidden py-4 pr-12 border rounded-[32px]"
			placeholder={disabled ? $t('chatbox.disabled') : $t('chatbox.placeholder')}
			{disabled}
			use:autosize
			bind:value={message}
			rows={1}
			onkeypress={async (e) => {
				console.log(e);
				if (e.key === 'Enter' && !e.shiftKey) {
					await sendMessage();
				} else {
					keyPress();
				}
			}}
		></textarea>
		<div
			class="absolute right-28 kbd text-sm select-none cursor-pointer"
			onclick={() => (showSpecials = !showSpecials)}
			aria-hidden={false}
			role="button"
			tabindex="0"
		>
			É
		</div>
		<button class="btn btn-primary rounded-full size-14 mx-4" onclick={sendMessage}>
			<Icon src={PaperAirplane} />
		</button>
	</div>
</div>
