<script lang="ts">
	import StudyForm from '$lib/components/studies/StudyForm.svelte';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let study = null;
	let possibleTests = data.tests;
	let mode = 'create';
</script>

<StudyForm {study} {possibleTests} {mode} {data} {form} />
