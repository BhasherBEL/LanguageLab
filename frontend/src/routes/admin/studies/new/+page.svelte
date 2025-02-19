<script lang="ts">
	import StudyForm from '$lib/components/studies/StudyForm.svelte';
	import SurveyTypingSvelte from '$lib/types/surveyTyping.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let study = null;
	let typing = $state(new SurveyTypingSvelte());
	let possibleTests = [typing, ...data.surveys];
	let mode = 'create';
</script>

<StudyForm {study} {possibleTests} {mode} />
