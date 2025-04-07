<script lang="ts">
	import { t } from '$lib/services/i18n';
	import type { PageData } from './$types';
	import type TestTaskGroup from '$lib/types/testTaskGroups';

	const { data }: { data: PageData } = $props();

	let groups: TestTaskGroup[] = $state(data.groups);
</script>

<h1 class="text-xl font-bold m-5 text-center">{$t('header.admin.groups')}</h1>

<table class="table max-w-5xl mx-auto text-left">
	<thead>
		<tr>
			<th>#</th>
			<th>{$t('utils.words.title')}</th>
			<th>{$t('utils.words.demo')}</th>
			<th>{$t('utils.words.randomize')}</th>
			<th class="capitalize"># {$t('utils.words.questions')}</th>
		</tr>
	</thead>
	<tbody>
		{#each groups as group (group.id)}
			<tr
				class="hover:bg-gray-100 hover:cursor-pointer"
				onclick={() => (window.location.href = `/admin/tests/groups/${group.id}`)}
			>
				<td>{group.id}</td>
				<td>{group.title}</td>
				<td>{$t(`utils.bool.${group.demo}`)}</td>
				<td>{$t(`utils.bool.${group.randomize}`)}</td>
				<td>{group.questions.length}</td>
			</tr>
		{/each}
	</tbody>
</table>
<div class="mt-8 mx-auto w-[64rem] flex justify-between pb-8">
	<a class="button" href="/admin/tests/groups/new">{$t('tests.groups.create')}</a>
	<span>
		<a class="btn" href="/admin/tests">⏎ {$t('tests.groups.backtotests')}</a>
		<a class="btn" href="/admin/tests/groups/questions">{$t('tests.questions.manage')}</a>
	</span>
</div>
