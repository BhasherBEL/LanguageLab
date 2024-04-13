<script lang="ts">
	import Header from '$lib/components/header.svelte';
	import { onMount } from 'svelte';
	import { t } from '$lib/services/i18n';
	import Timeslots from '$lib/components/users/timeslots.svelte';
	import { user } from '$lib/types/user';

	$: lastTimeslots = 0;
	$: timeslots = 0;
	let ready = false;
	let sent = false;

	onMount(async () => {
		if ($user != null) {
			timeslots = $user.availability;
			lastTimeslots = timeslots;
			ready = true;
		}
	});

	async function send() {
		const res = $user?.setAvailability(timeslots);

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

		<div class="mt-4 w-full flex justify-center">
			<button class="button" disabled={sent || lastTimeslots === timeslots} on:click={send}
				>{$t(sent ? 'button.sent' : 'button.submit')}</button
			>
		</div>
	{/if}
</div>
