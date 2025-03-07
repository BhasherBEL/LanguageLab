<script lang="ts">
	import StudyForm from '$lib/components/studies/StudyForm.svelte';
	import type { PageData, ActionData } from './$types';
	import SurveyTypingSvelte from '$lib/types/surveyTyping.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let study = data.study;

	let typing = $state(new SurveyTypingSvelte());
	let possibleTests = [typing, ...data.tests];

	let mode = 'edit';
</script>

{#if study}
	<StudyForm {study} {possibleTests} {mode} {data} {form} />
{:else}
	<p>Study not found.</p>
{/if}
