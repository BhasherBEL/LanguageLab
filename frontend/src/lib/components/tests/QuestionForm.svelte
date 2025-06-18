<script lang="ts">
	import { t } from '$lib/services/i18n';
	import {
		TestTaskQuestionQcm,
		TestTaskQuestionQcmType,
		type TestTaskQuestion
	} from '$lib/types/testTaskQuestions';
	import { deleteTestQuestionAPI } from '$lib/api/tests';

	const { question, message }: { question: TestTaskQuestion | null; message?: string } = $props();

	let questionType = $state(question ? question.type : 'qcm');
	let qcmSubType = $state(
		question instanceof TestTaskQuestionQcm
			? question.subType || TestTaskQuestionQcmType.text
			: TestTaskQuestionQcmType.text
	);
	let questionValue = $state(question ? question.value : '');
	let options = $state(
		question instanceof TestTaskQuestionQcm
			? question.options.map((opt: any) => opt.value)
			: ['', '', '', '']
	);
	let correct = $state(question instanceof TestTaskQuestionQcm ? question.correct : 0);

	function addOption() {
		options = [...options, ''];
	}

	function removeOption(index: number) {
		if (options.length > 2) {
			options = options.filter((_, i) => i !== index);
			if (correct >= options.length) {
				correct = options.length - 1;
			}
		}
	}

	async function deleteQuestion() {
		if (!question) return;
		const success = await deleteTestQuestionAPI(window.fetch, question.id);
		if (success) {
			window.location.href = '/admin/tests/groups/questions';
		}
	}
</script>

<div class="mx-auto w-full max-w-5xl px-4">
	<h2 class="text-xl font-bold m-5 text-center">
		{$t(question ? 'tests.questions.title.edit' : 'tests.questions.title.create')}
	</h2>

	{#if message}
		<div class="alert alert-error shadow-lg mb-4">
			{message}
		</div>
	{/if}

	<form method="POST">
		<label for="questionType" class="label text-sm">{$t('tests.questions.type')} *</label>
		<select
			class="select select-bordered w-full"
			name="questionType"
			id="questionType"
			bind:value={questionType}
		>
			<option value="qcm">{$t('utils.words.qcm')}</option>
			<option value="gapfill">{$t('tests.questions.gapfill')}</option>
		</select>

		{#if questionType === 'qcm'}
			<label for="qcmSubType" class="label text-sm">{$t('tests.questions.subtype')} *</label>
			<select
				class="select select-bordered w-full"
				name="qcmSubType"
				id="qcmSubType"
				bind:value={qcmSubType}
			>
				{#each Object.values(TestTaskQuestionQcmType) as subType}
					<option value={subType}>{$t(`utils.words.${subType}`)}</option>
				{/each}
			</select>

			<label for="question" class="label text-sm">{$t('utils.words.question')} *</label>
			<input
				type="text"
				class="input w-full"
				name="question"
				id="question"
				placeholder={$t('utils.words.question')}
				bind:value={questionValue}
				required
			/>

			<span class="label text-sm">{$t('tests.questions.options')} *</span>
			{#each options as option, index}
				<div class="flex gap-2 mb-2">
					<input
						type="text"
						class="input flex-1"
						name="options[]"
						placeholder={$t('tests.questions.option') + ' ' + (index + 1)}
						bind:value={options[index]}
						required
					/>
					<label class="flex items-center gap-1">
						<input
							type="radio"
							name="correct"
							value={index}
							bind:group={correct}
							class="radio radio-sm"
						/>
						{$t('tests.questions.correct')}
					</label>
					<button
						type="button"
						class="btn btn-error btn-sm"
						onclick={() => removeOption(index)}
						disabled={options.length <= 2}
					>
						-
					</button>
				</div>
			{/each}
			<button type="button" class="btn btn-sm mb-4" onclick={addOption}>
				{$t('tests.questions.addOption')}
			</button>
		{:else}
			<label for="question" class="label text-sm">{$t('utils.words.question')} *</label>
			<input
				type="text"
				class="input w-full"
				name="question"
				id="question"
				placeholder="text:Example question with <answer> gap"
				bind:value={questionValue}
				required
			/>
			<div class="text-sm text-gray-600 mt-1">
				{$t('tests.questions.gapfillHelp')}
			</div>
		{/if}

		<input type="hidden" name="id" value={question?.id} />

		<div class="mt-4 mb-6">
			<button type="submit" class="button">
				{question ? $t('button.update') : $t('button.create')}
			</button>
			<a class="btn btn-outline float-end ml-2" href="/admin/tests/groups/questions">
				{$t('button.cancel')}
			</a>
			{#if question}
				<button
					type="button"
					class="btn btn-error btn-outline float-end"
					onclick={() => confirm($t('tests.questions.deleteConfirm')) && deleteQuestion()}
				>
					{$t('button.delete')}
				</button>
			{/if}
		</div>
	</form>
</div>
