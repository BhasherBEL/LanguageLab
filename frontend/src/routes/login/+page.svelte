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

<div class="flex flex-col items-center justify-center h-screen">
	<div class="card shadow-xl">
		<h2 class="card-title p-6 pb-0">{$t('login.title')}</h2>
		<form action="#" class="flex items-center flex-col p-6">
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
			<button type="submit" on:click|preventDefault={login} class="btn btn-primary">
				{$t('login.login')}
			</button>
			<p class="mt-4 text-sm">
				{$t('login.noAccountText')}
				<a data-sveltekit-reload href="/register" class="link">
					{$t('login.noAccountLink')}
				</a>
			</p>
		</form>
	</div>
</div>

<style lang="postcss">
	label {
		@apply font-bold pr-4 w-1/3 flex items-center justify-end;
	}

	input {
		@apply input bg-base-200 w-[400px] py-2 px-4;
	}
</style>
