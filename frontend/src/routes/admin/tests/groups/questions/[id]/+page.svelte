<script lang="ts">
	import QuestionForm from '$lib/components/tests/QuestionForm.svelte';
	import type { ActionData, PageData } from './$types';

	const { data, form }: { data: PageData; form?: ActionData } = $props();
	const { question } = data;
</script>

<QuestionForm {question} message={form?.message} />
