<script lang="ts">
	import { sendSurveyResponseAPI, sendSurveyResponseInfoAPI } from '$lib/api/survey';
	import { getSurveyScoreAPI } from '$lib/api/survey';

	import Survey from '$lib/types/survey.js';
	import { t } from '$lib/services/i18n';
	import { toastWarning } from '$lib/utils/toasts.js';
	import { get } from 'svelte/store';
	import User from '$lib/types/user.js';
	import type SurveyGroup from '$lib/types/surveyGroup';
	import Gapfill from '$lib/components/surveys/gapfill.svelte';
	import Consent from '$lib/components/surveys/consent.svelte';
	import Dropdown from '$lib/components/surveys/dropdown.svelte';
	import config from '$lib/config';
	import { formatToUTCDate } from '$lib/utils/date';

	export let data;

	const survey: Survey = data.survey!;
	const user = data.user ? User.parse(JSON.parse(data.user)) : null;

	let sid =
		Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
	let startTime = new Date().getTime();

	function getSortedQuestions(group: SurveyGroup) {
		return group.questions.sort(() => Math.random() - 0.5);
	}

	$: step = user ? 1 : 0;
	$: uuid = user?.email || '';
	$: uid = user?.id || null;
	$: code = '';
	$: subStep = 0;

	let currentGroupId = 0;
	let currentGroup = survey.groups[currentGroupId];
	let questionsRandomized = getSortedQuestions(currentGroup);
	let currentQuestionId = 0;
	let currentQuestion = questionsRandomized[currentQuestionId];
	let type = currentQuestion.question.split(':')[0];
	let value = currentQuestion.question.split(':').slice(1).join(':');
	let gaps = type === 'gap' ? gapParts(currentQuestion.question) : null;
	let soundPlayer: HTMLAudioElement;
	let displayQuestionOptions: string[] = [...(currentQuestion.options ?? [])];
	shuffle(displayQuestionOptions);
	let finalScore: number | null = null;
	let selectedOption: string;
	let endSurveyAnswers: { [key: string]: any } = {};

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
		currentGroup = survey.groups[currentGroupId];
		if (currentGroup.id < 1100) {
			questionsRandomized = getSortedQuestions(currentGroup);
			setQuestionId(0);
		}
	}

	function setQuestionId(id: number) {
		currentQuestionId = id;
		currentQuestion = questionsRandomized[currentQuestionId];
		type = currentQuestion.question.split(':')[0];
		value = currentQuestion.question.split(':').slice(1).join(':');
		gaps = type === 'gap' ? gapParts(currentQuestion.question) : null;
		displayQuestionOptions = [...(currentQuestion.options ?? [])];
		shuffle(displayQuestionOptions);
		if (soundPlayer) soundPlayer.load();
	}

	async function selectOption(option: string) {
		if (
			!(await sendSurveyResponseAPI(
				code,
				sid,
				uid,
				survey.id,
				currentGroupId,
				questionsRandomized[currentQuestionId]['_id'],
				currentQuestion.options.findIndex((o: string) => o === option) + 1,
				(new Date().getTime() - startTime) / 1000
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
				questionsRandomized[currentQuestionId]['_id'],
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

	async function nextGroup() {
		if (currentGroupId < survey.groups.length - 1) {
			setGroupId(currentGroupId + 1);
			//special group id for end of survey questions
			if (currentGroup.id >= 1100) {
				const scoreData = await getSurveyScoreAPI(survey.id, sid);
				if (scoreData) {
					finalScore = scoreData.score;
				}
				step += user ? 2 : 1;
				return;
			}
		} else {
			const scoreData = await getSurveyScoreAPI(survey.id, sid);
			if (scoreData) {
				finalScore = scoreData.score;
			}
			step+=2;
		}
	}

	function checkCode() {
		if (!code) {
			toastWarning(get(t)('surveys.invalidCode'));
			return;
		}
		if (code.length < 3) {
			toastWarning(get(t)('surveys.invalidCode'));
			return;
		}

		step = 2;
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

	async function selectAnswer(selection: string, option: string) {
		endSurveyAnswers[selection] = option;
		console.log(endSurveyAnswers);
		subStep += 1;
		if (subStep == 4) {
			await sendSurveyResponseInfoAPI(
				survey.id,
				sid,
				endSurveyAnswers.birthYear,
				endSurveyAnswers.gender,
				endSurveyAnswers.primaryLanguage,
				endSurveyAnswers.education
			);
			step += 1;
		}
		selectedOption = '';
		return;
	}
</script>

{#if step == 0}
	<div class="max-w-screen-md mx-auto p-5">
		<Consent
			introText={$t('register.consent.intro')}
			participation={$t('register.consent.participation')}
			participationD={$t('register.consent.participationD')}
			privacy={$t('register.consent.privacy')}
			privacyD={$t('register.consent.privacyD')}
			rights={$t('register.consent.rights')}
		/>
		<div class="form-control">
			<button class="button mt-4" on:click={() => step++}>
				{$t('register.consent.ok')}
			</button>
		</div>
	</div>
{:else if step == 1}
	<div class="max-w-screen-md mx-auto p-28 flex flex-col items-center min-h-screen">
		<p class="mb-4 text-lg font-semibold">{$t('surveys.code')}</p>
		<p class="mb-6 text-sm text-gray-600 text-center">{$t('surveys.codeIndication')}</p>
		<input
			type="text"
			placeholder="Code"
			class="input block mx-auto w-full max-w-xs border border-gray-300 rounded-md py-2 px-3 text-center"
			on:keydown={(e) => e.key === 'Enter' && checkCode()}
			bind:value={code}
		/>
		<!-- Button -->
		<button
			class="button mt-4 block bg-yellow-500 text-white rounded-md py-2 px-6 hover:bg-yellow-600 transition"
			on:click={checkCode}
		>
			{$t('button.next')}
		</button>
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
				<pre class="text-center font-bold py-4 px-6 m-auto">{value}</pre>
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
					{#if type == 'dropdown'}
						{@const value = option.split(':')[1].split(', ')}
						<select
							class="select select-bordered !ml-0"
							id="dropdown"
							name="dropdown"
							bind:value={option}
							on:change={() => selectOption(option)}
							required
						>
							{#each value as op}
								<option value={op}>{op}</option>
							{/each}
						</select>
					{:else if type == 'radio'}
						{@const value = option.split(':')[1].split(', ')}
						{#each value as op}
							<label class="radio-label">
								<input
									type="radio"
									name="dropdown"
									value={op}
									on:change={() => selectOption(op)}
									required
									class="radio-button"
								/>
								{op}
							</label>
						{/each}
					{:else}
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
					{/if}
				{/each}
			</div>
		</div>
	{/if}
{:else if step === 3}
	{#if currentGroup.id === 1100}
		{@const genderOptions = [
			{ value: 'male', label: $t('surveys.genders.male') },
			{ value: 'female', label: $t('surveys.genders.female') },
			{ value: 'other', label: $t('surveys.genders.other') },
			{ value: 'na', label: $t('surveys.genders.na') }
		]}
		{#if subStep === 0}
			<div class="mx-auto mt-16 text-center">
				<pre class="text-center font-bold py-4 px-6 m-auto">{$t('surveys.birthYear')}</pre>
				<Dropdown
					values={Array.from({ length: 82 }, (_, i) => {
						const year = 1931 + i;
						return { value: year, display: year };
					}).reverse()}
					bind:option={selectedOption}
					placeholder={$t('surveys.birthYear')}
					funct={() => selectAnswer('birthYear', selectedOption)}
				></Dropdown>
			</div>
		{:else if subStep === 1}
			<div class="mx-auto mt-16 text-center">
				<pre class="text-center font-bold py-4 px-6 m-auto">{$t('surveys.gender')}</pre>
				<div class="flex flex-col items-center space-y-4">
					{#each genderOptions as { value, label }}
						<label class="radio-label flex items-center space-x-2">
							<input
								type="radio"
								name="gender"
								{value}
								on:change={() => selectAnswer('gender', value)}
								required
								class="radio-button"
							/>
							<span>{label}</span>
						</label>
					{/each}
				</div>
			</div>
		{:else if subStep === 2}
			<div class="mx-auto mt-16 text-center">
				<pre class="text-center font-bold py-4 px-6 m-auto">{$t('surveys.homeLanguage')}</pre>
				<Dropdown
					values={Object.entries(config.PRIMARY_LANGUAGE).map(([code, name]) => ({
						value: code,
						display: name
					}))}
					bind:option={selectedOption}
					placeholder={$t('surveys.homeLanguage')}
					funct={() => selectAnswer('primaryLanguage', selectedOption)}
				></Dropdown>
			</div>
		{:else if subStep === 3}
			<div class="mx-auto mt-16 text-center">
				<pre class="text-center font-bold py-4 px-6 m-auto">{$t('surveys.education.title')}</pre>
				<Dropdown
					values={[
						{ value: 'na', display: $t('surveys.education.na') },
						{ value: 'PrimarySchool', display: $t('surveys.education.PrimarySchool') },
						{ value: 'SecondarySchool', display: $t('surveys.education.SecondarySchool') },
						{ value: 'NonUni', display: $t('surveys.education.NonUni') },
						{ value: 'Bachelor', display: $t('surveys.education.Bachelor') },
						{ value: 'Master', display: $t('surveys.education.Master') }
					]}
					bind:option={selectedOption}
					placeholder={$t('surveys.education.title')}
					funct={() => selectAnswer('education', selectedOption)}
				></Dropdown>
			</div>
		{/if}
	{:else}
		<!--In case special id received not defined, can still keep going-->
		{(step += 1)}
	{/if}
{:else if step == 4}
	<div class="mx-auto mt-16 text-center">
		<h1>{$t('surveys.complete')}</h1>
		{#if finalScore !== null}
			<p>{$t('surveys.score')} {finalScore} %</p>
		{/if}
	</div>
{/if}
