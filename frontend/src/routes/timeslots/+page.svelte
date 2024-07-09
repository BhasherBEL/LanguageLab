<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '$lib/services/i18n';
	import Timeslots from '$lib/components/users/timeslots.svelte';
	import { getUsersAPI } from '$lib/api/users';
	import User, { users } from '$lib/types/user';
	import AvailableTutors from '$lib/components/users/availableTutors.svelte';

	onMount(async () => {
		User.parseAll(await getUsersAPI());
	});

	let timeslots = 0n;

	$: filteredUsers = $users.filter((user) => {
		if (user.availability === 0n) return false;
		if (timeslots === 0n) return true;

		return user.availability & timeslots;
	});
</script>

<div class="w-4/5 m-auto mt-4">
	<h2 class="my-4 text-xl">{$t('timeslots.availabilities')}</h2>
	<Timeslots bind:timeslots />
	<AvailableTutors users={filteredUsers} {timeslots} />
</div>
