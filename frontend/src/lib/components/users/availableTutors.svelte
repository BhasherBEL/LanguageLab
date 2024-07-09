<script lang="ts">
	import User from '$lib/types/user';
	import { t } from '$lib/services/i18n';
	import Gravatar from 'svelte-gravatar';
	import { ArrowRight, Icon } from 'svelte-hero-icons';

	export let users: User[];
	export let timeslots: bigint;
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
				{#if onSelect}
					<th class="border-2"></th>
				{/if}
			</tr>
		</thead>
		<tbody>
			{#each users as user}
				<tr>
					<td class="border-2">
						<Gravatar email={user.email} size={32} title={user.nickname} class="rounded" />
					</td>
					<td class="border-2">{user.nickname}</td>
					<td class="border-2">{user.email}</td>
					<td class="border-2">{$t('users.genders.' + user.gender)}</td>
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
