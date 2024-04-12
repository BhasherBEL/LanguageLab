<script lang="ts">
	import { loginAPI } from '$lib/api/auth';
	import { getBaseURL } from '$lib/utils/login';
	import { t } from '$lib/services/i18n';

	let email = '';
	let password = '';
	$: message = '';

	async function login() {
		message = '';
		const result = await loginAPI(email, password);
		if (result !== 'OK') {
			message = result;
			return;
		}

		const redirect = decodeURIComponent(
			new URLSearchParams(window.location.search).get('redirect') ?? getBaseURL()
		);

		window.location.href = redirect;
	}
</script>

<div class="flex items-center justify-center h-screen">
	<form action="#" class="shadow-md max-w-md mb-7 flex items-center flex-col p-5">
		{#if message}
			<div class="w-full py-1 bg-red-600 text-white text-center font-bold rounded mb-4">
				{message}
			</div>
		{/if}
		<div class="flex w-full mb-4">
			<label for="email">{$t('login.email')}</label>
			<input type="text" id="email" name="email" bind:value={email} required />
		</div>
		<div class="flex w-full mb-4">
			<label for="password">{$t('login.password')}</label>
			<input type="password" id="password" name="password" bind:value={password} required />
		</div>
		<button type="submit" on:click|preventDefault={login} class="button">
			{$t('login.login')}
		</button>
		<p class="mt-4">
			{$t('login.noAccountText')}
			<a href="/register" class="text-blue-500 underline">
				{$t('login.noAccountLink')}
			</a>
		</p>
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
