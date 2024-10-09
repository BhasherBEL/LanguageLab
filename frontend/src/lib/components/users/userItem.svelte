<script lang="ts">
	import { t } from '$lib/services/i18n';
	import type User from '$lib/types/user';
	import { toastAlert, toastSuccess } from '$lib/utils/toasts';
	import { Icon, PencilSquare, Trash } from 'svelte-hero-icons';

	export let user: User;

	let nickname = user.nickname;
	let email = user.email;
	let type = user.type.toString();
	let is_active = user.is_active;

	let inEdit = false;

	async function onEdit() {
		if (!inEdit) {
			nickname = user.nickname;
			email = user.email;
			type = user.type.toString();
			is_active = user.is_active;
			inEdit = true;
			return;
		}

		if (
			nickname === user.nickname &&
			email === user.email &&
			type === user.type.toString() &&
			is_active === user.is_active
		) {
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
			inEdit = false;
			toastSuccess('Successfully updated user');
			return;
		}

		toastAlert('Failed to update user');
	}
</script>

<tr>
	<td>{user.id}</td>
	<td>
		{#if inEdit}
			<input type="text" class="input" bind:value={nickname} />
		{:else}
			{user.nickname}
		{/if}
	</td>
	<td>
		{#if inEdit}
			<input type="email" class="input" bind:value={email} />
		{:else}
			{user.email}
		{/if}
	</td>
	<td>
		{#if inEdit}
			<select class="select select-sm select-bordered" bind:value={type}>
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
			<input type="checkbox" class="checkbox" bind:checked={is_active} />
		{:else if user.is_active}
			<span>{$t('utils.bool.true')}</span>
		{:else}
			<span>{$t('utils.bool.false')}</span>
		{/if}
	</td>
	<td class="py-3 px-6 flex justify-center">
		<button on:click={onEdit}>
			<Icon src={PencilSquare} class="w-5" />
		</button>
		<Icon
			src={Trash}
			class="w-5 hover:cursor-not-allowed stroke-gray-400 hover:text-secondaryHover"
		/>
	</td></tr
>
