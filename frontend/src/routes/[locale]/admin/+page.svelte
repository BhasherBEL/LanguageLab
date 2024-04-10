<script lang="ts">
	import { requireAdmin, requireLogin } from '$lib/utils/login';
	import { onMount } from 'svelte';
	import Header from '$lib/components/header.svelte';
	import User, { users } from '$lib/types/user';
	import { getUsersAPI } from '$lib/api/users';
	import { _ } from '$lib/services/i18n';
	import { Icon, Trash } from 'svelte-hero-icons';

	let ready = false;

	onMount(async () => {
		if (!requireAdmin()) return;

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
		const password = prompt($_('admin.passwordPrompt'));
		if (!password) return;

		const user = await User.create(nickname.trim(), email.trim(), password, type_id, is_active);
		if (!user) return;

		nickname = '';
		email = '';
		type = '2';
		is_active = true;
	}
</script>

<Header />

{#if ready}
	<div class="min-w-fit max-w-3xl m-auto p-0 mt-8">
		<h1 class="text-2xl font-bold mb-8 text-center">Users</h1>
		<table class="w-full shadow-md">
			<thead class="bg-gray-200 uppercase text-sm">
				<tr>
					<th class="py-2 px-6">#</th>
					<th class="py-2 px-6">{$_('users.nickname')}</th>
					<th class="py-2 px-6">{$_('users.email')}</th>
					<th class="py-2 px-6">{$_('users.category')}</th>
					<th class="py-2 px-6">{$_('users.isActive')}</th>
					<th class="py-2 px-6">{$_('admin.actions')}</th>
				</tr>
			</thead>
			<tbody>
				{#each $users as user (user.id)}
					<tr class="odd:bg-white even:bg-gray-100 text-center">
						<td class="py-3 px-6">{user.id}</td>
						<td class="py-3 px-6">{user.nickname}</td>
						<td class="py-3 px-6">{user.email}</td>
						<td class="py-3 px-6">
							{#if user.type === 0}
								{$_('users.type.admin')}
							{:else if user.type === 1}
								{$_('users.type.tutor')}
							{:else}
								{$_('users.type.student')}
							{/if}
						</td>
						<td class="py-3 px-6">{$_('utils.bool.' + user.is_active)}</td>
						<td class="py-3 px-6 flex justify-center">
							<Icon
								src={Trash}
								class="w-5 hover:cursor-not-allowed stroke-gray-400 hover:text-secondaryHover"
							/>
						</td></tr
					>
				{/each}
				<tr class="odd:bg-white even:bg-gray-100 text-center">
					<td class="py-3 px-6"></td>
					<td class="py-3 px-6"><input type="text" bind:value={nickname} /></td>
					<td class="py-3 px-6"><input type="text" bind:value={email} /></td>
					<td class="py-3 px-6">
						<select bind:value={type}>
							<option value="2">{$_('users.type.student')}</option>
							<option value="1">{$_('users.type.tutor')}</option>
							<option value="0">{$_('users.type.admin')}</option>
						</select>
					</td>
					<td class="py-3 px-6"><input type="checkbox" bind:value={is_active} checked /></td>
					<td class="flex justify-center py-2 px-4"
						><button class="button" disabled={!canCreate} on:click={createUser}
							>{$_('button.create')}</button
						></td
					>
				</tr>
			</tbody>
		</table>
	</div>
{/if}

<style lang="postcss">
	input,
	select {
		@apply w-full border-2 h-8 text-center border-gray-400 rounded bg-transparent;
	}
</style>
