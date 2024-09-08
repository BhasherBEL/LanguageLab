<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '$lib/services/i18n';
	import Timeslots from '$lib/components/users/timeslots.svelte';
	import { user } from '$lib/types/user';
	import { toastWarning } from '$lib/utils/toasts';
	import { Icon, Calendar, QuestionMarkCircle } from 'svelte-hero-icons';

	$: lastTimeslots = 0n;
	$: timeslots = 0n;
	$: calcom_link = '';
	$: last_calcom_link = '';
	let ready = false;
	let sent = false;

	onMount(async () => {
		if ($user != null) {
			timeslots = $user.availability;
			lastTimeslots = timeslots;
			calcom_link = $user.calcom_link || '';
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

<div class="max-w-screen-md mx-auto p-2">
	<h2 class="my-4 text-xl">{$t('timeslots.setAvailabilities')}</h2>
	{#if ready}
		<Timeslots bind:timeslots />

		<div class="form-control mt-4">
			<label class="label" for="calcom">
				<span class="label-text">
					{$t('timeslots.calcom')}
					<a
						href="https://forge.uclouvain.be/sbibauw/languagelab/-/blob/93897d67f63ec81ebbe13b10035e4cd5a3a09071/docs/cal.com.md"
						target="_blank"
					>
						<Icon
							src={QuestionMarkCircle}
							class="w-5 h-5 cursor-pointer inline"
							title="Documentation"
							solid
						/>
					</a>
				</span>
			</label>
			<div class="input flex items-center">
				<Icon src={Calendar} class="w-5 h-5 mr-2 opacity-70" solid />
				<input
					type="text"
					id="calcom"
					class="grow"
					placeholder="https://cal.com/username/tutoring"
					bind:value={calcom_link}
				/>
			</div>
		</div>

		<div class="form-control mt-4">
			<button
				class="button"
				disabled={sent || (lastTimeslots === timeslots && calcom_link === last_calcom_link)}
				on:click={send}>{$t(sent ? 'button.sent' : 'button.submit')}</button
			>
		</div>
	{/if}
</div>
