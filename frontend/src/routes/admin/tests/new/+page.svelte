<script lang="ts">
	import TestForm from '$lib/components/tests/TestForm.svelte';
	const { data, form }: { data: PageData; form: FormData } = $props();
	const { possibleGroups } = data;
</script>

<TestForm test={null} {possibleGroups} message={form?.message} />
