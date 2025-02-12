<script lang="ts">
	import Survey from '$lib/types/survey';
	import SurveyTypingSvelte from '$lib/types/surveyTyping.svelte';
	import type { PageData, ActionData } from './$types';
	import Draggable from './Draggable.svelte';
	import autosize from 'svelte-autosize';
	import { t } from '$lib/services/i18n';
	import DateInput from '$lib/components/utils/dateInput.svelte';
	import { toastAlert, toastWarning } from '$lib/utils/toasts';
	import { getUserByEmailAPI } from '$lib/api/users';
	import User from '$lib/types/user';
	import { Icon, MagnifyingGlass } from 'svelte-hero-icons';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let tests: (SurveyTypingSvelte | Survey)[] = $state([]);

	let typing = $state(new SurveyTypingSvelte());

	let possibleTests = [typing, ...data.surveys];
	let selectedTest: SurveyTypingSvelte | Survey | undefined = $state();

	let hasToLoggin: boolean = $state(false);

	let newUsername: string = $state('');
	let newUserModal = $state(false);
	let users: User[] = $state([]);

	async function addUser() {
		newUserModal = true;
	}

	async function searchUser() {
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
		users = [...users, user];
		newUsername = '';
		newUserModal = false;
	}

	async function removeUser(user: User) {
		users = users.filter((u) => u.id !== user.id);
	}
</script>

<div class="mx-auto w-full max-w-5xl px-4">
	<h2 class="text-xl font-bold m-5 text-center">{$t('studies.createTitle')}</h2>
	{#if form?.message}
		<div class="alert alert-error mb-4">
			{form.message}
		</div>
	{/if}
	<form method="post">
		<label class="label" for="title">{$t('utils.words.title')} *</label>
		<input class="input w-full" type="text" id="title" name="title" required />
		<label class="label" for="description">{$t('utils.words.description')}</label>
		<textarea use:autosize class="input w-full max-h-52" id="description" name="description"
		></textarea>
		<label class="label" for="startDate">{$t('studies.startDate')} *</label>
		<DateInput class="input w-full" id="startDate" name="startDate" date={new Date()} required />
		<label class="label" for="endDate">{$t('studies.endDate')} *</label>
		<DateInput class="input w-full" id="endDate" name="endDate" date={new Date()} required />
		<label class="label" for="chatDuration">{$t('studies.chatDuration')} *</label>
		<input
			class="input w-full"
			type="number"
			id="chatDuration"
			name="chatDuration"
			min="0"
			value="30"
			required
		/>

		<h3 class="py-2 px-1">{$t('Tests')}</h3>
		<Draggable bind:items={tests} name="tests" />
		<div class="flex">
			<select class="select select-bordered flex-grow" bind:value={selectedTest}>
				{#each possibleTests as test}
					{#if test instanceof Survey}
						<option value={test}>{test.title}</option>
					{:else}
						<option value={test}>{test.name}</option>
					{/if}
				{/each}
			</select>
			<button
				class="ml-2 button"
				onclick={(e) => {
					e.preventDefault();
					if (selectedTest === undefined) return;
					tests = [...tests, selectedTest];
				}}
			>
				+
			</button>
		</div>

		<div class="flex items-center mt-2">
			<label class="label flex-grow" for="typingTest">{$t('studies.hasToLoggin')}*</label>
			<input
				type="checkbox"
				class="checkbox checkbox-primary size-8"
				id="typingTest"
				bind:checked={hasToLoggin}
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
				{#each users ?? [] as user (user.id)}
					<tr>
						<td>{user.id}</td>
						<td>{$t('users.type.' + user.type)}</td>
						<td>{user.nickname}</td>
						<td>{user.email}</td>
						<td>
							<button
								type="button"
								class="btn btn-sm btn-error text-white"
								onclick={() => removeUser(user)}
							>
								{$t('button.remove')}
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
		<button type="button" class="btn btn-primary block mx-auto mt-3" onclick={addUser}>
			{$t('studies.addUserButton')}
		</button>

		<h3 class="py-2 px-1">{$t('register.consent.title')}</h3>
		<label class="label text-sm" for="consentParticipation"
			>{$t('register.consent.participation')}</label
		>
		<textarea
			use:autosize
			class="input w-full max-h-52"
			id="consentParticipation"
			name="consentParticipation"
		></textarea>
		<label class="label text-sm" for="consentPrivacy">{$t('register.consent.privacy')}</label>
		<textarea use:autosize class="input w-full max-h-52" id="consentPrivacy" name="consentPrivacy"
		></textarea>
		<label class="label text-sm" for="consentRights">{$t('register.consent.rights')}</label>
		<textarea use:autosize class="input w-full max-h-52" id="consentRights" name="consentRights"
		></textarea>
		<label class="label text-sm" for="consentStudyData"
			>{$t('register.consent.studyData.title')}</label
		>
		<textarea
			use:autosize
			class="input w-full max-h-52"
			id="consentStudyData"
			name="consentStudyData"
		></textarea>

		<div class="mt-4 mb-6">
			<button class="button">{$t('button.create')}</button>
			<a class="btn btn-outline float-end ml-2" href="/admin/studies">
				{$t('button.cancel')}
			</a>
		</div>
	</form>
</div>
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
