<script lang="ts">
	import { sendSurveyResponseAPI } from '$lib/api/survey';

	import Survey from '$lib/types/survey.js';
	import { t } from '$lib/services/i18n';
	import { toastWarning } from '$lib/utils/toasts.js';
	import { get } from 'svelte/store';
	import User from '$lib/types/user.js';
	import type SurveyGroup from '$lib/types/surveyGroup';
	import Gapfill from '$lib/components/surveys/gapfill.svelte';

	export let data;

	const survey: Survey = data.survey!;
	const user = data.user ? User.parse(JSON.parse(data.user)) : null;

	let sid =
		Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
	let startTime = new Date().getTime();

	function getSortedQuestions(group: SurveyGroup) {
		return group.questions.sort(() => Math.random() - 0.5);
	}

	$: step = user ? 2 : 0;
	$: uuid = user?.email || '';

	let currentGroupId = 0;
	let currentGroup = survey.groups[currentGroupId];
	let questionsRandomized = getSortedQuestions(currentGroup);
	let currentQuestionId = 0;
	let currentQuestion = questionsRandomized[currentQuestionId];
	let type = currentQuestion.question.split(':')[0];
	let value = currentQuestion.question.split(':').slice(1).join(':');
	let gaps = type === 'gap' ? gapParts(currentQuestion.question) : null;
	let soundPlayer: HTMLAudioElement;
	let displayQuestionOptions: string[] = [...(currentQuestion.options ?? [])].sort(
		() => Math.random() - 0.5
	);

	function setGroupId(id: number) {
		currentGroupId = id;
		currentGroup = survey.groups[currentGroupId];
		questionsRandomized = getSortedQuestions(currentGroup);
		setQuestionId(0);
	}

	function setQuestionId(id: number) {
		currentQuestionId = id;
		currentQuestion = questionsRandomized[currentQuestionId];
		type = currentQuestion.question.split(':')[0];
		value = currentQuestion.question.split(':').slice(1).join(':');
		gaps = type === 'gap' ? gapParts(currentQuestion.question) : null;
		displayQuestionOptions = [...(currentQuestion.options ?? [])].sort(() => Math.random() - 0.5);
		if (soundPlayer) soundPlayer.load();
	}

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
		console.log(currentQuestion.options.findIndex((o: string) => o === option));
		if (currentQuestionId < questionsRandomized.length - 1) {
			setQuestionId(currentQuestionId + 1);
			startTime = new Date().getTime();
		} else {
			nextGroup();
		}
	}

	async function sendGap() {
		if (!gaps) return;

		const gapTexts = gaps
			.filter((part) => part.gap !== null)
			.map((part) => part.gap)
			.join('|');

		if (
			!(await sendSurveyResponseAPI(
				uuid,
				sid,
				survey.id,
				currentGroupId,
				currentQuestionId,
				-1,
				(new Date().getTime() - startTime) / 1000,
				gapTexts
			))
		) {
			return;
		}
		if (currentQuestionId < questionsRandomized.length - 1) {
			setQuestionId(currentQuestionId + 1);
			startTime = new Date().getTime();
		} else {
			nextGroup();
		}
	}

	function nextGroup() {
		if (currentGroupId < survey.groups.length - 1) {
			setGroupId(currentGroupId + 1);
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

	function gapParts(question: string): { text: string; gap: string | null }[] {
		if (!question.startsWith('gap:')) return [];

		const gapText = question.split(':').slice(1).join(':');

		const parts: { text: string; gap: string | null }[] = [];

		for (let part of gapText.split(/(<.+?>)/g)) {
			const isGap = part.startsWith('<') && part.endsWith('>');
			const text = isGap ? part.slice(1, -1) : part;
			parts.push({ text: text, gap: isGap ? '' : null });
		}

		return parts;
	}
</script>

{#if step == 0}
	<div class="max-w-screen-lg mx-auto text-center mt-8">
		<div class="text-lg">{@html $t('surveys.loginWarning')}</div>
		<div class="flex mt-8">
			<div class="grow border-r-gray-300 border-r py-16">
				<p class="mb-4">{$t('surveys.loginUser')}</p>
				<a href="/login?redirect=/tests/{survey.id}" class="button">{$t('button.login')}</a>
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
	{#if type == 'gap'}
		<div class="mx-auto mt-16 center flex flex-col">
			<div>
				{#each gaps as part}
					{#if part.gap !== null}
						<Gapfill length={part.text.length} onInput={(text) => (part.gap = text)} />
					{:else}
						{part.text}
					{/if}
				{/each}
			</div>
			<button class="button mt-8" on:click={sendGap}>{$t('button.next')}</button>
		</div>
	{:else}
		<div class="mx-auto mt-16 text-center">
			{#if type == 'text'}
				<pre>{value}</pre>
			{:else if type == 'image'}
				<img src={value} alt="Question" />
			{:else if type == 'audio'}
				<audio bind:this={soundPlayer} controls autoplay class="rounded-lg mx-auto">
					<source src={value} type="audio/mpeg" />
					Your browser does not support the audio element.
				</audio>
			{/if}
		</div>

		<div class="mx-auto mt-16">
			<div class="flex justify-around min-w-[600px] space-x-10">
				{#each displayQuestionOptions as option (option)}
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
	{/if}
{:else if step == 3}
	<div class="mx-auto mt-16 text-center">
		<h1>{$t('surveys.complete')}</h1>
	</div>
{/if}
