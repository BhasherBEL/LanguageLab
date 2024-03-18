<script lang="ts">
	import type Session from '$lib/types/session';
	import type User from '$lib/types/user';
	import { users } from '$lib/types/user';
	import Select from 'svelte-select';
	import { get } from 'svelte/store';
	import { onMount } from 'svelte';
	import { Icon, XMark } from 'svelte-hero-icons';
	import { _ } from '$lib/services/i18n';

	export let session: Session;

	export let onClose: () => void;

	let sessionUsers = session.users;

	let selected: { value: User; label: string } | null;
	let dropDownUsers: { value: User; label: string }[] = [];

	function calculateDropDownUsers() {
		dropDownUsers = get(users)
			.filter((user) => !session.hasUser(user))
			.map((user) => {
				return {
					value: user,
					label: user.username
				};
			});
	}

	onMount(async () => {
		await users.fetch();
		calculateDropDownUsers();
	});

	async function removeParticipant(user: User) {
		await session.removeUser(user);
		sessionUsers = session.users;
		calculateDropDownUsers();
	}

	async function addParticipant() {
		if (selected === null) return;
		const user = selected.value;
		await session.addUser(user);
		sessionUsers = session.users;
		selected = null;
		calculateDropDownUsers();
	}
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	on:click|preventDefault|stopPropagation={onClose}
	class="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center"
>
	<div class="bg-white w-full min-w-fit max-w-md rounded p-4" on:click|stopPropagation>
		<div class="float-right w-8 hover:text-red-500 hover:cursor-pointer" on:click={onClose}>
			<Icon src={XMark} />
		</div>
		<h1 class="text-xl font-bold pb-4">{$_('home.participants')}</h1>
		<table class="w-full shadow-md">
			<thead class="bg-gray-200 uppercase text-sm">
				<tr>
					<th class="py-2 px-6">{$_('home.username')}</th>
					<th class="py-2 px-6">{$_('home.actions')}</th>
				</tr>
			</thead>
			{#each sessionUsers as user (user.id)}
				<tr class="even:bg-white odd:bg-gray-100 text-center">
					<td class="py-3 px-6 w-2/3">{user.username}</td>
					<td class="py-3 px-6 w-1/3">
						<button on:click={() => removeParticipant(user)}>
							<Icon src={XMark} class="w-6" />
						</button>
					</td>
				</tr>
			{/each}
			<tr class="text-center">
				<td
					><Select
						items={dropDownUsers}
						bind:value={selected}
						placeholder={$_('home.participantPlaceholder')}
					></Select></td
				>
				<td><button on:click={addParticipant} class="button">{$_('home.add')}</button></td>
			</tr>
		</table>
	</div>
</div>
