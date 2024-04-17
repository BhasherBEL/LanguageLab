<script lang="ts">
	import { EmojiButton } from '@joeattardi/emoji-button';
	import { createEventDispatcher } from 'svelte';
	import { FaceSmile, Icon } from 'svelte-hero-icons';

	let class_: string = '';
	export { class_ as class };

	const dispatch = createEventDispatcher();

	const picker = new EmojiButton({ autoHide: false });
	let trigger: HTMLButtonElement;

	picker.on('emoji', (selection) => {
		dispatch('change', selection);
	});

	function togglePicker() {
		picker.togglePicker(trigger);
	}
</script>

<button bind:this={trigger} class={class_} on:click={togglePicker}>
	<kbd class="kbd">
		<Icon src={FaceSmile} class="w-6" />
	</kbd>
</button>
