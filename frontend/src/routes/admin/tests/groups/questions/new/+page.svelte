<script lang="ts">
	import QuestionForm from '$lib/components/tests/QuestionForm.svelte';
	import type { PageData } from './$types';

	const { data, form }: { data: PageData; form?: any } = $props();
</script>

<QuestionForm question={null} message={form?.message} />
