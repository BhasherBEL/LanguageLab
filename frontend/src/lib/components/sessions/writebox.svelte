<script lang="ts">
	import { _ } from '$lib/services/i18n';
	import JWTSession from '$lib/stores/JWTSession';
	import type Session from '$lib/types/session';
	import { toastAlert } from '$lib/utils/toasts';
	import { Icon, PaperAirplane } from 'svelte-hero-icons';

	export let session: Session;

	let metadata: { message: string; date: number }[] = [];
	let lastMessage = '';
	let message = '';

	async function sendMessage() {
		if (message.length == 0) return;

		const user = JWTSession.user();
		if (user === null || user == undefined) return;

		const m = await session.sendMessage(user, message, metadata);

		if (m === null) {
			toastAlert($_('chatbox.sendError'));
			return;
		}

		message = '';
		metadata = [];
	}

	function keyPress(e: KeyboardEvent) {
		if (message === lastMessage) return;

		metadata.push({ message: message, date: new Date().getTime() });
		lastMessage = message;

		console.log('metadata', metadata);
	}
</script>

<textarea
	class="flex-grow border-2 border-gray-300 rounded-md p-2 resize-none overflow-y-hidden"
	placeholder={$_('chatbox.placeholder')}
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
<button class="w-12 button rounded-md" on:click={sendMessage}>
	<Icon src={PaperAirplane} />
</button>
