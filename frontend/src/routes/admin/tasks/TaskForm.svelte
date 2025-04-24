<script lang="ts">
	import { deleteTaskAPI } from '$lib/api/tasks';
	import { t } from '$lib/services/i18n';
	import type { Task } from '$lib/types/tasks';
	import autosize from 'svelte-autosize';
	import { ShoppingBag } from 'svelte-hero-icons';

	let { form, task }: { form: FormData; task: Task | null } = $props();

	async function deleteTask() {
		if (!task) return;
		await deleteTaskAPI(fetch, task.id);
		document.location.href = '/admin/tasks';
	}
</script>

<div class="mx-auto w-full max-w-5xl px-4">
	<h2 class="text-xl font-bold m-5 text-center">
		{$t(task === null ? 'tasks.createTitle' : 'tasks.editTitle')}
	</h2>

	{#if form?.message}
		<div class="alert alert-error shadow-lg mb-4">
			{form?.message}
		</div>
	{/if}

	<form method="post">
		<label class="label" for="level">{$t('tasks.level')} *</label>
		<select
			class="select select-bordered w-full"
			id="level"
			name="level"
			required
			value={task?.level}
		>
			<option value="A1">A1</option>
			<option value="A2">A2</option>
			<option value="B1">B1</option>
			<option value="B2">B2</option>
			<option value="C1">C1</option>
		</select>

		<label class="label" for="shortTitle">{$t('tasks.shortTitle')} *</label>
		<input
			class="input w-full"
			type="text"
			id="shortTitle"
			name="shortTitle"
			required
			value={task?.shortTitle}
		/>

		<label class="label" for="instructions">{$t('tasks.instructions')}</label>
		<textarea
			use:autosize
			rows="2"
			class="input w-full"
			id="instructions"
			name="instructions"
			value={task?.instructions}
		></textarea>

		<label class="label" for="learnerInstructions">{$t('tasks.learnerInstructions')}</label>
		<textarea
			use:autosize
			rows="2"
			class="input w-full"
			id="learnerInstructions"
			name="learnerInstructions"
			value={task?.learnerInstructions}
		></textarea>

		<label class="label" for="examples">{$t('tasks.examples')} *</label>
		<textarea
			use:autosize
			rows="2"
			class="input w-full"
			id="examples"
			name="examples"
			required
			value={task?.examples}
		></textarea>

		<div class="mt-4 mb-6">
			<input type="hidden" name="id" value={task ? task.id : ''} />
			<button type="submit" class="button">
				{$t(task === null ? 'button.create' : 'button.update')}
			</button>
			<a class="btn btn-outline float-end ml-2" href="/admin/tasks">
				{$t('button.cancel')}
			</a>
			{#if task}
				<button
					type="button"
					class="btn btn-error btn-outline float-end"
					onclick={() => confirm($t('tasks.deleteConfirm')) && deleteTask()}
				>
					{$t('button.delete')}
				</button>
			{/if}
		</div>
	</form>
</div>
