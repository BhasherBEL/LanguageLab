<script lang="ts">
	import type Session from '$lib/types/session';
	import type User from '$lib/types/user';
	import { users } from '$lib/types/user';
	import TrashIcon from '$lib/components/icons/trashIcon.svelte';
	import Select from 'svelte-select';
	import { get } from 'svelte/store';
	import { onMount } from 'svelte';

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
<div id="bg" on:click|preventDefault|stopPropagation={onClose}>
	<div class="menu" on:click|stopPropagation>
		<h1>Edit Participants</h1>
		<table>
			<thead>
				<tr>
					<th>Username</th>
					<th>Actions</th>
				</tr>
			</thead>
			{#each sessionUsers as user (user.id)}
				<tr>
					<td>{user.username}</td>
					<td>
						<button on:click={() => removeParticipant(user)}>
							<TrashIcon />
						</button>
					</td>
				</tr>
			{/each}
			<tr>
				<!-- <td><input bind:value={newParticipant} placeholder="Add new participant" /></td> -->
				<Select items={dropDownUsers} bind:value={selected}></Select>
				<td><button on:click={addParticipant}>Add Participant</button></td>
			</tr>
		</table>
	</div>
</div>

<style lang="less">
	.menu {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -75%);
		background-color: white;
		padding: 20px;
		border-radius: 10px;
	}

	#bg {
		background-color: #000c;
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}

	td {
		min-width: 200px;
	}
</style>