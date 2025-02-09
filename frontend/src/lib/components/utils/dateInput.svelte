<!--
source: https://svelte.dev/playground/dc963bbead384b69aad17824149d6d27?version=3.25.1
-->

<script lang="ts">
	import dayjs from 'dayjs';

	let {
		format = 'YYYY-MM-DD',
		date,
		id,
		name,
		required = false,
		class: className
	} = $props<{
		format?: string;
		date: Date | null;
		id?: string;
		name?: string;
		required?: boolean;
		class?: string;
	}>();

	let internal = $state<string | null>(null);

	// Convert the input date to internal string format
	let formattedDate = $derived(date ? dayjs(date).format(format) : null);
	$effect(() => {
		internal = formattedDate;
	});

	// Convert internal string back to date
	let parsedDate = $derived(internal ? dayjs(internal, format).toDate() : null);
	$effect(() => {
		date = parsedDate;
	});
</script>

<input type="date" bind:value={internal} {id} {name} class={className} {required} />
