<script lang="ts">
	import { t } from '$lib/services/i18n';
	import { onMount } from 'svelte';
	import Study from '$lib/types/study';
	import { getStudiesAPI } from '$lib/api/studies';
	import { displayDate, formatToUTCDate } from '$lib/utils/date';
	import autosize from 'svelte-autosize';
	import DateInput from '$lib/components/utils/dateInput.svelte';
	import { toastAlert, toastSuccess } from '$lib/utils/toasts';

	let studies: Study[] = [];
	let selectedStudy: Study | null = null;
	let title: string | null = null;
	let description: string | null = null;
	let startDate: Date | null = null;
	let endDate: Date | null = null;
	let chatDuration: number | null = null;

	let studyCreate: boolean = false;

	function selectStudy(study: Study | null) {
		selectedStudy = study;

		title = study?.title ?? null;
		description = study?.description ?? null;
		startDate = study?.startDate ?? null;
		endDate = study?.endDate ?? null;
		chatDuration = study?.chatDuration ?? null;
	}

	async function studyUpdate() {
		if (
			selectedStudy === null ||
			title === null ||
			description === null ||
			startDate === null ||
			endDate === null ||
			chatDuration === null ||
			title === '' ||
			description === '' ||
			(title === selectedStudy.title &&
				description === selectedStudy.description &&
				startDate.getDay() === selectedStudy.startDate.getDay() &&
				startDate.getMonth() === selectedStudy.startDate.getMonth() &&
				startDate.getFullYear() === selectedStudy.startDate.getFullYear() &&
				endDate.getDay() === selectedStudy.endDate.getDay() &&
				endDate.getMonth() === selectedStudy.endDate.getMonth() &&
				endDate.getFullYear() === selectedStudy.endDate.getFullYear() &&
				chatDuration === selectedStudy.chatDuration)
		) {
			selectStudy(null);
			toastSuccess($t('studies.noChanges'));
			return;
		}

		const result = await selectedStudy.patch({
			title,
			description,
			start_date: formatToUTCDate(startDate),
			end_date: formatToUTCDate(endDate),
			chatDuration
		});

		if (result) {
			selectStudy(null);
			toastSuccess($t('studies.updated'));
		} else {
			toastAlert($t('studies.updateError'));
		}
	}

	async function createStudy() {
		if (
			title === null ||
			description === null ||
			startDate === null ||
			endDate === null ||
			chatDuration === null ||
			title === '' ||
			description === ''
		) {
			toastAlert($t('studies.createMissing'));
			return;
		}

		const study = await Study.create(title, description, startDate, endDate, chatDuration);

		if (study) {
			toastSuccess($t('studies.created'));
			studyCreate = false;
		} else {
			toastAlert($t('studies.createError'));
		}
	}

	onMount(async () => {
		studies = Study.parseAll(await getStudiesAPI());
	});
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
			<tr class="hover:bg-gray-100 hover:cursor-pointer" on:click={() => selectStudy(study)}>
				<td>{study.id}</td>
				<td>{displayDate(study.startDate)} - {displayDate(study.endDate)}</td>
				<td>{study.title}</td>
				<td>{study.numberOfUsers}</td>
			</tr>
		{/each}
	</tbody>
</table>
<div class="mt-8 w-[64rem] mx-auto">
	<button class="button" on:click={() => (studyCreate = true)}>{$t('studies.create')}</button>
</div>

<dialog class="modal bg-black bg-opacity-50" open={selectedStudy != null}>
	<div class="modal-box max-w-4xl">
		<h2 class="text-xl font-bold m-5 text-center">{$t('studies.study')} #{selectedStudy?.id}</h2>
		<form>
			<label class="label" for="title">{$t('utils.words.title')}</label>
			<input class="input w-full" type="text" id="title" bind:value={title} />
			<label class="label" for="description">{$t('utils.words.description')}</label>
			<textarea use:autosize class="input w-full max-h-52" id="title" bind:value={description} />
			<label class="label" for="startDate">{$t('studies.startDate')}</label>
			<DateInput class="input w-full" id="startDate" bind:date={startDate} />
			<label class="label" for="endDate">{$t('studies.endDate')}</label>
			<DateInput class="input w-full" id="endDate" bind:date={endDate} />
			<label class="label" for="chatDuration">{$t('studies.chatDuration')}</label>
			<input
				class="input w-full"
				type="number"
				id="chatDuration"
				bind:value={chatDuration}
				min="0"
			/>
		</form>
		<div class="mt-4">
			<button class="button" on:click={studyUpdate}>{$t('button.update')}</button>
			<button class="btn btn-outline float-end ml-2" on:click={() => selectStudy(null)}>
				{$t('button.cancel')}
			</button>
			<button
				class="btn btn-error btn-outline float-end"
				on:click={() =>
					confirm($t('studies.deleteConfirm')) && selectedStudy?.delete() && selectStudy(null)}
			>
				{$t('button.delete')}
			</button>
		</div>
	</div>
</dialog>

<dialog class="modal bg-black bg-opacity-50" open={studyCreate}>
	<div class="modal-box max-w-4xl">
		<h2 class="text-xl font-bold m-5 text-center">{$t('studies.createTitle')}</h2>
		<form>
			<label class="label" for="title">{$t('utils.words.title')} *</label>
			<input class="input w-full" type="text" id="title" bind:value={title} />
			<label class="label" for="description">{$t('utils.words.description')} *</label>
			<textarea use:autosize class="input w-full max-h-52" id="title" bind:value={description} />
			<label class="label" for="startDate">{$t('studies.startDate')} *</label>
			<DateInput class="input w-full" id="startDate" bind:date={startDate} />
			<label class="label" for="endDate">{$t('studies.endDate')} *</label>
			<DateInput class="input w-full" id="endDate" bind:date={endDate} />
			<label class="label" for="chatDuration">{$t('studies.chatDuration')} *</label>
			<input
				class="input w-full"
				type="number"
				id="chatDuration"
				bind:value={chatDuration}
				min="0"
			/>
		</form>
		<div class="mt-4">
			<button class="button" on:click={createStudy}>{$t('button.create')}</button>
			<button
				class="btn btn-outline float-end ml-2"
				on:click={() => (studyCreate = false && selectStudy(null))}
			>
				{$t('button.cancel')}
			</button>
		</div>
	</div>
</dialog>
