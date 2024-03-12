<script lang="ts">
	import type Session from '$lib/types/session';
	import type User from '$lib/types/user';
	import { users } from '$lib/types/user';
	import TrashIcon from '$lib/components/icons/trashIcon.svelte';

	export let session: Session;

	export let onClose: () => void;

	let newParticipant = '';

	async function removeParticipant(user: User) {
		await session.removeUser(user);
	}

	async function addParticipant() {
		if (newParticipant === '') return;

		const user = users.search(newParticipant);
		if (user === null || user == undefined) {
			return;
		}

		await session.addUser(user);
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
			{#each session.users as user (user.id)}
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
				<td><input bind:value={newParticipant} placeholder="Add new participant" /></td>
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
</style>
