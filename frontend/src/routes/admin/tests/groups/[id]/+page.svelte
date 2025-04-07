<script lang="ts">
	import GroupForm from '$lib/components/tests/GroupForm.svelte';
	import type { PageData } from './$types';

	const { data, form }: { data: PageData; form: FormData } = $props();
	const { group, possibleQuestions } = data;
</script>

<GroupForm {group} {possibleQuestions} message={form?.message} />
