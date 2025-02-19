<script lang="ts">
	import { t } from '$lib/services/i18n';
	import Study from '$lib/types/study.svelte';
	import { displayDate, formatToUTCDate } from '$lib/utils/date';
	import autosize from 'svelte-autosize';
	import DateInput from '$lib/components/utils/dateInput.svelte';
	import { toastAlert, toastSuccess, toastWarning } from '$lib/utils/toasts';
	import User from '$lib/types/user';
	import { Icon, MagnifyingGlass } from 'svelte-hero-icons';
	import { getUserByEmailAPI } from '$lib/api/users';
	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();

	let studies: Study[] = $state(data.studies);
	let selectedStudy: Study | null = $state(null);
	let title: string | null = $state(null);
	let description: string | null = $state(null);
	let startDate: Date | null = $state(null);
	let endDate: Date | null = $state(null);
	let chatDuration: number = $state(30);
	let typingTest: boolean = $state(false);

	function selectStudy(study: Study | null) {
		selectedStudy = study;

		title = study?.title ?? null;
		description = study?.description ?? null;
		startDate = study?.startDate ?? null;
		endDate = study?.endDate ?? null;
		chatDuration = study?.chatDuration ?? 30;
	}

	async function studyUpdate() {
		if (
			selectedStudy === null ||
			title === null ||
			description === null ||
			startDate === null ||
			endDate === null ||
			chatDuration === null ||
			title === '' ||
			description === '' ||
			(title === selectedStudy.title &&
				description === selectedStudy.description &&
				startDate.getDay() === selectedStudy.startDate.getDay() &&
				startDate.getMonth() === selectedStudy.startDate.getMonth() &&
				startDate.getFullYear() === selectedStudy.startDate.getFullYear() &&
				endDate.getDay() === selectedStudy.endDate.getDay() &&
				endDate.getMonth() === selectedStudy.endDate.getMonth() &&
				endDate.getFullYear() === selectedStudy.endDate.getFullYear() &&
				chatDuration === selectedStudy.chatDuration)
		) {
			selectStudy(null);
			toastSuccess($t('studies.noChanges'));
			return;
		}

		const result = await selectedStudy.patch({
			title,
			description,
			start_date: formatToUTCDate(startDate),
			end_date: formatToUTCDate(endDate),
			chat_duration: chatDuration,
			typing_test: typingTest
		});

		if (result) {
			selectStudy(null);
			toastSuccess($t('studies.updated'));
		} else {
			toastAlert($t('studies.updateError'));
		}
	}

	async function deleteStudy() {
		if (!selectedStudy) return;

		studies.splice(studies.indexOf(selectedStudy), 1);
		selectedStudy?.delete();
		selectStudy(null);
	}

	async function removeUser(user: User) {
		if (selectedStudy === null) return;
		if (!confirm($t('studies.removeUserConfirm'))) return;

		const res = await selectedStudy.removeUser(user);

		if (res) {
			toastSuccess($t('studies.removeUserSuccess'));
			selectStudy(null);
		} else {
			toastAlert($t('studies.removeUserError'));
		}
	}

	let newUsername: string = $state('');
	let newUserModal = $state(false);

	async function addUser() {
		if (selectedStudy === null) return;
		newUserModal = true;
	}

	async function searchUser() {
		if (selectedStudy === null) return;
		if (!newUsername || !newUsername.includes('@')) {
			toastWarning($t('studies.invalidEmail'));
			return;
		}

		const userData = await getUserByEmailAPI(fetch, newUsername);

		if (!userData) {
			toastWarning($t('studies.userNotFound'));
			return;
		}

		const user = User.parse(userData);

		if (!user) {
			toastAlert($t('studies.userNotFound'));
			return;
		}

		const res = await selectedStudy.addUser(user);

		if (!res) {
			toastAlert($t('studies.addUserError'));
			return;
		}

		newUsername = '';
		newUserModal = false;
		toastSuccess($t('studies.addUserSuccess'));
		selectStudy(null);
	}
</script>

<h1 class="text-xl font-bold m-5 text-center">{$t('header.admin.studies')}</h1>

<table class="table max-w-5xl mx-auto text-center">
	<thead>
		<tr>
			<th>#</th>
			<th>{$t('utils.words.date')}</th>
			<th>{$t('utils.words.title')}</th>
			<th># {$t('utils.words.users')}</th>
		</tr>
	</thead>
	<tbody>
		{#each studies as study (study.id)}
			<tr
				class="hover:bg-gray-100 hover:cursor-pointer"
				onclick={() => (window.location.href = `/admin/studies/${study.id}`)}
			>
				<td>{study.id}</td>
				<td>{displayDate(study.startDate)} - {displayDate(study.endDate)}</td>
				<td>{study.title}</td>
				<td>{study.numberOfUsers}</td>
				<td></td>
			</tr>
		{/each}
	</tbody>
</table>
<div class="mt-8 w-[64rem] mx-auto">
	<a class="button" href="/admin/studies/new">{$t('studies.create')}</a>
</div>

<dialog class="modal bg-black bg-opacity-50" open={selectedStudy != null}>
	<div class="modal-box max-w-4xl">
		<h2 class="text-xl font-bold m-5 text-center">{$t('studies.study')} #{selectedStudy?.id}</h2>
		<form class="mb-4">
			<label class="label" for="title">{$t('utils.words.title')}</label>
			<input class="input w-full" type="text" id="title" bind:value={title} />
			<label class="label" for="description">{$t('utils.words.description')}</label>
			<textarea use:autosize class="input w-full max-h-52" id="title" bind:value={description}>
			</textarea>
			<label class="label" for="startDate">{$t('studies.startDate')}</label>
			<DateInput class="input w-full" id="startDate" date={startDate} />
			<label class="label" for="endDate">{$t('studies.endDate')}</label>
			<DateInput class="input w-full" id="endDate" date={endDate} />
			<label class="label" for="chatDuration">{$t('studies.chatDuration')}</label>
			<input
				class="input w-full"
				type="number"
				id="chatDuration"
				bind:value={chatDuration}
				min="0"
			/>
			<div class="flex items-center mt-2">
				<label class="label flex-grow" for="typingTest">{$t('studies.typingTest')} *</label>
				<input
					type="checkbox"
					class="checkbox checkbox-primary size-8"
					id="typingTest"
					bind:checked={typingTest}
				/>
			</div>
			<label class="label" for="users">{$t('utils.words.users')}</label>
			<table class="table">
				<thead>
					<tr>
						<td>#</td>
						<td>{$t('users.category')}</td>
						<td>{$t('users.nickname')}</td>
						<td>{$t('users.email')}</td>
						<td></td>
					</tr>
				</thead>
				<tbody>
					{#each selectedStudy?.users ?? [] as user (user.id)}
						<tr>
							<td>{user.id}</td>
							<td>{$t('users.type.' + user.type)}</td>
							<td>{user.nickname}</td>
							<td>{user.email}</td>
							<td>
								<button class="btn btn-sm btn-error text-white" onclick={() => removeUser(user)}>
									{$t('button.remove')}
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
			<button class="btn btn-primary block mx-auto" onclick={addUser}>
				{$t('studies.addUserButton')}
			</button>
		</form>
		<div class="mt-4">
			<button class="button" onclick={studyUpdate}>{$t('button.update')}</button>
			<button class="btn btn-outline float-end ml-2" onclick={() => selectStudy(null)}>
				{$t('button.cancel')}
			</button>
			<button
				class="btn btn-error btn-outline float-end"
				onclick={() => confirm($t('studies.deleteConfirm')) && deleteStudy()}
			>
				{$t('button.delete')}
			</button>
		</div>
	</div>
</dialog>

<dialog class="modal bg-black bg-opacity-50" open={newUserModal}>
	<div class="modal-box">
		<h2 class="text-xl font-bold mb-4">{$t('studies.newUser')}</h2>
		<div class="w-full flex">
			<input
				type="text"
				placeholder={$t('utils.words.email')}
				bind:value={newUsername}
				class="input flex-grow mr-2"
				onkeypress={(e) => e.key === 'Enter' && searchUser()}
			/>
			<button class="button w-16" onclick={searchUser}>
				<Icon src={MagnifyingGlass} />
			</button>
		</div>
		<button class="btn float-end mt-4" onclick={() => (newUserModal = false)}>Close</button>
	</div>
</dialog>
