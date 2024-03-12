<script lang="ts">
	import { getSessionsAPI } from '$lib/api/sessions';
	import Header from '$lib/components/header.svelte';
	import Session, { sessions } from '$lib/types/session';
	import { requireLogin } from '$lib/utils/login';
	import { toastAlert, toastSuccess } from '$lib/utils/toasts';
	import { onMount } from 'svelte';

	onMount(async () => {
		requireLogin();

		Session.parseAll(await getSessionsAPI());
	});

	async function createSession() {
		await Session.create();
	}

	async function deleteSession(session: Session) {
		window.confirm('Are you sure you want to delete this session?') && (await session.delete());
	}
</script>

<Header />

<h1>Sessions</h1>

<button on:click|preventDefault={createSession}>Create session</button>

{#if $sessions.length === 0}
	<p>No sessions found</p>
{:else}
	<table>
		<thead>
			<tr>
				<th>#</th>
				<th>Date</th>
				<th>participants</th>
				<th>Actions</th>
			</tr>
		</thead>
		<tbody>
			{#each $sessions as session (session.id)}
				<tr on:click={() => (window.location.href = '/session?id=' + session.id)} tabindex="0">
					<td>{session.id}</td>
					<td></td>
					<td>{session.usersList()}</td>
					<td
						><button on:click|preventDefault|stopPropagation={() => deleteSession(session)}
							>X</button
						></td
					>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}

<style lang="less">
	table {
		border-collapse: collapse;
		margin-bottom: 20px;
	}

	th,
	td {
		padding: 10px;
		border: 1px solid #ddd;
		text-align: left;
	}

	thead {
		background-color: #f2f2f2;
	}

	tr:nth-child(even) {
		background-color: #f9f9f9;
	}

	tbody tr:hover {
		background-color: #e5e5e5;
		cursor: pointer;
	}
</style>
