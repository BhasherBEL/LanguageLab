<script lang="ts">
	import Header from '$lib/components/header.svelte';
	import { requireLogin } from '$lib/utils/login';
	import { onMount } from 'svelte';
	import { _ } from '$lib/services/i18n';
	import Timeslots from '$lib/components/users/timeslots.svelte';
	import JWTSession from '$lib/stores/JWTSession';
	import { toastAlert } from '$lib/utils/toasts';

	$: lastTimeslots = 0;
	$: timeslots = 0;
	let ready = false;
	let sent = false;

	onMount(async () => {
		if (!requireLogin()) return;

		const user = await JWTSession.userOrLoad();

		if (!user) {
			toastAlert('Failed to load user data');
			return;
		}
		timeslots = user.availability;
		lastTimeslots = timeslots;
		ready = true;
	});

	async function send() {
		const res = JWTSession.user()?.setAvailability(timeslots);

		if (!res) return;

		lastTimeslots = timeslots;
		sent = true;
		setTimeout(() => (sent = false), 3000);
	}
</script>

<Header />

<div class="w-4/5 max-w-4xl m-auto mt-4">
	<h2 class="my-4 text-xl">{$_('timeslots.setAvailabilities')}</h2>
	{#if ready}
		<Timeslots bind:timeslots />

		<div class="mt-4 w-full flex justify-center">
			<button class="button" disabled={sent || lastTimeslots === timeslots} on:click={send}
				>{$_(sent ? 'button.sent' : 'button.submit')}</button
			>
		</div>
	{/if}
</div>
