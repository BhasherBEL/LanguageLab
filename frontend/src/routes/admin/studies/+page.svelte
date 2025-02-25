<script lang="ts">
	import { t } from '$lib/services/i18n';
	import Study from '$lib/types/study.js';
	import { displayDate } from '$lib/utils/date';
	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();

	let studies: Study[] = $state(data.studies);
</script>

<h1 class="text-xl font-bold m-5 text-center">{$t('header.admin.studies')}</h1>

<table class="table max-w-5xl mx-auto text-center">
	<thead>
		<tr>
			<th>#</th>
			<th>{$t('utils.words.date')}</th>
			<th>{$t('utils.words.title')}</th>
			<th># {$t('utils.words.users')}</th>
		</tr>
	</thead>
	<tbody>
		{#each studies as study (study.id)}
			<tr
				class="hover:bg-gray-100 hover:cursor-pointer"
				onclick={() => (window.location.href = `/admin/studies/${study.id}`)}
			>
				<td>{study.id}</td>
				<td>{displayDate(study.startDate)} - {displayDate(study.endDate)}</td>
				<td>{study.title}</td>
				<td>{study.numberOfUsers}</td>
				<td></td>
			</tr>
		{/each}
	</tbody>
</table>
<div class="mt-8 w-[64rem] mx-auto">
	<a class="button" href="/admin/studies/new">{$t('studies.create')}</a>
</div>
