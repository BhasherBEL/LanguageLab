<script lang="ts">
	import Header from '$lib/components/header.svelte';
	import JWTSession from '$lib/stores/JWTSession';
	import { onMount } from 'svelte';
	import { _ } from '$lib/services/i18n';
	import LocalSelector from '$lib/components/header/localSelector.svelte';
	import { CheckCircle, ExclamationTriangle, Icon } from 'svelte-hero-icons';
	import { loginAPI, registerAPI } from '$lib/api/auth';
	import { toastAlert } from '$lib/utils/toasts';
	import { getBaseURL } from '$lib/utils/login';

	let checker: HTMLDivElement;

	onMount(() => {
		if (JWTSession.isLoggedIn()) {
			const redirect = new URLSearchParams(window.location.search).get('redirect') ?? getBaseURL();
			window.location.href = redirect;
		}

		checker.innerHTML =
			'<input type="checkbox" id="humanCheck" required><label for="humanCheck">' +
			$_('signup.humans') +
			'</label>';
	});

	let message = '';

	let nickname = '';
	let email = '';
	let password = '';
	let confirmPassword = '';

	const signup = async () => {
		if (nickname == '' || email == '') {
			message = $_('signup.emptyFields');
			return;
		}
		if (password.length < 8) {
			message = $_('signup.passwordRules');
			return;
		}
		if (password != confirmPassword) {
			message = $_('signup.differentPasswords');
			return;
		}
		if (!checker.querySelector('input')?.checked) {
			message = $_('signup.humanity');
			return;
		}

		const result = await registerAPI(email, password, nickname);

		if (result !== 'OK') {
			message = result;
			return;
		}
		message = '';

		const loginRes = await loginAPI(email, password);

		if (loginRes !== 'OK') {
			toastAlert('Failed to login: ' + loginRes);
			document.location.href = '/login';
			return;
		}

		document.location.href = '/first-login';
	};
</script>

<Header />

<div class="flex items-center justify-center h-screen">
	<form action="#" class="shadow-md w-1/2 min-w-fit max-w-2xl mb-7 flex items-center flex-col p-5">
		<div class="text-xl mb-4 font-bold">
			{$_('signup.title')}
		</div>
		{#if message}
			<div class="w-full py-1 bg-red-600 text-white text-center font-bold rounded mb-4">
				{message}
			</div>
		{/if}
		<div class="flex w-full mb-4">
			<label for="language">{$_('signup.language')}</label>
			<LocalSelector class="w-full !bg-gray-200 py-2 px-4 rounded" />
		</div>
		<div class="flex w-full mb-4">
			<label for="nickname">{$_('signup.nickname')}</label>
			<input
				class="w-1/2"
				type="text"
				id="nickname"
				name="nickname"
				bind:value={nickname}
				required
			/>
		</div>
		<div class="flex w-full mb-4">
			<label for="email">{$_('signup.email')}</label>
			<input class="w-1/2" type="email" id="email" name="email" bind:value={email} required />
		</div>
		<div class="flex w-full mb-4">
			<label for="password">{$_('signup.password')}</label>
			<div class="w-1/2 flex">
				<div class="flex-grow">
					<input
						class="w-full"
						type="password"
						id="password"
						name="password"
						bind:value={password}
						required
					/>
				</div>
				<div class="w-12 ml-2 flex items-center justify-center">
					{#if password.length < 8}
						<div title={$_('signup.passwordRules')}>
							<Icon src={ExclamationTriangle} class="w-8 text-orange-600" />
						</div>
					{:else}
						<Icon src={CheckCircle} class="w-8 text-green-600" />
					{/if}
				</div>
			</div>
		</div>
		<div class="flex w-full mb-4">
			<label for="password">{$_('signup.password')}</label>
			<div class="w-1/2 -ml-1 flex">
				<div class="flex-grow">
					<input
						class="w-full"
						type="password"
						id="password"
						name="password"
						bind:value={confirmPassword}
						required
					/>
				</div>
				<div class="w-12 ml-2 flex items-center justify-center">
					{#if confirmPassword == '' || password != confirmPassword}
						<div title={$_('signup.differentPasswords')}>
							<Icon src={ExclamationTriangle} class="w-8 text-orange-600" />
						</div>
					{:else}
						<Icon src={CheckCircle} class="w-8 text-green-600" />
					{/if}
				</div>
			</div>
		</div>
		<div bind:this={checker} class="mb-4 space-x-4"></div>
		<button type="submit" on:click|preventDefault={signup} class="button"
			>{$_('signup.signup')}</button
		>
	</form>
</div>

<style lang="postcss">
	label {
		@apply font-bold pr-4 w-1/2 flex items-center justify-end;
	}

	input {
		@apply border-2 bg-gray-200 rounded py-2 px-4;
	}
</style>
