<script lang="ts">
	import { sendTestEntryTaskGapfillAPI, sendTestEntryTaskQcmAPI } from '$lib/api/tests';
	import { t } from '$lib/services/i18n';
	import type { TestTask } from '$lib/types/tests';
	import {
		TestTaskQuestionGapfill,
		TestTaskQuestionQcm,
		TestTaskQuestionQcmType
	} from '$lib/types/testTaskQuestions';
	import type User from '$lib/types/user';
	import { shuffleWithSeed } from '$lib/utils/arrays';
	import Gapfill from '../surveys/gapfill.svelte';

	let {
		languageTest,
		user,
		code,
		rid,
		study_id,
		onFinish = () => {}
	}: {
		languageTest: TestTask;
		user: User | null;
		code: string | null;
		rid: string | null;
		study_id: number;
		onFinish: Function;
	} = $props();

	let randomSeed = (user?.id || 0) + languageTest.id + study_id;

	let nAnswers = $state(1);

	let startTime = new Date().getTime();

	let currentGroupId = $state(0);
	let currentGroup = $derived(languageTest.groups[currentGroupId]);

	let questions = $derived(
		currentGroup.randomize
			? shuffleWithSeed(currentGroup.questions, randomSeed + currentGroupId)
			: currentGroup.questions
	);

	let currentQuestionId = $state(0);
	let currentQuestion = $derived(questions[currentQuestionId]);
	let currentQuestionParts = $derived(
		currentQuestion instanceof TestTaskQuestionGapfill ? currentQuestion.parts : null
	);

	let soundPlayer: HTMLAudioElement | null = $state(null);

	function setGroupId(id: number) {
		currentGroupId = id;
		if (currentGroup.id < 1100) {
			setQuestionId(0);
		}
	}

	function setQuestionId(id: number) {
		currentQuestionId = id;
		if (soundPlayer) soundPlayer.load();
		nAnswers += 1;
	}

	async function nextGroup() {
		if (currentGroupId < languageTest.groups.length - 1) {
			setGroupId(currentGroupId + 1);
			//special group id for end of survey questions
		} else {
			onFinish();
		}
	}

	async function sendGap() {
		if (
			!currentGroup.demo &&
			currentQuestion instanceof TestTaskQuestionGapfill &&
			currentQuestionParts
		) {
			const gapTexts = currentQuestionParts
				.filter((part) => part.gap !== null)
				.map((part) => part.gap)
				.join('|');

			if (
				!(await sendTestEntryTaskGapfillAPI(
					fetch,
					code || user?.email || '',
					rid,
					user?.id || null,
					languageTest.id,
					study_id,
					currentGroup.id,
					questions[currentQuestionId].id,
					(new Date().getTime() - startTime) / 1000,
					gapTexts
				))
			) {
				return;
			}
		}
		if (currentQuestionId < questions.length - 1) {
			setQuestionId(currentQuestionId + 1);
			startTime = new Date().getTime();
		} else {
			nextGroup();
		}
	}

	async function selectOption(option: number) {
		if (!currentGroup.demo) {
			if (
				!(await sendTestEntryTaskQcmAPI(
					fetch,
					code || user?.email || '',
					rid,
					user?.id || null,
					languageTest.id,
					study_id,
					currentGroup.id,
					questions[currentQuestionId].id,
					(new Date().getTime() - startTime) / 1000,
					option
				))
			) {
				return;
			}
		}
		if (currentQuestionId < questions.length - 1) {
			setQuestionId(currentQuestionId + 1);
			startTime = new Date().getTime();
		} else {
			nextGroup();
		}
	}
</script>

<div class="text-center">{nAnswers}/{languageTest.numQuestions}</div>

{#if currentQuestion instanceof TestTaskQuestionGapfill && currentQuestionParts}
	<div class="mx-auto mt-16 center flex flex-col text-xl">
		<div>
			{#each currentQuestionParts as part (part)}
				{#if part.gap !== null}
					<Gapfill length={part.text.length} onInput={(text) => (part.gap = text)} />
				{:else}
					{part.text}
				{/if}
			{/each}
		</div>
		<button class="button mt-8" onclick={sendGap}>{$t('button.next')}</button>
	</div>
{:else if currentQuestion instanceof TestTaskQuestionQcm}
	<div class="mx-auto mt-16 text-center">
		{#if currentQuestion.subType === TestTaskQuestionQcmType.text}
			<p class="text-center font-bold py-4 px-6 m-auto max-w-5xl">{@html currentQuestion.value}</p>
		{:else if currentQuestion.subType === TestTaskQuestionQcmType.image}
			<img src={currentQuestion.value} alt="Question" />
		{:else if currentQuestion.subType === TestTaskQuestionQcmType.audio}
			<audio bind:this={soundPlayer} controls autoplay class="rounded-lg mx-auto">
				<source src={currentQuestion.value} type="audio/mpeg" />
				Your browser does not support the audio element.
			</audio>
		{:else}
			<p>Unknown question type ({currentQuestion.type}). Value: {currentQuestion.value}</p>
		{/if}
	</div>

	<div class="mt-16 w-max">
		<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
			{#each currentQuestion.optionsRandomized as option (option)}
				<div
					class="h-48 w-48 overflow-hidden rounded-lg border border-black"
					onclick={() => selectOption(option.index)}
					role="button"
					onkeydown={() => selectOption(option.index)}
					tabindex="0"
				>
					{#if option.type === TestTaskQuestionQcmType.text}
						<span
							class="flex items-center justify-center h-full w-full text-2xl transition-transform duration-200 ease-in-out transform hover:scale-105"
						>
							{option.value}
						</span>
					{:else if option.type === TestTaskQuestionQcmType.image}
						<img
							src={option.value}
							alt="Option {option}"
							class="object-cover h-full w-full transition-transform duration-200 ease-in-out transform hover:scale-105"
						/>
					{:else if option.type === TestTaskQuestionQcmType.audio}
						<audio
							controls
							class="w-full"
							onclick={(e) => {
								e.preventDefault();
								e.stopPropagation();
							}}
						>
							<source src={option.value} type="audio/mpeg" />
							Your browser does not support the audio element.
						</audio>
					{:else}
						<p>Unknown option type ({option.type}). Value: {option.value}</p>
					{/if}
				</div>
			{/each}
		</div>
	</div>
{:else}
	Nop
{/if}
