<script lang="ts">
	import { sendStudyResponseInfoAPI } from '$lib/api/studies';
	import config from '$lib/config';
	import { t } from '$lib/services/i18n';
	import { toastAlert } from '$lib/utils/toasts';
	import Dropdown from './dropdown.svelte';

	let {
		study_id,
		rid,
		onFinish = () => {}
	}: { study_id: number; rid: string; onFinish: Function } = $props();

	let step = $state(0);

	const genderOptions = [
		{ value: 'male', label: $t('surveys.genders.male') },
		{ value: 'female', label: $t('surveys.genders.female') },
		{ value: 'other', label: $t('surveys.genders.other') },
		{ value: 'na', label: $t('surveys.genders.na') }
	];

	let birthYear = '';
	let gender = '';
	let primaryLanguage = '';
	let other_language = '';
	let education = '';

	let selectedOption: any = $state();

	async function send() {
		if (
			!(await sendStudyResponseInfoAPI(
				fetch,
				study_id,
				rid,
				parseInt(birthYear),
				gender,
				primaryLanguage,
				other_language,
				education
			))
		) {
			toastAlert($t('surveys.info.error'));
		} else {
			onFinish();
		}
	}
</script>

{#if step === 0}
	<div class="mx-auto mt-16 text-center px-4">
		<p class="text-center font-bold py-4 px-6 m-auto">{$t('surveys.birthYear')}</p>
		<Dropdown
			values={Array.from({ length: 82 }, (_, i) => {
				const year = 1931 + i;
				return { value: year, display: year };
			}).reverse()}
			bind:option={selectedOption}
			placeholder={$t('surveys.birthYear')}
			funct={() => {
				birthYear = selectedOption;
				step++;
			}}
		></Dropdown>
	</div>
{:else if step === 1}
	<div class="mx-auto mt-16 text-center px-4">
		<p class="text-center font-bold py-4 px-6 m-auto">{$t('surveys.gender')}</p>
		<div class="flex flex-col items-center space-y-4">
			{#each genderOptions as { value, label }}
				<label class="radio-label flex items-center space-x-2">
					<input
						type="radio"
						name="gender"
						{value}
						onchange={() => {
							gender = value;
							step++;
						}}
						required
						class="radio-button"
					/>
					<span>{label}</span>
				</label>
			{/each}
		</div>
	</div>
{:else if step === 2}
	<div class="mx-auto mt-16 text-center px-4">
		<p class="text-center font-bold py-4 px-6 m-auto">{$t('surveys.homeLanguage')}</p>
		<Dropdown
			values={Object.entries(config.PRIMARY_LANGUAGE).map(([code, name]) => ({
				value: code,
				display: name
			}))}
			bind:option={selectedOption}
			placeholder={$t('surveys.homeLanguage')}
			funct={() => {
				primaryLanguage = selectedOption;
				step++;
			}}
		></Dropdown>
	</div>
{:else if step === 3}
	<div class="mx-auto mt-16 text-center px-4">
		<p class="text-center font-bold py-4 px-6 m-auto">{$t('surveys.otherLanguage')}</p>
		<p class="mb-6 text-sm text-gray-600 text-center">{$t('surveys.otherLanguageNote')}</p>
		<Dropdown
			values={[
				{ value: 'none', display: '/' },
				...Object.entries(config.PRIMARY_LANGUAGE).map(([code, name]) => ({
					value: code,
					display: name
				}))
			]}
			bind:option={selectedOption}
			placeholder={$t('surveys.otherLanguage')}
			funct={() => {
				other_language = selectedOption;
				step++;
			}}
		></Dropdown>
	</div>
{:else if step === 4}
	<div class="mx-auto mt-16 text-center px-4">
		<p class="text-center font-bold py-4 px-6 m-auto">{$t('surveys.education.title')}</p>
		<Dropdown
			values={[
				{ value: 'NoEducation', display: $t('surveys.education.NoEducation') },
				{ value: 'PrimarySchool', display: $t('surveys.education.PrimarySchool') },
				{ value: 'SecondarySchool', display: $t('surveys.education.SecondarySchool') },
				{ value: 'NonUni', display: $t('surveys.education.NonUni') },
				{ value: 'Bachelor', display: $t('surveys.education.Bachelor') },
				{ value: 'Master', display: $t('surveys.education.Master') }
			]}
			bind:option={selectedOption}
			placeholder={$t('surveys.education.title')}
			funct={() => {
				education = selectedOption;
				send();
			}}
		></Dropdown>
	</div>
{/if}
