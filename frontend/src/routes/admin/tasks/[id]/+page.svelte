<script lang="ts">
	import type { PageData } from './$types';
	import TaskForm from '../TaskForm.svelte';

	let { form, data }: { form: FormData; data: PageData } = $props();
</script>

<TaskForm {form} task={data.task} />
