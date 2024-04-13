<script lang="ts">
	import config from '$lib/config';
	import { t } from '$lib/services/i18n';
	import type Session from '$lib/types/session';
	import { toastAlert } from '$lib/utils/toasts';
	import { Icon, PaperAirplane } from 'svelte-hero-icons';
	import { user } from '$lib/types/user';

	export let session: Session;

	let metadata: { message: string; date: number }[] = [];
	let lastMessage = '';
	let message = '';

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

	function keyPress(e: KeyboardEvent) {
		if (message === lastMessage) return;

		metadata.push({ message: message, date: new Date().getTime() });
		lastMessage = message;
	}
</script>

<div class="w-full">
	<ul class="h-10 flex justify-around border-y-2 divide-x-2">
		{#each config.SPECIAL_CHARS as char (char)}
			<button
				class="flex-grow hover:bg-gray-100"
				on:click={() => {
					message += char;
				}}>{char}</button
			>
		{/each}
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
		<button class="valid w-12 button !rounded-none !rounded-br-lg" on:click={sendMessage}>
			<Icon src={PaperAirplane} />
		</button>
	</div>
</div>
