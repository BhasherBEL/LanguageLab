<script lang="ts">
	import TestForm from '$lib/components/tests/TestForm.svelte';
	import type { PageData } from './$types';

	const { data, form }: { data: PageData; form: FormData } = $props();
	const { test, possibleGroups } = data;
</script>

<TestForm {test} {possibleGroups} message={form?.message} />
