<script lang="ts">
	import Session from '$lib/types/session';
	import { onMount } from 'svelte';
	import { displayTime } from '$lib/utils/date';
	import {
		AcademicCap,
		Sparkles,
		Icon,
		User as UserIcon,
		MagnifyingGlass
	} from 'svelte-hero-icons';
	import { t } from '$lib/services/i18n';
	import User, { user } from '$lib/types/user';
	import {
		createUserContactFromEmailAPI,
		getUserContactsAPI,
		getUserContactSessionsAPI
	} from '$lib/api/users';
	import { createSessionFromCalComAPI } from '$lib/api/sessions';
	import { toastAlert, toastWarning } from '$lib/utils/toasts';

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

		contactSessions = Session.parseAll(await getUserContactSessionsAPI($user!.id, contact.id));
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
			callback: (e: any) => {
				if (!contact || !$user || !e.detail.data) {
					toastAlert('Automatic session creation failed');
					return;
				}

				let date = new Date(e.detail.data.date);
				let duration = e.detail.data.duration;
				let end = new Date(date.getTime() + duration * 60000);
				createSessionFromCalComAPI($user.id, contact.id, date, end);
			}
		});
	});

	async function createSession() {
		if (!contact) return;
		let session = await Session.create();
		if (!session) return;
		await session.addUser(contact);
		contactSessions = [...contactSessions, session];
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
	<div class="h-full w-full flex">
		<ul class="h-full [width:_clamp(200px,25%,500px)] overflow-y-scroll border-r-2 flex flex-col">
			<div class="flex-grow">
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
			</div>
			<button
				class="h-20 w-full flex justify-center items-center text-lg border-gray-200 border-t hover:bg-gray-200"
				on:click={() => (modalNew = true)}
			>
				+
			</button>
		</ul>
		<div class="flex-grow flex-col flex">
			{#if contact}
				<div class="p-4 pr-8">
					<button on:click|preventDefault={createSession} class="button float-end">
						{$t('home.createSession')}
					</button>
					<div class="size-4 float-end"></div>
					<button
						class="button float-end"
						class:btn-disabled={!contact || !contact.calcom_link}
						data-cal-link={`${contact.calcom_link}?email=${$user?.email}&name=${$user?.nickname}`}
					>
						{$t('home.bookSession')}
					</button>
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
