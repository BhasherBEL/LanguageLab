<script lang="ts">
	import config from '$lib/config';
	import { t } from '$lib/services/i18n';
	import { Icon, Envelope, Key, UserCircle } from 'svelte-hero-icons';
	import Typingtest from '$lib/components/tests/typingtest.svelte';
	import type { PageData } from './$types';
	import Consent from '$lib/components/surveys/consent.svelte';
	import type Study from '$lib/types/study';
	import { displayDate } from '$lib/utils/date';

	let { data, form }: { data: PageData; form: FormData } = $props();
	let study: Study | undefined = $state(data.study);
	let studies: Study[] | undefined = $state(data.studies);
	let user = $state(data.user);
	let message = $state('');

	let selectedStudy: Study | undefined = $state();

	let current_step = $state(
		(() => {
			if (user == null) {
				if (form?.message) return 3;
				if (study) return 2;
				return 1;
			} else if (!user.home_language || !user.target_language || !user.birthdate || !user.gender) {
				return 4;
			} else {
				return 6;
			}
		})()
	);
</script>

<div class="header mx-auto my-5">
	<ul class="steps text-xs">
		<li class="step" class:step-primary={current_step >= 1}>
			<a href="/register" data-sveltekit-reload class:btn-disabled={current_step > 3}
				>{$t('register.tab.study')}</a
			>
		</li>
		<li class="step" class:step-primary={current_step >= 2}>
			{#if current_step >= 2 && current_step <= 3}
				<button onclick={() => (current_step = 2)}>
					{$t('register.tab.consent')}
				</button>
			{:else}
				{$t('register.tab.consent')}
			{/if}
		</li>
		<li class="step" class:step-primary={current_step >= 3}>
			{$t('register.tab.signup')}
		</li>
		<li class="step" class:step-primary={current_step >= 4}>
			{$t('register.tab.information')}
		</li>
		<li class="step" class:step-primary={current_step >= 5}>
			{$t('register.tab.timeslots')}
		</li>
		<li class="step" class:step-primary={current_step >= 6} data-content="?">
			{$t('register.tab.continue')}
		</li>
		<li class="step" class:step-primary={current_step >= 7} data-content="">
			{$t('register.tab.test')}
		</li>
		<li class="step" class:step-primary={current_step >= 8} data-content="★">
			{$t('register.tab.start')}
		</li>
	</ul>
</div>

<div class="max-w-screen-md mx-auto p-5">
	{#if form?.message}
		<div class="alert alert-error text-content text-base-100 py-2 mb-4">
			{form.message}
		</div>
	{:else if message}
		<div class="alert alert-error text-content text-base-100 py-2 mb-4">
			{message}
		</div>
	{/if}
	{#if current_step == 1}
		<div class="form-control">
			<label for="study" class="label">
				<span class="label-text">{$t('register.study')}</span>
				<span class="label-text-alt">{$t('register.study.note')}</span>
			</label>
			<select
				class="select select-bordered"
				id="study"
				name="study"
				required
				disabled={!!study}
				bind:value={selectedStudy}
			>
				{#if study}
					<option selected value={study}>
						{study.title} ({displayDate(study.startDate)} - {displayDate(study.endDate)})
					</option>
				{:else if studies}
					<option disabled selected value="">{$t('register.study.placeholder')}</option>
					{#each studies as s}
						<option value={s}>
							{s.title} ({displayDate(s.startDate)} - {displayDate(s.endDate)})
						</option>
					{/each}
				{:else}
					<option disabled></option>
				{/if}
			</select>
		</div>
		<div class="form-control">
			<a
				class="button mt-8"
				class:btn-disabled={!selectedStudy}
				href="/register/{selectedStudy?.id}"
				data-sveltekit-reload
			>
				{$t('button.continue')}
			</a>
		</div>
	{:else if current_step == 2}
		<Consent
			introText={$t('register.consent.intro')}
			participation={$t('register.consent.participation')}
			participationD={$t('register.consent.participationD')}
			privacy={$t('register.consent.privacy')}
			privacyD={$t('register.consent.privacyD')}
			rights={$t('register.consent.rights')}
		/>
		<div class="form-control">
			<button class="button mt-4" onclick={() => current_step++}>
				{$t('register.consent.ok')}
			</button>
		</div>
	{:else if current_step == 3}
		<div class="space-y-2">
			<form method="POST" action="?/register">
				<label for="email" class="form-control">
					<div class="label">
						<span class="label-text">{$t('register.email')}</span>
						<span class="label-text-alt">{$t('register.email.note')}</span>
					</div>
					<div class="input flex items-center">
						<Icon src={Envelope} class="w-4 mr-2 opacity-70" solid />
						<input
							type="email"
							name="email"
							class="grow"
							placeholder={$t('register.email.ph')}
							required
						/>
					</div>
				</label>
				<label for="nickname" class="form-control">
					<div class="label">
						<span class="label-text">{$t('register.nickname')}</span>
						<span class="label-text-alt">{$t('register.nickname.note')}</span>
					</div>
					<div class="input flex items-center">
						<Icon src={UserCircle} class="w-4 mr-2 opacity-70" solid />
						<input
							type="text"
							name="nickname"
							class="grow"
							placeholder={$t('register.nickname.ph')}
							required
						/>
					</div>
				</label>
				<label for="password" class="form-control">
					<div class="label">
						<span class="label-text">{$t('register.password')}</span>
						<span class="label-text-alt">{$t('register.password.note')}</span>
					</div>
					<div class="input flex items-center">
						<Icon src={Key} class="w-4 mr-2 opacity-70" solid />
						<input
							type="password"
							name="password"
							class="grow"
							placeholder={$t('register.password')}
							required
						/>
					</div>
				</label>
				<label for="confirmPassword" class="form-control">
					<div class="input flex items-center">
						<Icon src={Key} class="w-4 mr-2 opacity-70" solid />
						<input
							type="password"
							name="confirmPassword"
							class="grow"
							placeholder={$t('register.confirmPassword')}
							required
						/>
					</div>
				</label>
				<div class="form-control">
					<button class="button mt-2">{$t('register.signup')}</button>
				</div>
			</form>
		</div>
	{:else if current_step == 4}
		<form class="space-y-2" method="POST" action="?/data">
			<div class="p-5 text-sm text-prose">
				{@html $t('register.welcome')}
			</div>
			<div class="form-control">
				<label for="homeLanguage" class="label">
					<span class="label-text">{$t('register.homeLanguage')}</span>
					<span class="label-text-alt">{$t('register.homeLanguage.note')}</span>
				</label>
				<select class="select select-bordered" id="homeLanguage" name="homeLanguage" required>
					<option disabled selected value="">{$t('register.homeLanguage')}</option>
					{#each Object.entries(config.PRIMARY_LANGUAGE) as [code, name]}
						<option value={code}>{name}</option>
					{/each}
				</select>
			</div>
			<div class="form-control">
				<label for="targetLanguage" class="label">
					<span class="label-text">{$t('register.targetLanguage')}</span>
					<span class="label-text-alt">{$t('register.targetLanguage.note')}</span>
				</label>
				<select class="select select-bordered" id="targetLanguage" name="targetLanguage" required>
					{#each Object.entries(config.LEARNING_LANGUAGES) as [code, name]}
						<option value={code}>{name}</option>
					{/each}
				</select>
			</div>
			<div class="form-control">
				<label for="birthyear" class="label">
					<span class="label-text">{$t('register.birthyear')}</span>
					<span class="label-text-alt">{$t('register.birthyear.note')}</span>
				</label>
				<select class="select select-bordered" id="birthyear" name="birthyear" required>
					<option disabled selected value="">{$t('register.birthyear')}</option>
					{#each Array.from({ length: 90 }, (_, i) => i + 1931).reverse() as year}
						<option value={year}>{year}</option>
					{/each}
				</select>
			</div>
			<div class="form-control space-y-1">
				<label for="gender" class="label">
					<span class="label-text">{$t('register.gender')}</span>
					<span class="label-text-alt">{$t('register.gender.note')}</span>
				</label>
				<div class="label justify-normal gap-2 py-0">
					<input type="radio" class="radio" id="male" name="gender" value="male" required />
					<label for="male" class="label-text cursor-pointer">
						{$t('register.genders.male')}
					</label>
				</div>
				<div class="label justify-normal gap-2 py-0">
					<input type="radio" class="radio" id="female" name="gender" value="female" required />
					<label for="female" class="label-text cursor-pointer">
						{$t('register.genders.female')}
					</label>
				</div>
				<div class="label justify-normal gap-2 py-0">
					<input type="radio" class="radio" id="other" name="gender" value="other" required />
					<label for="other" class="label-text cursor-pointer">
						{$t('register.genders.other')}
					</label>
				</div>
				<div class="label justify-normal gap-2 py-0">
					<input type="radio" class="radio" id="na" name="gender" value="na" required />
					<label for="na" class="label-text cursor-pointer">
						{$t('register.genders.na')}
					</label>
				</div>
			</div>
			<input type="hidden" id="study" name="study" value={study?.id} />
			<div class="form-control">
				<button class="button mt-4">{$t('button.submit')}</button>
			</div>
		</form>
	{:else if current_step == 5}
		<h2 class="my-4 text-xl">This page is disabled. Please continue.</h2>
		<button onclick={() => current_step++}>{$t('button.continue')}</button>
	{:else if current_step == 6}
		<div class="text-center">
			<p class="text-center">
				{@html $t('register.continue')}
			</p>
			<button class="button mt-4 w-full" onclick={() => (current_step = 6)}>
				{$t('register.continueButton')}
			</button>
			<button class="button mt-4 w-full" onclick={() => (document.location.href = '/')}>
				{$t('register.startFastButton')}
			</button>
		</div>
	{:else if current_step == 7}
		{#if user}
			<Typingtest onFinish={() => current_step++} {user} />
		{/if}
	{:else if current_step == 8}
		<div class="text-center">
			<p class="text-center">
				{@html $t('register.start')}
			</p>
			<button class="button mt-4 m-auto" onclick={() => (document.location.href = '/')}>
				{$t('register.startButton')}
			</button>
		</div>
	{/if}
</div>

<style lang="postcss">
	.label-text-alt {
		@apply opacity-50 ml-8;
	}

	.steps {
		@apply text-base-300;
	}
</style>
