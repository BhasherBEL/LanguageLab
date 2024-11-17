<script lang="ts">
	import { createWeeklySurveyAPI } from '$lib/api/users';
	import config from '$lib/config';
	import { t } from '$lib/services/i18n';
	import { user } from '$lib/types/user';
	import { formatToUTCDate } from '$lib/utils/date';
	import { toastAlert, toastSuccess } from '$lib/utils/toasts';

	let open =
		!$user?.is_tutor &&
		!$user?.is_admin &&
		(!$user?.last_survey ||
			$user.last_survey.getTime() + config.WEEKLY_SURVEY_INTERVAL < Date.now());

	async function send() {
		if (!$user) return;

		const data = Array.from({ length: 4 }, (_, i) => {
			const value = (document.getElementById('questions-' + i) as HTMLSelectElement).value;
			return value === '-1' ? null : parseFloat(value);
		});

		const res = await createWeeklySurveyAPI($user.id, data[0]!, data[1]!, data[2]!, data[3]!);

		if (!res) {
			toastAlert($t('session.modal.weekly.errors.submit'));
		}

		await $user.patch({ last_survey: formatToUTCDate(new Date()) });

		open = false;

		toastSuccess($t('session.modal.weekly.success'));
	}
</script>

<dialog
	class="modal bg-black bg-opacity-50"
	{open}
	on:close={() => (open = false)}
	on:keydown={(e) => e.key === 'Escape' && (open = false)}
	tabindex="0"
	aria-modal="true"
>
	<div class="modal-box max-w-[800px]">
		<h2 class="text-xl font-bold mb-4">{$t('session.modal.weekly.title')}</h2>
		<p>{@html $t('session.modal.weekly.description')}</p>
		{#each new Array(4) as _, i}
			<label class="form-control w-full">
				<div class="label">
					<span class="label-text"
						>{@html $t('session.modal.weekly.questions.' + i, {
							lang: $t('utils.language.' + $user?.target_language).toLowerCase()
						})}</span
					>
				</div>
				<select id={'questions-' + i} class="select select-bordered">
					<option value="-1" hidden selected
						>{$t('session.modal.weekly.answers.placeholder')}</option
					>
					<option value="0">{$t('session.modal.weekly.answers.0')}</option>
					<option value="0.5">{$t('session.modal.weekly.answers.05')}</option>
					<option value="1">{$t('session.modal.weekly.answers.1')}</option>
					<option value="2">{$t('session.modal.weekly.answers.2')}</option>
					<option value="3">{$t('session.modal.weekly.answers.3')}</option>
					<option value="4">{$t('session.modal.weekly.answers.4')}</option>
					<option value="5">{$t('session.modal.weekly.answers.5')}</option>
					<option value="6">{$t('session.modal.weekly.answers.6')}</option>
					<option value="7">{$t('session.modal.weekly.answers.7')}</option>
					<option value="8">{$t('session.modal.weekly.answers.8')}</option>
					<option value="9">{$t('session.modal.weekly.answers.9')}</option>
					<option value="10">{$t('session.modal.weekly.answers.10')}</option>
				</select>
			</label>
		{/each}
		<button class="btn btn-primary w-full mt-10" on:click={send}>{$t('button.submit')}</button>
	</div>
</dialog>
