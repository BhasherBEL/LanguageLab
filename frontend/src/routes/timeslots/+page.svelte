<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '$lib/services/i18n';
	import Timeslots from '$lib/components/users/timeslots.svelte';
	import { getUsersAPI } from '$lib/api/users';
	import User, { users } from '$lib/types/user';

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

	<h2 class="my-8 text-xl">{$t('timeslots.availableTutors')}</h2>

	{#if filteredUsers.length > 0}
		<table class="table-fixed w-full border-collapse text-center">
			<thead>
				<tr class="bg-gray-100">
					<th class="border-2 h-10">{$t('users.nickname')}</th>
					<th class="border-2">{$t('users.email')}</th>
					<th class="border-2">{$t('users.availability')}</th>
				</tr>
			</thead>
			<tbody>
				{#each filteredUsers as user}
					<tr>
						<td class="border-2">{user.nickname}</td>
						<td class="border-2">{user.email}</td>
						<td class="border-2">
							{#each Array.from({ length: 8 }, (_, i) => i) as i}
								{@const time = i * 2 + 8}
								{#each Array.from({ length: 7 }, (_, day) => day) as day}
									{@const bin = 1n << BigInt(i * 7 + day + 1)}
									{#if user.availability & bin}
										<span class:font-bold={timeslots & bin}>
											{$t('utils.days.' + day)}
											{time}h - {time + 2}h
											<br />
										</span>
									{/if}
								{/each}
							{/each}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{:else}
		<p>{$t('timeslots.noTutors')}</p>
	{/if}
</div>
