<script lang="ts">
	import type Study from '$lib/types/study';
	import type { PageData } from './$types';
	import { t } from '$lib/services/i18n';
	import { displayDate } from '$lib/utils/date';
	import { toastWarning } from '$lib/utils/toasts';
	import { get } from 'svelte/store';
	import LanguageTest from '$lib/components/tests/languageTest.svelte';
	import { TestTask, TestTyping } from '$lib/types/tests';
	import Typingbox from '$lib/components/tests/typingbox.svelte';
	import { getTestEntriesScoreAPI } from '$lib/api/tests';
	import EndQuestions from '$lib/components/surveys/endQuestions.svelte';

	let { data, form }: { data: PageData; form: FormData } = $props();
	let study: Study | undefined = $state(data.study);
	let studies: Study[] | undefined = $state(data.studies);
	let user = $state(data.user);
	let rid =
		Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

	let selectedStudy: Study | undefined = $state();

	let current_step = $state(
		(() => {
			if (!study) return 0;
			if (!user) return 1;
			return 2;
		})()
	);

	let code = $state('');

	function checkCode() {
		if (!code) {
			toastWarning(get(t)('tests.invalidCode'));
			return;
		}
		if (code.length < 3) {
			toastWarning(get(t)('tests.invalidCode'));
			return;
		}

		current_step += 1;
	}
</script>

<div class="header mx-auto my-5">
	<ul class="steps text-xs">
		<li class="step" class:step-primary={current_step >= 0}>
			{$t('studies.tab.study')}
		</li>
		<li class="step" class:step-primary={current_step >= 1}>
			{$t('studies.tab.code')}
		</li>
		{#if study}
			{#each study.tests as test, i (test.id)}
				<li class="step" class:step-primary={current_step >= i + 2}>
					{test.title}
				</li>
			{/each}
		{:else}
			<li class="step" data-content="...">
				{$t('studies.tab.tests')}
			</li>
		{/if}
		<li class="step" class:step-primary={study && current_step >= study.tests.length + 2}>
			{$t('studies.tab.infos')}
		</li>
		<li class="step" class:step-primary={study && current_step >= study.tests.length + 3}>
			{$t('studies.tab.end')}
		</li>
	</ul>
</div>

<div class="max-w-screen-md min-w-max mx-auto p-5 h-full">
	{#if current_step == 0}
		<div class="form-control">
			<label for="study" class="label">
				<span class="label-text">{$t('register.study')}</span>
				<span class="label-text-alt">{$t('register.study.note')}</span>
			</label>
			<select
				class="select select-bordered"
				id="study"
				name="study"
				required
				disabled={!!study}
				bind:value={selectedStudy}
			>
				{#if study}
					<option selected value={study}>
						{study.title} ({displayDate(study.startDate)} - {displayDate(study.endDate)})
					</option>
				{:else if studies}
					<option disabled selected value="">{$t('register.study.placeholder')}</option>
					{#each studies as s}
						<option value={s}>
							{s.title} ({displayDate(s.startDate)} - {displayDate(s.endDate)})
						</option>
					{/each}
				{:else}
					<option disabled></option>
				{/if}
			</select>
		</div>
		<div class="form-control">
			<a
				class="button mt-8"
				class:btn-disabled={!selectedStudy}
				href="/studies/{selectedStudy?.id}"
				data-sveltekit-reload
			>
				{$t('button.continue')}
			</a>
		</div>
	{:else if study}
		{#if current_step == 1}
			<div class="flex flex-col items-center min-h-screen">
				<h2 class="mb-10 text-xl text-center">{study.title}</h2>
				<p class="mb-4 text-lg font-semibold">{$t('surveys.code')}</p>
				<p class="mb-6 text-sm text-gray-600 text-center">{@html $t('surveys.codeIndication')}</p>
				<input
					type="text"
					placeholder="Code"
					class="input block mx-auto w-full max-w-xs border border-gray-300 rounded-md py-2 px-3 text-center"
					onkeydown={(e) => e.key === 'Enter' && checkCode()}
					bind:value={code}
				/>
				<button
					class="button mt-4 block bg-yellow-500 text-white rounded-md py-2 px-6 hover:bg-yellow-600 transition"
					onclick={checkCode}
				>
					{$t('button.next')}
				</button>
			</div>
		{:else if current_step < study.tests.length + 2}
			{@const test = study.tests[current_step - 2]}
			{#key test}
				{#if test instanceof TestTask}
					<LanguageTest
						languageTest={test}
						{user}
						{code}
						{rid}
						study_id={study.id}
						onFinish={() => current_step++}
					/>
				{:else if test instanceof TestTyping}
					<div class="w-[1024px]">
						<Typingbox
							typingTest={test}
							onFinish={() => {
								setTimeout(() => {
									current_step++;
								}, 3000);
							}}
							{user}
							{code}
							{rid}
						/>
					</div>
				{/if}
			{/key}
		{:else if current_step == study.tests.length + 2}
			<div class="flex flex-col h-full">
				<EndQuestions study_id={study.id} {rid} onFinish={() => current_step++} />
			</div>
		{:else if current_step == study.tests.length + 3}
			<div class="flex flex-col h-full">
				<div class="flex-grow text-center mt-16">
					<span>{$t('studies.complete')}</span>

					<div class="mt-4">
						{$t('studies.score.title')}
						{#await getTestEntriesScoreAPI(fetch, rid)}
							{$t('studies.score.loading')}
						{:then score}
							{#if score !== null}
								{(score * 100).toFixed(0)}%
							{:else}
								{$t('studies.score.error')}
							{/if}
						{/await}
					</div>
				</div>

				<dl class="text-sm">
					<div class="sm:grid sm:grid-cols-3 sm:gap-4 mb-1">
						<dt class="font-medium">{$t('register.consent.studyData.study')}</dt>
						<dd class="text-gray-700 sm:col-span-2">
							{study.title}
						</dd>
					</div>
					<div class="sm:grid sm:grid-cols-3 sm:gap-4 mb-1">
						<dt class="font-medium">{$t('register.consent.studyData.project')}</dt>
						<dd class="text-gray-700 sm:col-span-2">
							{$t('register.consent.studyData.projectD')}
						</dd>
					</div>
					<div class="sm:grid sm:grid-cols-3 sm:gap-4 mb-1">
						<dt class="font-medium">{$t('register.consent.studyData.university')}</dt>
						<dd class="text-gray-700 sm:col-span-2">
							{$t('register.consent.studyData.universityD')}
						</dd>
					</div>
					<div class="sm:grid sm:grid-cols-3 sm:gap-4 mb-1">
						<dt class="font-medium">{$t('register.consent.studyData.address')}</dt>
						<dd class="text-gray-700 sm:col-span-2">
							{$t('register.consent.studyData.addressD')}
						</dd>
					</div>
					<div class="sm:grid sm:grid-cols-3 sm:gap-4 mb-1">
						<dt class="font-medium">{$t('register.consent.studyData.person')}</dt>
						<dd class="text-gray-700 sm:col-span-2">
							{$t('register.consent.studyData.personD')}
						</dd>
					</div>
					<div class="sm:grid sm:grid-cols-3 sm:gap-4 mb-1">
						<dt class="font-medium">{$t('register.consent.studyData.email')}</dt>
						<dd class="text-gray-700 sm:col-span-2">
							<a href="mailto:{$t('register.consent.studyData.emailD')}" class="link"
								>{$t('register.consent.studyData.emailD')}</a
							>
						</dd>
					</div>
				</dl>
			</div>
		{/if}
	{/if}
</div>
