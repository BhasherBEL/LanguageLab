<script lang="ts">
	import { requireLogin } from '$lib/utils/login';
	import { onMount } from 'svelte';
	import { _ } from '$lib/services/i18n';
	import Header from '$lib/components/header.svelte';

	onMount(() => {
		if (!requireLogin()) return;
	});
</script>

<Header />

<div class=" w-3/4 max-w-3xl flex flex-col justify-center m-auto mt-8">
	<div class="text-center">
		{$_('firstLogin.welcome')}
	</div>
	<div class="mt-4">
		<label for="homeLanguage">{$_('firstLogin.homeLanguage')}</label>
		<input class="input mt-2 w-full" type="text" id="homeLanguage" name="homeLanguage" required />
	</div>
	<div class="mt-4">
		<label for="targetLanguage">{$_('firstLogin.targetLanguage')}</label>
		<input
			class="input mt-2 w-full"
			type="text"
			id="targetLanguage"
			name="targetLanguage"
			required
		/>
	</div>
	<div class="mt-4">
		<label for="birthdate">{$_('firstLogin.birthdate')}</label>
		<input class="input mt-2 w-full" type="date" id="birthdate" name="birthdate" required />
	</div>
	<div class="text-center font-bold mt-8">
		{$_('firstLogin.informedConsent')}
	</div>
	<div class="mt-4 flex justify-center">
		<input class="input mt-2 mr-4" type="checkbox" id="consent" name="consent" required />
		<label for="consent">{$_('firstLogin.consent')}</label>
	</div>
</div>
