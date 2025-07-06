<script lang="ts">
	import { t } from '$lib/services/i18n';
	import Draggable from '$lib/components/utils/Draggable.svelte';
	import type TestTaskGroup from '$lib/types/testTaskGroups';
	import {
		TestTaskQuestionGapfill,
		TestTaskQuestionQcm,
		TestTaskQuestionQcmType,
		type TestTaskQuestion
	} from '$lib/types/testTaskQuestions';

	const {
		group,
		possibleQuestions,
		message
	}: { group: TestTaskGroup | null; possibleQuestions: TestTaskQuestion[]; message: string } =
		$props();

	let questions = $state(group ? [...group.questions] : []);
	let selectedQuestion = $state<TestTaskQuestion | null>(null);

	async function deleteGroup() {
		if (!group) return;
		await group?.delete();
		window.location.href = '/admin/tests/group';
	}
</script>

<div class="mx-auto w-full max-w-5xl px-4">
	<h2 class="text-xl font-bold m-5 text-center">
		{$t(group ? 'tests.groups.title.edit' : 'tests.groups.title.create')}
	</h2>

	{#if message}
		<div class="alert alert-error shadow-lg mb-4">
			{message}
		</div>
	{/if}

	<form method="POST">
		<label for="title" class="label text-sm">{$t('utils.words.title')} *</label>
		<input
			type="text"
			class="input w-full"
			name="title"
			id="title"
			placeholder="Title"
			value={group?.title}
			required
		/>

		<label for="demo" class="label text-sm">{$t('utils.words.demo')}</label>
		<label class="flex gap-2">
			{$t('utils.bool.false')}
			<input type="checkbox" name="demo" id="demo" class="toggle" />
			{$t('utils.bool.true')}
		</label>

		<label for="randomize" class="label text-sm">{$t('utils.words.randomize')}</label>
		<label class="flex gap-2">
			{$t('utils.bool.false')}
			<input type="checkbox" checked name="randomize" id="randomize" class="toggle" />
			{$t('utils.bool.true')}
		</label>

		<span class="label text-sm capitalize">{$t('utils.words.questions')}</span>
		<Draggable name="questions[]" bind:items={questions} />
		<div class="flex max-w-full">
			<div class="flex-1 min-w-0">
				<select class="select select-bordered w-full" bind:value={selectedQuestion}>
					{#each Object.keys(TestTaskQuestionQcmType) as qcmType}
						<optgroup label={`${$t('utils.words.qcm')} - ${$t(`utils.words.${qcmType}`)}`}>
							{#each possibleQuestions as question}
								{#if question instanceof TestTaskQuestionQcm && question.subType === qcmType}
									<option value={question} title={question.value}>
										{question.value.substring(0, 120)}
									</option>
								{/if}
							{/each}
						</optgroup>
					{/each}
					<optgroup label={$t('tests.questions.gapfill')}>
						{#each possibleQuestions as question}
							{#if question instanceof TestTaskQuestionGapfill}
								<option value={question} title={question.value}>
									{question.value.substring(0, 120)}
								</option>
							{/if}
						{/each}
					</optgroup>
				</select>
			</div>
			<button
				class="ml-2 button flex-shrink-0"
				onclick={(e) => {
					e.preventDefault();
					if (selectedQuestion === undefined || selectedQuestion === null) return;
					questions = [...questions, selectedQuestion];
				}}
			>
				+
			</button>
		</div>

		<input type="hidden" name="id" value={group?.id} />

		<div class="mt-4 mb-6">
			<button type="submit" class="button">
				{group ? $t('button.update') : $t('button.create')}
			</button>
			<a class="btn btn-outline float-end ml-2" href="/admin/tests/groups">
				{$t('button.cancel')}
			</a>
			{#if group}
				<button
					type="button"
					class="btn btn-error btn-outline float-end"
					onclick={() => confirm($t('test.groups.deleteConfirm')) && deleteGroup()}
				>
					{$t('button.delete')}
				</button>
			{/if}
		</div>
	</form>
</div>
