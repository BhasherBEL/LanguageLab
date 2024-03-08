<script lang="ts">
	import { loginAPI } from '$lib/api/auth';

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

<body>
	<form>
		{#if message}
			<p>{message}</p>
		{/if}
		<label for="username">Username:</label>
		<input type="text" id="username" name="username" bind:value={username} required />

		<label for="password">Password:</label>
		<input type="password" id="password" name="password" bind:value={password} required />

		<button type="submit" on:click|preventDefault={login}>Login</button>
	</form>
</body>

<style lang="less">
	body {
		font-family: sans-serif;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100vh;
		margin: 0;
	}

	form {
		padding: 20px;
		border-radius: 8px;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
		width: 300px;
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
		background-color: #007bff;
		color: #fff;
		border: none;
		padding: 10px;
		border-radius: 4px;
		cursor: pointer;
	}
</style>
