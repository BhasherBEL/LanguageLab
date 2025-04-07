<script lang="ts">
	import { t } from '$lib/services/i18n';
	import type { PageData } from './$types';
	import type { Test } from '$lib/types/tests';

	const { data }: { data: PageData } = $props();

	let tests: Test[] = $state(data.tests);
</script>

<h1 class="text-xl font-bold m-5 text-center">{$t('header.admin.tests')}</h1>

<table class="table max-w-5xl mx-auto text-left table-fixed">
	<thead>
		<tr>
			<th class="w-24">#</th>
			<th class="w-32">{$t('utils.words.type')}</th>
			<th>{$t('utils.words.title')}</th>
		</tr>
	</thead>
	<tbody>
		{#each tests as test (test.id)}
			<tr
				class="hover:bg-gray-100 hover:cursor-pointer"
				onclick={() => (window.location.href = `/admin/tests/${test.id}`)}
			>
				<td>{test.id}</td>
				<td>{test.type}</td>
				<td>{test.title}</td>
			</tr>
		{/each}
	</tbody>
</table>
<div class="mt-8 mx-auto w-[64rem] flex justify-between">
	<a class="button" href="/admin/tests/new">{$t('tests.create')}</a>
	<span>
		<a class="btn" href="/admin/studies">⏎ {$t('tests.backtostudies')}</a>
		<a class="btn" href="/admin/tests/groups">{$t('tests.groups.manage')}</a>
	</span>
</div>
