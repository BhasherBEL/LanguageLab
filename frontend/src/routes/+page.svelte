<script lang="ts">
	import Session from '$lib/types/session';
	import { onMount } from 'svelte';
	import { displayShortTime, displayTimeSince } from '$lib/utils/date';
	import {
		AcademicCap,
		Sparkles,
		Icon,
		User as UserIcon,
		MagnifyingGlass,
		ArrowRightCircle
	} from 'svelte-hero-icons';
	import { t } from '$lib/services/i18n';
	import User from '$lib/types/user';
	import {
		createUserContactFromEmailAPI,
		getUserContactsAPI,
		getUserContactSessionsAPI
	} from '$lib/api/users';
	import { createSessionFromCalComAPI } from '$lib/api/sessions';
	import { toastAlert, toastSuccess, toastWarning } from '$lib/utils/toasts';
	import { get } from 'svelte/store';

	let { data } = $props();
	let user = data.user;
	let contacts: User[] = $state(data.contacts);
	let contact: User | undefined = $state(data.contact);
	let contactSessions: Session[] = $state(data.sessions);

	let modalNew = $state(false);
	let nickname = $state('');

	let showTerminatedSessions = $state(false);

	async function selectContact(c: User | undefined) {
		showTerminatedSessions = false;
		contact = c;
		if (!contact) {
			contactSessions = [];
			return;
		}

		contactSessions = Session.parseAll(
			await getUserContactSessionsAPI(fetch, user.id, contact.id)
		).sort((a, b) => b.start_time.getTime() - a.start_time.getTime());
	}

	onMount(async () => {
		(function (C: any, A: any, L: any) {
			let p = function (a: any, ar: any) {
				a.q.push(ar);
			};
			let d = C.document;
			C.Cal =
				C.Cal ||
				function () {
					let cal = C.Cal;
					let ar = arguments;
					if (!cal.loaded) {
						cal.ns = {};
						cal.q = cal.q || [];
						d.head.appendChild(d.createElement('script')).src = A;
						cal.loaded = true;
					}
					if (ar[0] === L) {
						const api: any = function () {
							p(api, arguments);
						};
						const namespace = ar[1];
						api.q = api.q || [];
						if (typeof namespace === 'string') {
							cal.ns[namespace] = cal.ns[namespace] || api;
							p(cal.ns[namespace], ar);
							p(cal, ['initNamespace', namespace]);
						} else p(cal, ar);
						return;
					}
					p(cal, ar);
				};
		})(window, 'https://app.cal.com/embed/embed.js', 'init');
		// @ts-ignore
		Cal('init');
		// @ts-ignore
		Cal('on', {
			action: 'bookingSuccessful',
			callback: async (e: any) => {
				if (!contact || !user || !e.detail.data) {
					toastAlert(get(t)('home.bookingFailed'));
					return;
				}

				const date = new Date(e.detail.data.date);
				const duration = e.detail.data.duration;
				const end = new Date(date.getTime() + duration * 60000);
				const sess_id: number | null = await createSessionFromCalComAPI(
					user.id,
					contact.id,
					date,
					end
				);
				if (!sess_id) {
					toastAlert(get(t)('home.bookingFailed'));
					return;
				}
				toastSuccess(get(t)('home.bookingSuccessful'));
				contactSessions = Session.parseAll(
					await getUserContactSessionsAPI(fetch, user!.id, contact.id)
				).sort((a, b) => b.start_time.getTime() - a.start_time.getTime());
			}
		});
	});

	async function createSession() {
		if (!contact) return;
		let session = await Session.create();
		if (!session) return;
		await session.addUser(contact);
		contactSessions = [...contactSessions, session].sort(
			(a, b) => b.start_time.getTime() - a.start_time.getTime()
		);
	}

	async function searchNickname() {
		if (!user || !nickname || !nickname.includes('@')) {
			toastWarning('Please enter a valid email address');
			return;
		}

		const res = await createUserContactFromEmailAPI(fetch, user.id, nickname);
		if (!res) return;

		modalNew = false;
		contacts = User.parseAll(await getUserContactsAPI(fetch, user.id));
	}
</script>

<div class="flex-row h-full flex py-4 flex-grow overflow-y-hidden">
	<div class="flex flex-col border shadow-[0_0_6px_0_rgba(0,14,156,.2)] min-w-72 rounded-r-xl">
		<div class="flex-grow">
			{#each contacts as c (c.id)}
				<div
					class="h-24 flex border-gray-300 border-b-2 hover:bg-gray-200 hover:cursor-pointer p-4"
					class:bg-gray-200={c.id === contact?.id}
					onclick={() => selectContact(c)}
					role="button"
					aria-label={c.nickname}
					tabindex="0"
					onkeydown={(e) => e.key === 'Enter' && selectContact(c)}
				>
					<div class="w-16 ml-2 mr-4 p-4 bg-gray-300 rounded-2xl">
						{#if c.type == 0}
							<Icon src={Sparkles} class="mask mask-squircle" />
						{:else if c.type == 1}
							<Icon src={AcademicCap} class="" />
						{:else}
							<Icon src={UserIcon} />
						{/if}
					</div>
					<div class="text-lg font-bold capitalize flex items-center">
						{c.nickname}
					</div>
				</div>
			{/each}
		</div>
		<button
			class="h-20 w-full flex justify-center items-center text-lg border-gray-200 border-t hover:bg-gray-200"
			onclick={() => (modalNew = true)}
		>
			+
		</button>
	</div>
	{#if contact}
		<div class="flex flex-col xl:mx-auto xl:w-[60rem] m-4">
			<div>
				<button
					onclick={(e) => {
						e.preventDefault();
						createSession();
					}}
					class="button float-start mr-2"
				>
					{$t('home.createSession')}
				</button>
				<button
					class="button float-start"
					class:btn-disabled={!contact || !contact.calcom_link}
					data-cal-link={`${contact.calcom_link}?email=${user?.email}&name=${user?.nickname}`}
				>
					{$t('home.bookSession')}
				</button>
			</div>
			<div
				class="border p-4 mt-4 rounded-xl shadow-[0_0_6px_0_rgba(0,14,156,.2)] overflow-y-scroll no-scrollbar"
			>
				<table class="divide-y divide-neutral-300 text-center w-full table-fixed">
					<thead>
						<tr>
							<th scope="col" class="text-left">{$t('utils.words.date')}</th>
							<th scope="col">{$t('utils.words.status')}</th>
							<th scope="col"># {$t('utils.words.messages').toLowerCase()}</th>
							<th scope="col">{$t('utils.words.actions')}</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-neutral-200">
						{#if contactSessions.length === 0}
							<tr>
								<td colspan="4" class="py-5 text-gray-500">{$t('home.noSessions')}</td>
							</tr>
						{:else}
							{#if !showTerminatedSessions && contactSessions.filter((s) => s.end_time >= new Date()).length === 0}
								<tr>
									<td colspan="4" class="py-5 text-gray-500"
										>{$t('home.noCurrentOrFutureSessions')}</td
									>
								</tr>
							{/if}
							{#each contactSessions as s (s.id)}
								{#if showTerminatedSessions || s.end_time >= new Date()}
									<tr>
										<td class="py-2 text-left space-y-1">
											<div>
												{displayShortTime(s.start_time)}
											</div>
											<div class="text-sm italic text-gray-600">
												{displayTimeSince(s.start_time)}
											</div>
										</td>
										<td class="py-2">
											{#if s.start_time <= new Date() && s.end_time >= new Date()}
												<span class="bg-green-200 rounded-lg px-2 py-1"
													>{$t('utils.words.inProgress')}</span
												>
											{:else if s.start_time > new Date()}
												<span class="bg-orange-200 rounded-lg px-2 py-1"
													>{$t('utils.words.programed')}</span
												>
											{:else}
												<span class="bg-red-200 rounded-lg px-2 py-1"
													>{$t('utils.words.finished')}</span
												>
											{/if}
										</td>
										<td class="py-2">{s.length} {$t('utils.words.messages').toLowerCase()}</td>
										<td class="py-2">
											<a href="/sessions/{s.id}" class="group">
												<Icon
													src={ArrowRightCircle}
													size="32"
													class="text-accent mx-auto group-hover:text-white group-hover:bg-accent rounded-full"
												/>
											</a>
										</td>
									</tr>
								{/if}
							{/each}
							<tr>
								<td
									class="py-2 hover:cursor-pointer"
									colspan="4"
									onclick={() => (showTerminatedSessions = !showTerminatedSessions)}
								>
									<button aria-label={showTerminatedSessions ? 'Hide' : 'Show'}>
										<svg
											class="size-3 ms-3"
											aria-hidden="true"
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 10 6"
											class:rotate-180={showTerminatedSessions}
										>
											<path
												stroke="currentColor"
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="m1 1 4 4 4-4"
											/>
										</svg>
									</button>
								</td>
							</tr>
						{/if}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>

<dialog
	class="modal bg-black bg-opacity-50"
	open={modalNew}
	onclose={() => (modalNew = false)}
	tabindex="-1"
>
	<div class="modal-box">
		<h2 class="text-xl font-bold mb-4">{$t('home.newContact')}</h2>
		<div class="w-full flex">
			<input
				type="text"
				placeholder={$t('home.email')}
				bind:value={nickname}
				class="input flex-grow mr-2"
				onkeydown={(e) => e.key === 'Escape' && (modalNew = false)}
			/>
			<button class="button w-16" onclick={searchNickname}>
				<Icon src={MagnifyingGlass} />
			</button>
		</div>
		<form method="dialog" class="mt-4">
			<button class="btn float-end">Close</button>
		</form>
	</div>
</dialog>
