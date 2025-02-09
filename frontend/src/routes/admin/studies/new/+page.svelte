<script lang="ts">
	import Survey from '$lib/types/survey';
	import type { PageData, ActionData } from './$types';
	import Draggable from './Draggable.svelte';
	import autosize from 'svelte-autosize';
	import { t } from '$lib/services/i18n';
	import DateInput from '$lib/components/utils/dateInput.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let tests: (string | Survey)[] = $state([]);

	let possibleTests = ['Typing Test', ...data.surveys];
	let selectedTest: string | Survey | undefined = $state();
</script>

<div class="mx-auto w-full max-w-5xl px-4">
	<h2 class="text-xl font-bold m-5 text-center">{$t('studies.createTitle')}</h2>
	{#if form?.message}
		<div class="alert alert-error mb-4">
			{form.message}
		</div>
	{/if}
	<form method="post">
		<label class="label" for="title">{$t('utils.words.title')} *</label>
		<input class="input w-full" type="text" id="title" name="title" required />
		<label class="label" for="description">{$t('utils.words.description')}</label>
		<textarea use:autosize class="input w-full max-h-52" id="description" name="description">
		</textarea>
		<label class="label" for="startDate">{$t('studies.startDate')} *</label>
		<DateInput class="input w-full" id="startDate" name="startDate" date={new Date()} required />
		<label class="label" for="endDate">{$t('studies.endDate')} *</label>
		<DateInput class="input w-full" id="endDate" name="endDate" date={new Date()} required />
		<label class="label" for="chatDuration">{$t('studies.chatDuration')} *</label>
		<input
			class="input w-full"
			type="number"
			id="chatDuration"
			name="chatDuration"
			min="0"
			value="30"
			required
		/>

		<h3 class="my-2">{$t('Tests')}</h3>
		<Draggable bind:items={tests} name="tests" />
		<div class="mt-2 flex">
			<select class="select select-bordered flex-grow" bind:value={selectedTest}>
				{#each possibleTests as test}
					{#if test instanceof Survey}
						<option value={test}>{test.title}</option>
					{:else}
						<option value={test}>{test}</option>
					{/if}
				{/each}
			</select>
			<button
				class="ml-2 button"
				onclick={(e) => {
					e.preventDefault();
					if (selectedTest === undefined) return;
					tests = [...tests, selectedTest];
				}}
			>
				+
			</button>
		</div>
		<div class="mt-4">
			<button class="button">{$t('button.create')}</button>
			<a class="btn btn-outline float-end ml-2" href="/admin/studies">
				{$t('button.cancel')}
			</a>
		</div>
	</form>
</div>
