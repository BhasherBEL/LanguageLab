<script lang="ts">
	import { onMount } from 'svelte';
	import Header from '$lib/components/header.svelte';
	import User, { users } from '$lib/types/user';
	import { getUsersAPI } from '$lib/api/users';
	import { t } from '$lib/services/i18n';
	import { Icon, Trash } from 'svelte-hero-icons';

	let ready = false;

	onMount(async () => {
		User.parseAll(await getUsersAPI());

		ready = true;
	});

	$: nickname = '';
	$: email = '';
	$: type = '2';
	$: is_active = true;

	$: canCreate = nickname !== '' && email !== '' && type !== '';

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

{#if ready}
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
				{#each $users as user (user.id)}
					<tr>
						<td>{user.id}</td>
						<td>{user.nickname}</td>
						<td>{user.email}</td>
						<td>
							{#if user.type === 0}
								{$t('users.type.admin')}
							{:else if user.type === 1}
								{$t('users.type.tutor')}
							{:else}
								{$t('users.type.student')}
							{/if}
						</td>
						<td>{$t('utils.bool.' + user.is_active)}</td>
						<td class="py-3 px-6 flex justify-center">
							<Icon
								src={Trash}
								class="w-5 hover:cursor-not-allowed stroke-gray-400 hover:text-secondaryHover"
							/>
						</td></tr
					>
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
						<input type="checkbox" class="checkbox" bind:value={is_active} checked />
					</td>
					<td>
						<button class="btn btn-sm" disabled={!canCreate} on:click={createUser}>
							{$t('button.create')}
						</button>
					</td>
				</tr>
			</tfoot>
		</table>
	</div>
{/if}

<style lang="postcss">
	/* input,
	select {
		@apply w-full border-2 h-8 text-center border-gray-400 rounded bg-transparent;
	} */
</style>
