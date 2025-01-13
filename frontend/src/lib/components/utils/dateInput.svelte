<!--
source: https://svelte.dev/playground/dc963bbead384b69aad17824149d6d27?version=3.25.1
-->

<script lang="ts">
	import dayjs from 'dayjs';

	export let format = 'YYYY-MM-DD';
	export let date: Date | null;
	let class_: string | undefined;
	export { class_ as class };
	export let id: string | undefined;

	let internal: string | null = null;

	const input = (x) => (internal = x ? dayjs(x).format(format) : null);
	const output = (x) => (date = x ? dayjs(x, format).toDate() : null);

	$: input(date);
	$: output(internal);
</script>

<input type="date" bind:value={internal} {id} class={class_} />
