<script lang="ts">
	import { getSessionsAPI } from '$lib/api/sessions';
	import EditParticipants from '$lib/components/sessions/editParticipants.svelte';
	import Session, { sessions } from '$lib/types/session';
	import { getBaseURL } from '$lib/utils/login';
	import { onMount } from 'svelte';
	import { displayDate, displayTime } from '$lib/utils/date';
	import {
		Eye,
		EyeSlash,
		AcademicCap,
		Sparkles,
		Icon,
		Trash,
		User as UserIcon
	} from 'svelte-hero-icons';
	import { t } from '$lib/services/i18n';
	import User, { user } from '$lib/types/user';
	import { getUserContactsAPI, getUserContactSessionsAPI } from '$lib/api/users';

	let editParticipantsSession: Session | null;
	let ready = false;
	let contacts: User[] = [];
	$: contact = null as User | null;
	$: contactSessions = [] as Session[];

	async function selectContact(c: User | null) {
		contact = c;
		if (!contact) {
			contactSessions = [];
			return;
		}

		contactSessions = Session.parseAll(await getUserContactSessionsAPI($user!.id, contact.id));
	}

	onMount(async () => {
		if (!$user) return;
		contacts = User.parseAll(await getUserContactsAPI($user.id));
		if (contacts.length > 0) {
			selectContact(contacts[0]);
		}

		ready = true;
	});

	async function createSession() {
		if (!contact) return;
		let session = await Session.create();
		if (!session) return;
		await session.addUser(contact);
		contactSessions = [...contactSessions, session];
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
	<div class="h-full w-full flex">
		<ul class="h-full [width:_clamp(200px,25%,500px)] overflow-y-scroll border-r-2">
			{#each contacts as c (c.id)}
				<li
					class="h-20 flex border-gray-300 border-b-2 hover:bg-gray-200 hover:cursor-pointer"
					class:bg-gray-200={c.id === contact?.id}
					on:click={() => selectContact(c)}
					role="button"
					aria-label={c.nickname}
					tabindex="0"
					on:keydown={(e) => e.key === 'Enter' && selectContact(c)}
				>
					<div class="w-16 ml-2 mr-4 p-4 avatar bg-gray-300 mask-squircle mask">
						{#if c.type == 0}
							<Icon src={Sparkles} class="mask mask-squircle" />
						{:else if c.type == 1}
							<Icon src={AcademicCap} />
						{:else}
							<Icon src={UserIcon} />
						{/if}
					</div>
					<div class="flex items-center text-lg">
						{c.nickname}
					</div>
				</li>
			{/each}
		</ul>
		<div class="flex-grow flex-col flex">
			{#if contact}
				<div class="p-4 pr-8">
					{#if $user?.is_tutor || $user?.is_admin}
						<button on:click|preventDefault={createSession} class="button float-end">
							{$t('home.createSession')}
						</button>
					{:else}
						<a
							class="button float-end"
							class:btn-disabled={!$user || !$user.tutor || !$user.tutor.calcom_link}
							href={$user?.tutor?.calcom_link}
							target="_blank"
						>
							{$t('home.bookSession')}
						</a>
					{/if}
				</div>
				<div class="flex-grow p-2">
					<h2 class="text-xl my-4 font-bold">{$t('home.currentSessions')}</h2>
					<ul>
						{#each contactSessions as s (s.id)}
							{#if s.start_time <= new Date() && s.end_time >= new Date()}
								<li>
									<a
										class="block p-4 m-1 mx-4 rounded-md w-[calc(100%-32px)] border-2 hover:bg-gray-200 text-center"
										href={`/session?id=${s.id}`}
									>
										{displayTime(s.start_time)} - {displayTime(s.end_time)}
									</a>
								</li>
							{/if}
						{/each}
					</ul>
					<h2 class="text-xl my-4 font-bold">{$t('home.plannedSessions')}</h2>
					<ul>
						{#each contactSessions as s (s.id)}
							{#if s.start_time > new Date()}
								<li>
									<a
										class="block p-4 m-1 mx-4 rounded-md w-[calc(100%-32px)] border-2 hover:bg-gray-200 text-center"
										href={`/session?id=${s.id}`}
									>
										{displayTime(s.start_time)} - {displayTime(s.end_time)}
									</a>
								</li>
							{/if}
						{/each}
					</ul>
					<h2 class="text-xl my-4 font-bold">{$t('home.pastSessions')}</h2>
					<ul>
						{#each contactSessions as s (s.id)}
							{#if s.end_time < new Date()}
								<li>
									<a
										class="block p-4 m-1 mx-4 rounded-md w-[calc(100%-32px)] border-2 hover:bg-gray-200 text-center"
										href={`/session?id=${s.id}`}
									>
										{displayTime(s.start_time)} - {displayTime(s.end_time)}
									</a>
								</li>
							{/if}
						{/each}
					</ul>
				</div>
			{/if}
		</div>
	</div>
{/if}
