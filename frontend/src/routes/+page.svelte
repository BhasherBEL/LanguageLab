<script lang="ts">
	import Session from '$lib/types/session';
	import { onMount } from 'svelte';
	import { displayShortTime, displayTime, displayTimeSince } from '$lib/utils/date';
	import {
		AcademicCap,
		Sparkles,
		Icon,
		User as UserIcon,
		MagnifyingGlass,
		ArrowRight,
		ArrowRightCircle
	} from 'svelte-hero-icons';
	import { t } from '$lib/services/i18n';
	import User, { user } from '$lib/types/user';
	import {
		createUserContactFromEmailAPI,
		getUserContactsAPI,
		getUserContactSessionsAPI
	} from '$lib/api/users';
	import { createSessionFromCalComAPI } from '$lib/api/sessions';
	import { toastAlert, toastSuccess, toastWarning } from '$lib/utils/toasts';
	import { get } from 'svelte/store';

	let ready = false;
	$: contacts = [] as User[];
	$: contact = null as User | null;
	$: contactSessions = [] as Session[];
	let modalNew = false;
	let nickname = '';

	async function selectContact(c: User | null) {
		contact = c;
		if (!contact) {
			contactSessions = [];
			return;
		}

		contactSessions = Session.parseAll(await getUserContactSessionsAPI($user!.id, contact.id)).sort(
			(a, b) => b.start_time.getTime() - a.start_time.getTime()
		);
	}

	onMount(async () => {
		if (!$user) return;
		contacts = User.parseAll(await getUserContactsAPI($user.id));
		if (contacts.length > 0) {
			selectContact(contacts[0]);
		}

		ready = true;

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
				if (!contact || !$user || !e.detail.data) {
					toastAlert(get(t)('home.bookingFailed'));
					return;
				}

				const date = new Date(e.detail.data.date);
				const duration = e.detail.data.duration;
				const end = new Date(date.getTime() + duration * 60000);
				const sess_id: number | null = await createSessionFromCalComAPI(
					$user.id,
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
					await getUserContactSessionsAPI($user!.id, contact.id)
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
		if (!$user || !nickname || !nickname.includes('@')) {
			toastWarning('Please enter a valid email address');
			return;
		}

		const res = await createUserContactFromEmailAPI($user.id, nickname);
		if (!res) return;

		modalNew = false;
		contacts = User.parseAll(await getUserContactsAPI($user.id));
	}
</script>

<svelte:head>
	<script>
	</script>
</svelte:head>

{#if ready}
	<div class="flex-col flex p-4 lg:w-[64rem] lg:mx-auto">
		{#if contact}
			<div>
				<button on:click|preventDefault={createSession} class="button float-start mr-2">
					{$t('home.createSession')}
				</button>
				<button
					class="button float-start"
					class:btn-disabled={!contact || !contact.calcom_link}
					data-cal-link={`${contact.calcom_link}?email=${$user?.email}&name=${$user?.nickname}`}
				>
					{$t('home.bookSession')}
				</button>
			</div>
			<div
				class="border p-4 mt-4 rounded-xl shadow-[0_0_6px_0_rgba(0,14,156,.2)] overflow-y-scroll no-scrollbar"
			>
				<table class="divide-y divide-neutral-300 text-center w-full">
					<thead>
						<tr>
							<th scope="col" class="text-left">Date</th>
							<th scope="col">Status</th>
							<th scope="col">Participants</th>
							<th scope="col"># messages</th>
							<th scope="col"></th>
						</tr>
					</thead>
					<tbody class="divide-y divide-neutral-200">
						{#each contactSessions as s (s.id)}
							<tr>
								<td class="py-2 text-left">
									<div>
										{displayShortTime(s.start_time)}
									</div>
									<div class="text-sm italic text-gray-600">
										{displayTimeSince(s.start_time)}
									</div>
								</td>
								<td class="py-2">
									{#if s.start_time >= new Date(2024, 10, 13, 3) && s.start_time <= new Date()}
										<span class="bg-purple-200 rounded-lg px-2 py-1">En ligne</span>
									{:else if s.start_time <= new Date() && s.end_time >= new Date()}
										<span class="bg-green-200 rounded-lg px-2 py-1">En cours</span>
									{:else if s.start_time > new Date()}
										<span class="bg-orange-200 rounded-lg px-2 py-1">Programmée</span>
									{:else}
										<span class="bg-red-200 rounded-lg px-2 py-1">Terminée</span>
									{/if}
								</td>
								<td class="py-2">{s.otherUsersList(5)}</td>
								<td class="py-2">4 messages</td>
								<td class="py-2">
									<a href="/session?id={s.id}">
										<Icon
											src={ArrowRightCircle}
											size="32"
											class="text-accent float-end hover:text-white hover:bg-accent hover:cursor-pointer rounded-full"
										/>
									</a>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
{/if}

<dialog
	class="modal"
	open={modalNew}
	on:close={() => (modalNew = false)}
	on:keydown={(e) => e.key === 'Escape' && (modalNew = false)}
	tabindex="0"
>
	<div class="modal-box">
		<h2 class="text-xl font-bold mb-4">{$t('home.newContact')}</h2>
		<div class="w-full flex">
			<input
				type="text"
				placeholder={$t('home.email')}
				bind:value={nickname}
				class="input flex-grow mr-2"
			/>
			<button class="button w-16" on:click={searchNickname}>
				<Icon src={MagnifyingGlass} />
			</button>
		</div>
		<form method="dialog" class="mt-4">
			<button class="btn float-end">Close</button>
		</form>
	</div>
</dialog>
