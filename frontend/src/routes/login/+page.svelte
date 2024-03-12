<script lang="ts">
	import { loginAPI } from '$lib/api/auth';
	import Header from '$lib/components/header.svelte';

	let username = '';
	let password = '';
	$: message = '';

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

<form action="#">
	{#if message}
		<div class="errorCard">{message}</div>
	{/if}
	<label for="username">Nom d'utilisateur:</label>
	<input type="text" id="username" name="username" bind:value={username} required />

	<label for="password">Mot de passe:</label>
	<input type="password" id="password" name="password" bind:value={password} required />

	<button type="submit" on:click|preventDefault={login}>Login</button>
</form>

<style lang="less">
	form {
		padding: 20px;
		border-radius: 8px;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
		width: 300px;
		margin: 50px auto 0 auto;
	}

	label {
		display: block;
		margin-bottom: 8px;
	}

	input {
		width: 100%;
		padding: 8px;
		margin-bottom: 16px;
		box-sizing: border-box;
	}

	button {
		background-color: #0060df;
		color: #fff;
		border: none;
		padding: 10px;
		border-radius: 4px;
		cursor: pointer;
	}

	.errorCard {
		background-color: #ff5252;
		color: white;
		padding: 10px;
		border-radius: 5px;
		margin-bottom: 10px;
		text-align: center;
		font-weight: bold;
	}
</style>
