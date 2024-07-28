<script lang="ts">
	import { sendSurveyResponseAPI } from '$lib/api/survey';

	import Survey from '$lib/types/survey.js';
	import { t } from '$lib/services/i18n';
	import { toastWarning } from '$lib/utils/toasts.js';
	import { get } from 'svelte/store';
	import User from '$lib/types/user.js';

	export let data;

	const survey: Survey = data.survey!;
	const user = data.user ? User.parse(JSON.parse(data.user)) : null;

	let sid =
		Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
	let startTime = new Date().getTime();

	$: step = user ? 1 : 0;
	$: uuid = user?.email || '';

	$: currentGroupId = 0;
	$: currentGroup = survey.groups[currentGroupId];
	$: questionsRandomized = currentGroup.questions.sort(() => Math.random() - 0.5);
	$: currentQuestionId = 0;
	$: currentQuestion = questionsRandomized[currentQuestionId];

	async function selectOption(option: string) {
		if (
			!(await sendSurveyResponseAPI(
				uuid,
				sid,
				survey.id,
				currentGroupId,
				currentQuestionId,
				currentQuestion.options.findIndex((o: string) => o === option),
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
	{@const type = currentQuestion.question.split(':')[0]}
	{@const value = currentQuestion.question.split(':').slice(1).join(':')}
	<div class="mx-auto mt-16 text-center">
		{#if type == 'text'}
			<pre>{value}</pre>
		{:else if type == 'image'}
			<img src={value} alt="Question" />
		{:else if type == 'audio'}
			<audio controls autoplay class="rounded-lg mx-auto">
				<source src={value} type="audio/mpeg" />
				Your browser does not support the audio element.
			</audio>
		{/if}
	</div>

	<div class="mx-auto mt-16">
		<div class="flex justify-around min-w-[600px] space-x-10">
			{#each currentQuestion?.options as option (option)}
				{@const type = option.split(':')[0]}
				{@const value = option.split(':').slice(1).join(':')}
				<div
					class="h-48 w-48 overflow-hidden rounded-lg border border-black"
					on:click={() => selectOption(option)}
					role="button"
					on:keydown={() => selectOption(option)}
					tabindex="0"
				>
					{#if type === 'text'}
						<span
							class="flex items-center justify-center h-full w-full text-2xl transition-transform duration-200 ease-in-out transform hover:scale-105"
						>
							{value}
						</span>
					{:else if type === 'image'}
						<img
							src={value}
							alt="Option {option}"
							class="object-cover h-full w-full transition-transform duration-200 ease-in-out transform hover:scale-105"
						/>
					{:else if type == 'audio'}
						<audio controls class="w-full" on:click|preventDefault|stopPropagation>
							<source src={value} type="audio/mpeg" />
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
