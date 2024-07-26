<script>
	import { onMount } from 'svelte';
	import { sendTestVocabularyAPI } from '$lib/api/tests';

	import surveyJson from '$lib/data/vocabulary-survey.json';

	onMount(() => {
		const jq = window.$;
		const survey = new Survey.Model(surveyJson);
		survey.onComplete.add(surveyComplete);
		jq(function () {
			jq('#surveyContainer').Survey({
				model: survey
			});
		});
	});

	async function surveyComplete(survey, options) {
		options.showSaveInProgress();

		const res = await sendTestVocabularyAPI(JSON.stringify(survey.data));

		if (res) {
			options.showSaveSuccess();
		} else {
			options.showSaveError();
		}
	}
</script>

<svelte:head>
	<script
		type="text/javascript"
		src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js"
	></script>

	<link href="https://unpkg.com/survey-jquery/defaultV2.min.css" type="text/css" rel="stylesheet" />
	<script
		type="text/javascript"
		src="https://unpkg.com/survey-jquery/survey.jquery.min.js"
	></script>
</svelte:head>

<div id="surveyContainer"></div>
