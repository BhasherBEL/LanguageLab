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

<div class="flex justify-center items-center h-screen"> 
	<div class="flex flex-col w-full max-w-md rounded-box shadow-xl bg-base-200 gap-4 p-6">
		<h1 class="text-3xl font-bold self-center">{$t('login.title')}</h1>

		<p class="self-center text-sm">
			{$t('login.noAccountText')}
			<a data-sveltekit-reload href="/register" class="link link-secondary">
				{$t('login.noAccountLink')}
			</a>
		</p>

		<!-- <a class="btn btn-neutral">
				<i class="fa-brands fa-google text-primary"></i>
				Log in with Google
		</a>
		
		<div class="divider">OR</div>  -->

		<form action="#">
			{#if message}
				<div class="alert alert-error">
					{message}
				</div>
			{/if}

			<label class="form-control">
				<div class="label">
					<span class="label-text">{$t('login.email')}</span>
				</div>

				<input type="text" id="email" name="email" class="input input-bordered" bind:value={email} required />
			</label>

			<label class="form-control">
				<div class="label">
					<span class="label-text">{$t('login.password')}</span>
					<!-- TODO: forgot password
					<a class="label-text link link-secondary">{$t('login.forgotPassword')}</a> -->
				</div>

				<input type="password" id="password" name="password" class="input input-bordered" bind:value={password} required />
			</label>

			<!-- <div class="form-control">
				<label class="cursor-pointer label self-start gap-2">
					TODO: remember me
					<input type="checkbox" class="checkbox" />
					<span class="label-text">{$t('login.rememberMe')}</span> 
				</label>
			</div> -->

			<div class="form-control mt-4">
				<button type="submit" on:click|preventDefault={login} class="btn btn-primary">
					{$t('login.login')}
				</button>
			</div>
		</form>
	</div>
</div>

<style lang="postcss">
	/* label {
		@apply font-bold pr-4 w-1/3 flex items-center justify-end;
	}

	input {
		@apply input bg-base-200 w-[400px] py-2 px-4;
	} */
</style>
