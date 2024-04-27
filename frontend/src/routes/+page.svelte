<script lang="ts">
	import { getSessionsAPI } from '$lib/api/sessions';
	import EditParticipants from '$lib/components/sessions/editParticipants.svelte';
	import Session, { sessions } from '$lib/types/session';
	import { getBaseURL } from '$lib/utils/login';
	import { onMount } from 'svelte';
	import { displayDuration, displayTime } from '$lib/utils/date';
	import { Eye, EyeSlash, Icon, Trash, User as UserIcon } from 'svelte-hero-icons';
	import { t } from '$lib/services/i18n';
	import { user } from '$lib/types/user';

	let editParticipantsSession: Session | null;
	let ready = false;

	onMount(async () => {
		Session.parseAll(await getSessionsAPI());

		ready = true;
	});

	async function createSession() {
		await Session.create();
	}

	async function deleteSession(session: Session) {
		window.confirm($t('home.deleteSessionConirm')) && (await session.delete());
	}

	async function disableSession(session: Session) {
		await session.toggleDisable();
	}

	function editParticipants(session: Session) {
		editParticipantsSession = session;
	}
</script>

{#if ready}
	<div class="min-w-fit max-w-3xl m-auto p-0 mt-8">
		{#if $user?.is_tutor || $user?.is_admin}
			<button on:click|preventDefault={createSession} class="button float-end mb-4">
				{$t('home.createSession')}
			</button>
		{/if}
		<table class="w-full table-md table-zebra">
			<thead class=" uppercase text-sm bg-base-200">
				<tr>
					<th>{$t('home.remainingDuration')}</th>
					<th>{$t('home.participants')}</th>
					{#if $user?.is_tutor}
						<th>{$t('home.actions')}</th>
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
						class="text-center hover:cursor-pointer"
						class:text-gray-400={isHidden}
					>
						<td>
							{#if session.end_time < new Date()}
								{$t('home.sessionEnded')}
							{:else}
								{displayTime(session.start_time)}
							{/if}
						</td>
						<td>{session.usersList()}</td>

						{#if $user?.is_tutor}
							<td>
								<button on:click|preventDefault|stopPropagation={() => editParticipants(session)}>
									<Icon src={UserIcon} class="w-5 hover:text-secondaryHover" />
								</button>
								<button on:click|preventDefault|stopPropagation={() => disableSession(session)}>
									{#if session.is_active}
										<Icon src={EyeSlash} class="w-5 hover:text-secondaryHover" />
									{:else}
										<Icon src={Eye} class="w-5 hover:text-secondaryHover" />
									{/if}
								</button>
								{#if $user?.is_admin}
									<button on:click|preventDefault|stopPropagation={() => deleteSession(session)}>
										<Icon src={Trash} class="w-5 hover:text-secondaryHover" />
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
			<div class="text-center mt-8 text-gray-500 text-lg italic">{$t('home.noSessions')}</div>
		{/if}
	</div>
{/if}
