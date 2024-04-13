<script lang="ts">
	import { getBaseURL } from '$lib/utils/login';
	import { locale, t } from '$lib/services/i18n';
	import config from '$lib/config';
	import { createUserMetadataAPI } from '$lib/api/users';
	import { toastAlert } from '$lib/utils/toasts';
	import { user } from '$lib/types/user';

	let uiLanguage: string = $locale;
	let homeLanguage: string;
	let targetLanguage: string;
	let birthdate: string;
	$: isSent = false;

	async function send(event: Event) {
		event.preventDefault();

		const user_id = $user?.id;

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

<div class=" w-3/4 max-w-3xl flex flex-col justify-center m-auto mt-8">
	<form class="my-4" on:submit={send}>
		<div class="text-center">
			{$t('firstLogin.welcome')}
		</div>
		<div class="mt-4">
			<label for="homeLanguage">{$t('firstLogin.homeLanguage')}</label>
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
			<label for="targetLanguage">{$t('firstLogin.targetLanguage')}</label>
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
			<label for="birthdate">{$t('firstLogin.birthdate')}</label>
			<input
				class="input mt-2 w-full"
				type="date"
				id="birthdate"
				name="birthdate"
				required
				bind:value={birthdate}
			/>
		</div>
		<div class="text-center mt-8">
			{@html $t('firstLogin.informedConsent')}
		</div>
		<div class="my-4 flex justify-center">
			<input
				class="input mt-2 mr-4 checkbox checkbox-lg"
				type="checkbox"
				id="consent"
				name="consent"
				required
			/>
			<label for="consent">{$t('firstLogin.consent')}</label>
		</div>
		<input
			type="submit"
			class="button block m-auto"
			disabled={isSent}
			value={$t(isSent ? 'button.thankyou' : 'button.submit')}
		/>
	</form>
</div>

<style>
	input:invalid {
		border-color: red;
		outline-color: red;
	}
</style>
