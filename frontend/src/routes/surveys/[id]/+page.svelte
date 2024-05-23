<script lang="ts">
	import { sendSurveyResponseAPI } from '$lib/api/survey';

	import Survey from '$lib/types/survey.js';
	import type SurveyOption from '$lib/types/surveyOption';
	import { t } from '$lib/services/i18n';
	import { toastAlert, toastWarning } from '$lib/utils/toasts.js';
	import { get } from 'svelte/store';

	export let data;

	const survey: Survey = data.survey!;

	let uuid = data.user?.email || '';
	let startTime = new Date().getTime();

	$: step = data.user ? 1 : 0;

	$: currentGroupId = 0;
	$: currentGroup = survey.groups[currentGroupId];
	$: questionsRandomized = currentGroup.questions.sort(() => Math.random() - 0.5);
	$: currentQuestionId = 0;
	$: currentQuestion = questionsRandomized[currentQuestionId];

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
			step++;
		}
	}

	function checkUUID() {
		if (!uuid) {
			toastWarning(get(t)('surveys.invalidEmail'));
			return;
		}
		if (!uuid.includes('@')) {
			toastWarning(get(t)('surveys.invalidEmail'));
			return;
		}

		step = 1;
	}
</script>

{#if step == 0}
	<div class="max-w-screen-lg mx-auto text-center mt-8">
		<div class="text-lg">{@html $t('surveys.loginWarning')}</div>
		<div class="flex mt-8">
			<div class="grow border-r-gray-300 border-r py-16">
				<p class="mb-4">{$t('surveys.loginUser')}</p>
				<a href="/login?redirect=/surveys/{survey.id}" class="button">{$t('button.login')}</a>
			</div>
			<div class="grow py-16">
				<p class="mb-4">{$t('surveys.loginEmail')}</p>
				<input
					type="email"
					placeholder="Email"
					on:keydown={(e) => e.key === 'Enter' && checkUUID()}
					class="input block mx-auto"
					bind:value={uuid}
				/>
				<button class="button mt-4 block" on:click={checkUUID}>{$t('button.next')}</button>
			</div>
		</div>
	</div>
{:else if step == 1}
	<div class="max-w-screen-lg mx-auto text-center">
		<div class="my-16">{@html $t('surveys.introduction')}</div>
		<button class="button" on:click={() => step++}>{$t('button.next')}</button>
	</div>
{:else if step == 2}
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
{:else if step == 3}
	<div class="mx-auto mt-16 text-center">
		flex maximize width
		<h1>{$t('surveys.complete')}</h1>
	</div>
{/if}
