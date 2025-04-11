<script lang="ts">
	import { t } from '$lib/services/i18n';
	import type { PageData } from './$types';
	import Task from '$lib/types/tasks';

	const { data }: { data: PageData } = $props();

	let tasks: Task[] = $state(data.tasks);
</script>

<h1 class="text-xl font-bold m-5 text-center">
	{$t('header.admin.tasks')}
</h1>

<table class="table max-w-5xl mx-auto text-center">
	<thead>
		<tr>
			<th>#</th>
			<th>{$t('tasks.level')}</th>
			<th>{$t('tasks.shortTitle')}</th>
		</tr>
	</thead>
	<tbody>
		{#each tasks as task (task.id)}
			<tr
				class="hover:bg-gray-100 hover:cursor-pointer"
				onclick={() => (window.location.href = `/admin/tasks/${task.id}`)}
			>
				<td>{task.id}</td>
				<td>{task.level}</td>
				<td>{task.shortTitle}</td>
			</tr>
		{/each}
	</tbody>
</table>

<div class="mt-8 w-[64rem] mx-auto">
	<a class="button" href="/admin/tasks/new">{$t('tasks.create')}</a>
</div>
