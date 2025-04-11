<script lang="ts">
	import TaskForm from '../TaskForm.svelte';

	let { form }: { form: FormData } = $props();
</script>

<TaskForm {form} task={null} />
