<script lang="ts">
	import type SurveyOption from '$lib/types/surveyOption';

	export let option: SurveyOption;
	export let onClick: () => void;
</script>

<p>{option.value}</p>
