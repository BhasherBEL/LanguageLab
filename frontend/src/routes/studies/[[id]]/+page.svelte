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

	let { data, form }: { data: PageData; form: FormData } = $props();
	let study: Study | undefined = $state(data.study);
	let studies: Study[] | undefined = $state(data.studies);
	let user = $state(data.user);

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
	</ul>
</div>

<div class="max-w-screen-md min-w-max mx-auto p-5">
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
					<LanguageTest languageTest={test} {user} {code} onFinish={() => current_step++} />
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
						/>
					</div>
				{/if}
			{/key}
		{/if}
	{/if}
</div>
