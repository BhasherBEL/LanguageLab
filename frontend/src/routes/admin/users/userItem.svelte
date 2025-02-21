<script lang="ts">
	import { t } from '$lib/services/i18n';
	import type User from '$lib/types/user';
	import { toastAlert, toastSuccess } from '$lib/utils/toasts';
	import { Icon, PencilSquare, Trash, CheckCircle, XCircle } from 'svelte-hero-icons';

	export let user: User;

	let nickname = user.nickname;
	let email = user.email;
	let type = user.type.toString();
	let is_active = user.is_active;

	let inEdit = false;
	let isChanged = false;

	function startEditing() {
		inEdit = true;
		isChanged = false;
	}

	function cancelEdit() {
		nickname = user.nickname;
		email = user.email;
		type = user.type.toString();
		is_active = user.is_active;

		inEdit = false;
		isChanged = false;
	}

	async function validateChanges() {
		if (!isChanged) {
			toastAlert('No changes detected.');
			inEdit = false;
			return;
		}

		const res = await user.patch({
			nickname,
			email,
			type: parseInt(type),
			is_active
		});

		if (res) {
			toastSuccess('User successfully updated');
			inEdit = false;
			isChanged = false;
			return;
		}

		toastAlert('Failed to update user');
	}
</script>

<tr>
	<td>{user.id}</td>
	<td>
		{#if inEdit}
			<input type="text" class="input" bind:value={nickname} on:input={() => (isChanged = true)} />
		{:else}
			{user.nickname}
		{/if}
	</td>
	<td>
		{#if inEdit}
			<input type="email" class="input" bind:value={email} on:input={() => (isChanged = true)} />
		{:else}
			{user.email}
		{/if}
	</td>
	<td>
		{#if inEdit}
			<select
				class="select select-sm select-bordered"
				bind:value={type}
				on:change={() => (isChanged = true)}
			>
				<option value="2">{$t('users.type.student')}</option>
				<option value="1">{$t('users.type.tutor')}</option>
				<option value="0">{$t('users.type.admin')}</option>
			</select>
		{:else if user.type === 0}
			{$t('users.type.admin')}
		{:else if user.type === 1}
			{$t('users.type.tutor')}
		{:else}
			{$t('users.type.student')}
		{/if}
	</td>
	<td>
		{#if inEdit}
			<input
				type="checkbox"
				class="checkbox"
				bind:checked={is_active}
				on:change={() => (isChanged = true)}
			/>
		{:else if user.is_active}
			<span>{$t('utils.bool.true')}</span>
		{:else}
			<span>{$t('utils.bool.false')}</span>
		{/if}
	</td>
	<td class="py-3 px-6 flex justify-center space-x-4 items-center">
		{#if inEdit}
			<button
				on:click={validateChanges}
				class="btn btn-icon bg-green-500 text-white hover:bg-green-600 rounded-full p-2 transition-all"
				aria-label="Validate"
			>
				<Icon src={CheckCircle} class="w-5 h-5" />
			</button>

			<button
				on:click={cancelEdit}
				class="btn btn-icon bg-red-500 text-white hover:bg-red-600 rounded-full p-2 transition-all"
				aria-label="Cancel"
			>
				<Icon src={XCircle} class="w-5 h-5" />
			</button>
		{:else}
			<button
				on:click={startEditing}
				class="btn btn-icon bg-gray-200 text-gray-600 hover:bg-gray-300 rounded-full p-2 transition-all"
				aria-label="Edit"
			>
				<Icon src={PencilSquare} class="w-5 h-5" />
			</button>
		{/if}

		<button
			class="btn btn-icon bg-gray-200 text-gray-400 hover:bg-gray-300 hover:text-red-500 rounded-full p-2 transition-all"
			aria-label="Delete"
		>
			<Icon src={Trash} class="w-5 h-5" />
		</button>
	</td>
</tr>
