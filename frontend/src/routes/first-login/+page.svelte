<script lang="ts">
	import { getBaseURL, requireLogin } from '$lib/utils/login';
	import { onMount } from 'svelte';
	import { _ } from '$lib/services/i18n';
	import Header from '$lib/components/header.svelte';
	import config from '$lib/config';
	import { _activeLocale } from '$lib/services/i18n';
	import { createUserMetadataAPI } from '$lib/api/users';
	import JWTSession from '$lib/stores/JWTSession';
	import { toastAlert } from '$lib/utils/toasts';
	import { Language } from 'svelte-hero-icons';

	let uiLanguage: string = $_activeLocale;
	let homeLanguage: string;
	let targetLanguage: string;
	let birthdate: string;
	$: isSent = false;

	onMount(() => {
		if (!requireLogin()) return;
	});

	async function send(event: Event) {
		event.preventDefault();

		const user_id = JWTSession.user()?.id;

		if (!user_id) {
			toastAlert('Failed to get current user ID');
			return;
		}

		isSent = true;

		const res = await createUserMetadataAPI(
			user_id,
			uiLanguage,
			homeLanguage,
			targetLanguage,
			birthdate
		);

		if (res) {
			setTimeout(() => {
				window.location.href = getBaseURL();
			}, 3000);
		} else {
			isSent = false;
		}
	}
</script>

<Header />

<div class=" w-3/4 max-w-3xl flex flex-col justify-center m-auto mt-8">
	<form class="my-4" on:submit={send}>
		<div class="text-center">
			{$_('firstLogin.welcome')}
		</div>
		<div class="mt-4">
			<label for="homeLanguage">{$_('firstLogin.homeLanguage')}</label>
			<select
				class="input mt-2 w-full bg-transparent"
				id="homeLanguage"
				name="homeLanguage"
				required
				bind:value={homeLanguage}
			>
				{#each Object.entries(config.PRIMARY_LANGUAGE) as [code, name]}
					<option value={code}>{name}</option>
				{/each}
			</select>
		</div>
		<div class="mt-4">
			<label for="targetLanguage">{$_('firstLogin.targetLanguage')}</label>
			<select
				class="input mt-2 w-full bg-transparent"
				id="targetLanguage"
				name="targetLanguage"
				required
				bind:value={targetLanguage}
			>
				{#each config.LEARNING_LANGUAGES as language}
					<option value={language}>{language}</option>
				{/each}
			</select>
		</div>
		<div class="mt-4">
			<label for="birthdate">{$_('firstLogin.birthdate')}</label>
			<input
				class="input mt-2 w-full"
				type="date"
				id="birthdate"
				name="birthdate"
				required
				bind:value={birthdate}
			/>
		</div>
		<div class="text-center font-bold mt-8">
			{$_('firstLogin.informedConsent')}
		</div>
		<div class="my-4 flex justify-center">
			<input class="input mt-2 mr-4" type="checkbox" id="consent" name="consent" required />
			<label for="consent">{$_('firstLogin.consent')}</label>
		</div>
		<input
			type="submit"
			class="button block m-auto"
			disabled={isSent}
			value={$_(isSent ? 'button.thankyou' : 'button.submit')}
		/>
	</form>
</div>

<style>
	input:invalid {
		border-color: red;
		outline-color: red;
	}
</style>
