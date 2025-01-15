<script lang="ts">
	import User from '$lib/types/user';
	import { t } from '$lib/services/i18n';
	import UserItem from '$lib/components/users/userItem.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let users = data.users;

	let nickname = $state('');
	let email = $state('');
	let type = $state('2');
	let is_active = $state(true);

	let canCreate = $derived(nickname !== '' && email !== '' && type !== '');

	async function createUser() {
		if (!canCreate) return;

		const type_id = parseInt(type);
		if (isNaN(type_id)) return;

		// ask for password
		const password = prompt($t('admin.passwordPrompt'));
		if (!password) return;

		const user = await User.create(nickname.trim(), email.trim(), password, type_id, is_active);
		if (!user) return;

		nickname = '';
		email = '';
		type = '2';
		is_active = true;
	}
</script>

<div class="min-w-fit max-w-3xl mx-auto">
	<h1 class="text-xl font-bold m-5 text-center">Users</h1>
	<table class="table">
		<thead>
			<tr>
				<th>#</th>
				<th>{$t('users.nickname')}</th>
				<th>{$t('users.email')}</th>
				<th>{$t('users.category')}</th>
				<th>{$t('users.isActive')}</th>
				<th>{$t('admin.actions')}</th>
			</tr>
		</thead>
		<tbody>
			{#each users as user (user.id)}
				<UserItem {user} />
			{/each}
		</tbody>
		<tfoot class="">
			<tr class="">
				<td>+</td>
				<td><input type="text" class="input input-sm" bind:value={nickname} /></td>
				<td><input type="text" class="input input-sm" bind:value={email} /></td>
				<td>
					<select class="select select-sm select-bordered" bind:value={type}>
						<option value="2">{$t('users.type.student')}</option>
						<option value="1">{$t('users.type.tutor')}</option>
						<option value="0">{$t('users.type.admin')}</option>
					</select>
				</td>
				<td>
					<input type="checkbox" class="checkbox" bind:checked={is_active} />
				</td>
				<td>
					<button class="btn btn-sm" disabled={!canCreate} onclick={createUser}>
						{$t('button.create')}
					</button>
				</td>
			</tr>
		</tfoot>
	</table>
</div>
