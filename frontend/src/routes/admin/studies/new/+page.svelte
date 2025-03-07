<script lang="ts">
	import StudyForm from '$lib/components/studies/StudyForm.svelte';
	import type { PageData, ActionData } from './$types';
	import SurveyTypingSvelte from '$lib/types/surveyTyping.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let study = null;
	let typing = $state(new SurveyTypingSvelte());
	let possibleTests = [typing, ...data.tests];
	let mode = 'create';
</script>

<StudyForm {study} {possibleTests} {mode} {data} {form} />
