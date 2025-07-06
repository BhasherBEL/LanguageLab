<script lang="ts">
	import { t } from '$lib/services/i18n';
	import type { PageData } from './$types';
	import {
		TestTaskQuestionQcm,
		TestTaskQuestionGapfill,
		type TestTaskQuestion
	} from '$lib/types/testTaskQuestions';

	const { data }: { data: PageData } = $props();

	let questions: TestTaskQuestion[] = $state(data.questions);
</script>

<h1 class="text-xl font-bold m-5 text-center">{$t('header.admin.questions')}</h1>

<table class="table max-w-5xl mx-auto text-left">
	<thead>
		<tr>
			<th>#</th>
			<th>{$t('utils.words.type')}</th>
			<th>{$t('utils.words.question')}</th>
		</tr>
	</thead>
	<tbody>
		{#each questions as question (question.id)}
			<tr
				class="hover:bg-gray-100 hover:cursor-pointer"
				onclick={() => (window.location.href = `/admin/tests/groups/questions/${question.id}`)}
			>
				<td>{question.id}</td>
				<td>
					{#if question instanceof TestTaskQuestionQcm}
						{$t('utils.words.qcm')} - {$t(`utils.words.${question.subType}`)}
					{:else if question instanceof TestTaskQuestionGapfill}
						{$t('tests.questions.gapfill')}
					{:else}
						{$t('utils.words.unknown')}
					{/if}
				</td>
				<td class="max-w-md truncate" title={question.question}>
					{question.question.substring(0, 100)}{question.question.length > 100 ? '...' : ''}
				</td>
			</tr>
		{/each}
	</tbody>
</table>
<div class="mt-8 mx-auto w-[64rem] flex justify-between pb-8">
	<a class="button" href="/admin/tests/groups/questions/new">{$t('tests.questions.create')}</a>
	<span>
		<a class="btn" href="/admin/tests/groups">⏎ {$t('tests.questions.backtogroups')}</a>
	</span>
</div>
