<script lang="ts">
	import TestForm from '$lib/components/tests/TestForm.svelte';
	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();
	const { test } = data;
</script>

<TestForm {test} />
