<script lang="ts">
	import User from '$lib/types/user';
	import { t } from '$lib/services/i18n';
	import Gravatar from 'svelte-gravatar';
	import { ArrowRight, Icon } from 'svelte-hero-icons';

	export let users: User[];
	export let onSelect: ((user: User) => void) | null = null;
</script>

<h2 class="my-8 text-xl">{$t('timeslots.availableTutors')}</h2>

{#if users.length > 0}
	<table class="table-fixed w-full border-collapse text-center">
		<thead>
			<tr class="bg-gray-100">
				<th class="border-2">{$t('users.avatar')}</th>
				<th class="border-2 h-10">{$t('users.nickname')}</th>
				<th class="border-2">{$t('users.email')}</th>
				<th class="border-2">{$t('users.gender')}</th>
				<th class="border-2">{$t('users.availability')}</th>
				<th class="border-2">{$t('users.available_slots')}</th>
				{#if onSelect}
					<th class="border-2"></th>
				{/if}
			</tr>
		</thead>
		<tbody>
			{#each users as user}
				<tr>
					<td class="border-2">
						<Gravatar email={user.email} size={32} />
					</td>
					<td class="border-2">{user.nickname}</td>
					<td class="border-2">{user.email}</td>
					<td class="border-2">{$t('users.genders.' + user.gender)}</td>
					<td class="border-2">
						{#if user.availabilities && user.availabilities.length > 0}
							{#each user.availabilities as availability}
								<span>
									{$t('utils.days.' + availability.day)}
									{availability.start} - {availability.end}
									<br />
								</span>
							{/each}
						{:else}
							<span class="text-gray-400">{$t('users.no_slots_available')}</span>
						{/if}
					</td>
					<td class="border-2">
						{#if user.available_slots !== null && user.available_slots !== undefined}
							<span
								class="font-semibold"
								class:text-green-600={user.available_slots > 0}
								class:text-red-600={user.available_slots === 0}
							>
								{user.available_slots}
							</span>
						{:else}
							<span class="text-gray-400">N/A</span>
						{/if}
					</td>
					{#if onSelect}
						<td class="border-2 text-center">
							<button class="button m-auto" on:click={() => onSelect(user)}>
								<Icon src={ArrowRight} size="32" />
							</button>
						</td>
					{/if}
				</tr>
			{/each}
		</tbody>
	</table>
{:else}
	<p>{$t('timeslots.noTutors')}</p>
{/if}
