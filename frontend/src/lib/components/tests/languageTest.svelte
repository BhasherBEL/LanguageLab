<script lang="ts">
	import { t } from '$lib/services/i18n';
	import type { TestTask } from '$lib/types/tests';
	import {
		TestTaskQuestion,
		TestTaskQuestionGapfill,
		TestTaskQuestionQcm,
		TestTaskQuestionQcmType
	} from '$lib/types/testTaskQuestions';
	import type User from '$lib/types/user';
	import Gapfill from '../surveys/gapfill.svelte';
	import { sendTestResponseAPI } from '$lib/api/tests';
	import { getSurveyScoreAPI } from '$lib/api/survey';

	let {
		languageTest,
		user,
		code,
		onFinish = () => {}
	}: {
		languageTest: TestTask;
		user: User | null;
		code: string | null;
		onFinish: Function;
	} = $props();

	function getSortedQuestions(questions: TestTaskQuestion[]) {
		return questions.sort(() => Math.random() - 0.5);
	}

	let nAnswers = $state(1);

	let sid =
		Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
	let startTime = new Date().getTime();

	let currentGroupId = $state(0);
	let currentGroup = $derived(languageTest.groups[currentGroupId]);

	let questions = $derived(
		currentGroup.randomize ? getSortedQuestions(currentGroup.questions) : currentGroup.questions
	);

	let currentQuestionId = $state(0);
	let currentQuestion = $derived(questions[currentQuestionId]);
	let currentQuestionParts = $derived(
		currentQuestion instanceof TestTaskQuestionGapfill ? currentQuestion.parts : null
	);
	$inspect(currentQuestion);

	let soundPlayer: HTMLAudioElement | null = $state(null);

	let selectedOption: string;
	let finalScore: number | null = $state(null);

	//source: shuffle function code taken from https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array/18650169#18650169
	function shuffle(array: string[]) {
		let currentIndex = array.length;
		// While there remain elements to shuffle...
		while (currentIndex != 0) {
			// Pick a remaining element...
			let randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex--;
			// And swap it with the current element.
			[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
		}
	}

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
			const scoreData = await getSurveyScoreAPI(fetch, languageTest.id, sid);
			if (scoreData) {
				finalScore = scoreData.score;
			}
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
				!(await sendTestResponseAPI(
					fetch,
					code || user?.email || '',
					user?.id || null,
					languageTest.id,
					currentGroup.id,
					questions[currentQuestionId].id,
					(new Date().getTime() - startTime) / 1000,
					null,
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
				!(await sendTestResponseAPI(
					fetch,
					code || user?.email || '',
					user?.id || null,
					languageTest.id,
					currentGroup.id,
					questions[currentQuestionId].id,
					(new Date().getTime() - startTime) / 1000,
					option,
					null
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
	<div class="mx-auto mt-16 center flex flex-col">
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
		{#if currentQuestion.type === TestTaskQuestionQcmType.text}
			<pre class="text-center font-bold py-4 px-6 m-auto">{currentQuestion.value}</pre>
		{:else if currentQuestion.type === TestTaskQuestionQcmType.image}
			<img src={currentQuestion.value} alt="Question" />
		{:else if currentQuestion.type === TestTaskQuestionQcmType.audio}
			<audio bind:this={soundPlayer} controls autoplay class="rounded-lg mx-auto">
				<source src={currentQuestion.value} type="audio/mpeg" />
				Your browser does not support the audio element.
			</audio>
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
					{/if}
				</div>
			{/each}
		</div>
	</div>
{:else}
	Nop
{/if}
