<script lang="ts">
	import { TestTask, type Test, type TestTyping } from '$lib/types/tests';
	import { t } from '$lib/services/i18n';
	import autosize from 'svelte-autosize';
	import Draggable from '$lib/components/utils/Draggable.svelte';
	import type TestTaskGroup from '$lib/types/testTaskGroups';

	const {
		test,
		possibleGroups,
		message
	}: { test: Test | null; possibleGroups: TestTaskGroup[]; message: string } = $props();

	let type = $state(test?.type);
	let groups = $state(test && test instanceof TestTask ? [...test.groups] : []);
	let selectedGroup = $state<TestTaskGroup | null>(null);

	async function deleteTest() {
		if (!test) return;
		await test?.delete();
		window.location.href = '/admin/tests';
	}
</script>

<div class="mx-auto w-full max-w-5xl px-4">
	<h2 class="text-xl font-bold m-5 text-center">
		{$t(test ? 'tests.title.edit' : 'tests.title.create')}
	</h2>

	{#if message}
		<div class="alert alert-error shadow-lg mb-4">
			{message}
		</div>
	{/if}

	<form method="POST">
		<label for="title" class="label text-sm">{$t('tests.label.title')} *</label>
		<input
			type="text"
			class="input w-full"
			name="title"
			id="title"
			placeholder="Title"
			value={test?.title}
			required
		/>

		<label for="type" class="label text-sm">{$t('tests.label.type')} *</label>
		<select name="type" id="type" class="select w-full input" bind:value={type}>
			<option value="typing">Typing Test</option>
			<option value="task">Task</option>
		</select>

		{#if type === 'typing'}
			{@const testTyping = test as TestTyping | null}
			<label for="explanation" class="label text-sm">{$t('tests.label.explanation')} *</label>
			<input
				class="input w-full"
				type="text"
				name="explanation"
				id="explanation"
				placeholder="Explanation"
				value={testTyping?.explanations}
				required
			/>
			<label for="text" class="label text-sm">{$t('tests.label.text')} *</label>
			<textarea
				use:autosize
				class="input w-full max-h-52"
				id="text"
				name="text"
				placeholder="Text to type"
				value={testTyping?.text}
				required
			></textarea>
			<label for="repeat" class="label text-sm">{$t('tests.label.repeat')} *</label>
			<input
				type="number"
				class="input w-full"
				name="repeat"
				id="repeat"
				required
				min="1"
				value={testTyping?.repeat || 1}
			/>
			<label for="duration" class="label text-sm">{$t('tests.label.duration')} *</label>
			<input
				type="number"
				class="input w-full"
				name="duration"
				id="duration"
				required
				min="0"
				value={testTyping?.duration || 60}
			/>
		{:else if type === 'task'}
			<h3 class="py-2 px-1 capitalize">{$t('utils.words.groups')}</h3>
			<Draggable name="groups[]" bind:items={groups} />
			<div class="flex">
				<select class="select select-bordered flex-grow" bind:value={selectedGroup}>
					{#each possibleGroups as group}
						<option value={group}>
							{group.title} - {group.questions.length} questions
						</option>
					{/each}
				</select>
				<button
					class="ml-2 button"
					onclick={(e) => {
						e.preventDefault();
						if (selectedGroup === undefined || selectedGroup === null) return;
						groups = [...groups, selectedGroup];
					}}
				>
					+
				</button>
			</div>
		{/if}

		<input type="hidden" name="id" value={test?.id} />

		<div class="mt-4 mb-6">
			<button type="submit" class="button" disabled={!type}>
				{test ? $t('button.update') : $t('button.create')}
			</button>
			<a class="btn btn-outline float-end ml-2" href="/admin/tests">
				{$t('button.cancel')}
			</a>
			{#if test}
				<button
					type="button"
					class="btn btn-error btn-outline float-end"
					onclick={() => confirm($t('test.deleteConfirm')) && deleteTest()}
				>
					{$t('button.delete')}
				</button>
			{/if}
		</div>
	</form>
</div>
