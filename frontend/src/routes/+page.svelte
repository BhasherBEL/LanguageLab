<script lang="ts">
	import { getSessionsAPI } from '$lib/api/sessions';
	import Header from '$lib/components/header.svelte';
	import EditParticipants from '$lib/components/sessions/editParticipants.svelte';
	import Session, { sessions } from '$lib/types/session';
	import { requireLogin } from '$lib/utils/login';
	import { onMount } from 'svelte';
	import { displayDate } from '$lib/utils/date';
	import JWTSession from '$lib/stores/JWTSession';
	import { Eye, EyeSlash, Icon, Trash, User } from 'svelte-hero-icons';

	let editParticipantsSession: Session | null;

	onMount(async () => {
		if (!requireLogin()) return;

		Session.parseAll(await getSessionsAPI());
	});

	async function createSession() {
		await Session.create();
	}

	async function deleteSession(session: Session) {
		window.confirm('Are you sure you want to delete this session? All data will be lost!') &&
			(await session.delete());
	}

	async function disableSession(session: Session) {
		await session.disable();
	}

	function editParticipants(session: Session) {
		editParticipantsSession = session;
	}
</script>

<Header />

<div class="min-w-fit max-w-3xl m-auto p-0 mt-8">
	<button on:click|preventDefault={createSession} class="button float-end mb-4">
		Créer une nouvelle session
	</button>
	<table class="w-full shadow-md">
		<thead class="bg-gray-200 uppercase text-sm">
			<tr>
				<th class="py-2 px-6">#</th>
				<th class="py-2 px-6">Date</th>
				<th class="py-2 px-6">participants</th>
				<th class="py-2 px-6">Actions</th>
			</tr>
		</thead>
		<tbody>
			{#each $sessions.sort((a, b) => a.created_at.getTime() - b.created_at.getTime()) as session (session.id)}
				<tr
					on:click={() => (window.location.href = '/session?id=' + session.id)}
					tabindex="0"
					class="odd:bg-white even:bg-gray-100 text-center hover:cursor-pointer"
					class:text-gray-500={!session.is_active}
					class:line-trough={!session.is_active}
				>
					<td class="py-3 px-6">{session.id}</td>
					<td class="py-3 px-6">{displayDate(session.created_at)}</td>
					<td class="py-3 px-6">{session.usersList()}</td>
					<td class="py-3 px-6">
						<button on:click|preventDefault|stopPropagation={() => editParticipants(session)}>
							<Icon src={User} class="w-5 hover:text-secondaryHover" />
						</button>
						<button on:click|preventDefault|stopPropagation={() => disableSession(session)}>
							{#if session.is_active}
								<Icon src={EyeSlash} class="w-5  hover:text-secondaryHover" />
							{:else}
								<Icon src={Eye} class="w-5  hover:text-secondaryHover" />
							{/if}
						</button>
						{#if JWTSession.user()?.is_admin}
							<button on:click|preventDefault|stopPropagation={() => deleteSession(session)}>
								<Icon src={Trash} class="w-5  hover:text-secondaryHover" />
							</button>
						{/if}
					</td>
				</tr>

				{#if editParticipantsSession === session}
					<EditParticipants
						bind:session={editParticipantsSession}
						onClose={() => (editParticipantsSession = null)}
					/>
				{/if}
			{/each}
		</tbody>
	</table>
</div>
