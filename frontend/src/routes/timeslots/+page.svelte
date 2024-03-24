<script lang="ts">
	import Header from '$lib/components/header.svelte';
	import { requireLogin } from '$lib/utils/login';
	import { onMount } from 'svelte';
	import { _ } from '$lib/services/i18n';
	import Timeslots from '$lib/components/users/timeslots.svelte';
	import { getUsersAPI } from '$lib/api/users';
	import User, { users } from '$lib/types/user';

	onMount(async () => {
		if (!requireLogin()) return;

		User.parseAll(await getUsersAPI());
	});

	$: filteredUsers = $users.filter((user) => {
		if (user.availability === 0) return false;
		if (timeslots === 0) return true;

		return user.availability & timeslots;
	});

	let timeslots = 0;
</script>

<Header />

<div class="w-4/5 m-auto mt-4">
	<h2 class="my-4 text-xl">{$_('timeslots.availabilities')}</h2>
	<Timeslots bind:timeslots />

	<h2 class="my-8 text-xl">{$_('timeslots.availableTutors')}</h2>

	{#if filteredUsers.length > 0}
		<table class="table-fixed w-full border-collapse text-center">
			<thead>
				<tr class="bg-gray-100">
					<th class="border-2 h-10">{$_('users.nickname')}</th>
					<th class="border-2">{$_('users.email')}</th>
					<th class="border-2">{$_('users.availability')}</th>
				</tr>
			</thead>
			<tbody>
				{#each filteredUsers as user}
					<tr>
						<td class="border-2">{user.nickname}</td>
						<td class="border-2">{user.email}</td>
						<td class="border-2">
							{#each Array.from({ length: 5 }, (_, i) => i) as i}
								{@const time = i * 2 + 8}
								{#each Array.from({ length: 5 }, (_, day) => day) as day}
									{@const bin = 1 << (i * 5 + day)}
									{#if user.availability & bin}
										<span class:font-bold={timeslots & bin}>
											{$_('utils.days.' + day)}
											{time}:30 - {time + 2}:30
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
		<p>{$_('timeslots.noTutors')}</p>
	{/if}
</div>
