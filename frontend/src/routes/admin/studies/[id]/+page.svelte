<script lang="ts">
	import StudyForm from '$lib/components/studies/StudyForm.svelte';
	import SurveyTypingSvelte from '$lib/types/surveyTyping.svelte';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let study = data.study;
	let typing = $state(new SurveyTypingSvelte());

	let possibleTests = [typing, ...data.surveys];

	let mode = 'edit';
</script>

{#if study}
	<StudyForm {study} {possibleTests} {mode} {data} {form} />
{:else}
	<p>StudySvelte not found.</p>
{/if}
