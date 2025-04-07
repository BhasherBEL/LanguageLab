<script lang="ts">
	import GroupForm from '$lib/components/tests/GroupForm.svelte';
	const { data, form }: { data: PageData; form: FormData } = $props();
	const { possibleQuestions } = data;
</script>

<GroupForm group={null} {possibleQuestions} message={form?.message} />
