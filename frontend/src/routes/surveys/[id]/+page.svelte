<script lang="ts">
	import { sendSurveyResponseAPI } from '$lib/api/survey';

	import Survey from '$lib/types/survey.js';
	import type SurveyOption from '$lib/types/surveyOption';

	export let data;

	const survey: Survey = data.survey!;

	const uuid = genUUID(16);
	let startTime = new Date().getTime();

	$: currentGroupId = 0;
	$: currentGroup = survey.groups[currentGroupId];
	$: questionsRandomized = currentGroup.questions.sort(() => Math.random() - 0.5);
	$: currentQuestionId = 0;
	$: currentQuestion = questionsRandomized[currentQuestionId];
	$: finished = false;

	async function selectOption(option: SurveyOption) {
		if (
			!(await sendSurveyResponseAPI(
				uuid,
				survey.id,
				currentQuestionId,
				option.id,
				(new Date().getTime() - startTime) / 1000
			))
		) {
			return;
		}
		if (currentQuestionId < questionsRandomized.length - 1) {
			currentQuestionId++;
			startTime = new Date().getTime();
		} else {
			nextGroup();
		}
	}

	function nextGroup() {
		if (currentGroupId < survey.groups.length - 1) {
			currentGroupId++;
			currentQuestionId = 0;
		} else {
			finished = true;
		}
	}

	function genUUID(length: number) {
		let result = '';
		const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		const charactersLength = characters.length;
		let counter = 0;
		while (counter < length) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
			counter += 1;
		}
		return result;
	}
</script>

{#if !finished}
	<h1>Survey: {survey.title}</h1>
	<p>Group: {currentGroup?.title}</p>

	<div class="mx-auto mt-16 text-center">
		<p class="text-xl mb-4">
			{currentQuestion?.title}
		</p>
		{#if currentQuestion?.question_type == 'text'}
			<pre>{currentQuestion?.question_value}</pre>
		{:else if currentQuestion?.question_type == 'image'}
			<img src={currentQuestion?.question_value} alt="Question" />
		{:else if currentQuestion?.question_type == 'audio'}
			<audio controls autoplay class="rounded-lg mx-auto">
				<source src={currentQuestion?.question_value} type="audio/mpeg" />
				Your browser does not support the audio element.
			</audio>
		{/if}
	</div>

	<div class="mx-auto mt-16">
		<div class="flex justify-around min-w-[600px] space-x-10">
			{#each currentQuestion?.options as option (option.id)}
				<div
					class="h-48 w-48 overflow-hidden rounded-lg border border-black"
					on:click={() => selectOption(option)}
					role="button"
					on:keydown={() => selectOption(option)}
					tabindex="0"
				>
					{#if option.type === 'text'}
						<span
							class="flex items-center justify-center h-full w-full text-2xl transition-transform duration-200 ease-in-out transform hover:scale-105"
						>
							{option.value}
						</span>
					{:else if option.type === 'image'}
						<img
							src={option.value}
							alt="Option {option.id}"
							class="object-cover h-full w-full transition-transform duration-200 ease-in-out transform hover:scale-105"
						/>
					{:else if option.type == 'audio'}
						<audio controls class="w-full" on:click|preventDefault|stopPropagation>
							<source src={option.value} type="audio/mpeg" />
							Your browser does not support the audio element.
						</audio>
					{/if}
				</div>
			{/each}
		</div>
	</div>
{:else}
	<div class="mx-auto mt-16 text-center">
		<h1>Survey completed!</h1>
		<button
			class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
			on:click={() => {
				window.location.href = '/';
			}}
		>
			Back to home
		</button>
	</div>
{/if}
