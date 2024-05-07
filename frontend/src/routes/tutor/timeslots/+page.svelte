<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '$lib/services/i18n';
	import Timeslots from '$lib/components/users/timeslots.svelte';
	import { user } from '$lib/types/user';
	import { toastWarning } from '$lib/utils/toasts';

	$: lastTimeslots = 0;
	$: timeslots = 0;
	$: calcom_link = '';
	$: last_calcom_link = '';
	let ready = false;
	let sent = false;

	onMount(async () => {
		if ($user != null) {
			timeslots = $user.availability;
			lastTimeslots = timeslots;
			calcom_link = $user.calcom_link;
			console.log(calcom_link);
			last_calcom_link = calcom_link;
			ready = true;
		}
	});

	async function send() {
		if (!calcom_link || !calcom_link.startsWith('https://cal.com/')) {
			toastWarning($t('timeslots.calcomWarning'));
			return;
		}

		const res = $user?.setAvailability(timeslots, calcom_link);

		if (!res) return;

		lastTimeslots = timeslots;
		sent = true;
		setTimeout(() => (sent = false), 3000);
	}
</script>

<div class="w-4/5 max-w-4xl m-auto mt-4">
	<h2 class="my-4 text-xl">{$t('timeslots.setAvailabilities')}</h2>
	{#if ready}
		<Timeslots bind:timeslots />

		<input
			type="text "
			class="input w-full mt-4"
			placeholder={$t('timeslots.calcom')}
			bind:value={calcom_link}
		/>

		<div class="mt-4 w-full flex justify-center">
			<button
				class="button"
				disabled={sent || (lastTimeslots === timeslots && calcom_link === last_calcom_link)}
				on:click={send}>{$t(sent ? 'button.sent' : 'button.submit')}</button
			>
		</div>
	{/if}
</div>
