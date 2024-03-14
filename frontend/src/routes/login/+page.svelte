<script lang="ts">
	import { loginAPI } from '$lib/api/auth';
	import Header from '$lib/components/header.svelte';
	import session from '$lib/stores/JWTSession';
	import { onMount } from 'svelte';

	let username = '';
	let password = '';
	$: message = '';

	onMount(() => {
		if (session.isLoggedIn()) {
			const redirect = new URLSearchParams(window.location.search).get('redirect') ?? '/';
			window.location.href = redirect;
		}
	});

	async function login() {
		message = '';
		const result = await loginAPI(username, password);
		if (result !== 'OK') {
			message = result;
			return;
		}

		const redirect = new URLSearchParams(window.location.search).get('redirect') ?? '/';
		window.location.href = redirect;
	}
</script>

<Header />

<div class="flex items-center justify-center h-screen">
	<form action="#" class="shadow-md max-w-md mb-7 flex items-center flex-col p-5">
		{#if message}
			<div class="w-full py-1 bg-red-600 text-white text-center font-bold rounded mb-4">
				{message}
			</div>
		{/if}
		<div class="flex w-full mb-4">
			<label for="username">Nom d'utilisateur</label>
			<input type="text" id="username" name="username" bind:value={username} required />
		</div>
		<div class="flex w-full mb-4">
			<label for="password">Mot de passe</label>
			<input type="password" id="password" name="password" bind:value={password} required />
		</div>
		<button type="submit" on:click|preventDefault={login} class="button">Login</button>
	</form>
</div>

<style lang="postcss">
	label {
		@apply font-bold pr-4 w-1/2 flex items-center justify-end;
	}

	input {
		@apply border-2 bg-gray-200 w-1/2 rounded py-2 px-4;
	}
</style>
