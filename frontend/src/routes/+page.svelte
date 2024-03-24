<script lang="ts">
	import { getSessionsAPI } from '$lib/api/sessions';
	import Header from '$lib/components/header.svelte';
	import EditParticipants from '$lib/components/sessions/editParticipants.svelte';
	import Session, { sessions } from '$lib/types/session';
	import { getBaseURL, requireLogin } from '$lib/utils/login';
	import { onMount } from 'svelte';
	import { displayDuration } from '$lib/utils/date';
	import JWTSession from '$lib/stores/JWTSession';
	import { Eye, EyeSlash, Icon, Trash, User } from 'svelte-hero-icons';
	import { _ } from '$lib/services/i18n';

	let editParticipantsSession: Session | null;
	let ready = false;

	onMount(async () => {
		if (!requireLogin()) return;

		Session.parseAll(await getSessionsAPI());

		ready = true;
	});

	async function createSession() {
		await Session.create();
	}

	async function deleteSession(session: Session) {
		window.confirm($_('home.deleteSessionConirm')) && (await session.delete());
	}

	async function disableSession(session: Session) {
		await session.toggleDisable();
	}

	function editParticipants(session: Session) {
		editParticipantsSession = session;
	}
</script>

{#if ready}
	<Header />

	<div class="min-w-fit max-w-3xl m-auto p-0 mt-8">
		{#if JWTSession.user()?.is_tutor}
			<button on:click|preventDefault={createSession} class="button float-end mb-4">
				{$_('home.createSession')}
			</button>
		{/if}
		<table class="w-full shadow-md">
			<thead class="bg-gray-200 uppercase text-sm">
				<tr>
					<th class="py-2 px-6">#</th>
					<th class="py-2 px-6">{$_('home.remainingDuration')}</th>
					<th class="py-2 px-6">{$_('home.participants')}</th>
					{#if JWTSession.user()?.is_tutor}
						<th class="py-2 px-6">{$_('home.actions')}</th>
					{/if}
				</tr>
			</thead>
			<tbody>
				{#each $sessions.sort((a, b) => b.end_time.getTime() - a.end_time.getTime()) as session (session.id)}
					{@const isHidden =
						!session.is_active || session.end_time < new Date() || session.start_time > new Date()}
					<tr
						on:click={() => (window.location.href = getBaseURL() + '/session/?id=' + session.id)}
						tabindex="0"
						class="odd:bg-white even:bg-gray-100 text-center hover:cursor-pointer"
						class:text-gray-400={isHidden}
					>
						<td class="py-3 px-6">{session.id}</td>
						<td class="py-3 px-6">
							{#if session.end_time < new Date()}
								{$_('home.sessionEnded')}
							{:else if session.start_time > new Date()}
								({displayDuration(new Date(), session.start_time)}) - {displayDuration(
									new Date(),
									session.end_time
								)}
							{:else}
								{displayDuration(new Date(), session.end_time)}
							{/if}
						</td>
						<td class="py-3 px-6">{session.usersList()}</td>

						{#if JWTSession.user()?.is_tutor}
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
						{/if}
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
		{#if !$sessions.length}
			<div class="text-center mt-8 text-gray-500 text-lg italic">{$_('home.noSessions')}</div>
		{/if}
	</div>
{/if}
