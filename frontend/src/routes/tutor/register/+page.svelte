<script lang="ts">
	import config from '$lib/config';
	import { locale, t } from '$lib/services/i18n';
	import { toastAlert, toastWarning } from '$lib/utils/toasts';
	import { onMount } from 'svelte';
	import Timeslots from '$lib/components/users/timeslots.svelte';
	import User from '$lib/types/user';
	import {
		getUsersAPI,
		patchUserAPI,
		getUserContactsAPI,
		getUserAPI,
		loginAPI
	} from '$lib/api/users';
	import { Icon, Envelope, Key, UserCircle, Calendar, QuestionMarkCircle } from 'svelte-hero-icons';
	import Typingtest from '$lib/components/tests/typingtest.svelte';
	import { formatToUTCDate } from '$lib/utils/date';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	console.log('Data:', data);
	let user = data.user;

	let current_step = $state(0);

	let message = $state('');

	onMount(async () => {
		if (user == null) {
			current_step = 1;
			return;
		}
		User.parseAll(await getUsersAPI(fetch));
		console.log('User:', user);

		if (!user.home_language || !user.target_language || !user.birthdate || !user.gender) {
			current_step = 3;
			return;
		}

		const contacts = User.parseAll(await getUserContactsAPI(fetch, user.id));

		if (contacts.length == 0) {
			current_step = 4;
			return;
		}

		current_step = 5;
	});

	let nickname = '';
	let email = '';
	let password = '';
	let confirmPassword = '';

	let ui_language: string = $locale;
	let home_language: string;
	let birthdate: string;
	let gender: string;
	let calcom_link = '';

	let timeslots = 0n;

	async function onRegister() {
		if (nickname === '' || email === '' || password === '' || confirmPassword === '') {
			message = $t('register.error.emptyFields');
			return;
		}
		if (password.length < 8) {
			message = $t('register.error.passwordRules');
			return;
		}
		if (password !== confirmPassword) {
			message = $t('register.error.differentPasswords');
			return;
		}
		const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
		if (!emailRegex.test(email)) {
			message = $t('register.error.emailRules');
			return;
		}
		message = '';

		try {
			const response = await fetch('http://127.0.0.1:8000/tmp-api/v1/auth/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json'
				},
				body: JSON.stringify({
					email,
					password,
					nickname,
					is_tutor: true
				})
			});

			if (response.status === 201) {
				const userId = await response.text();
				console.log('User created successfully with ID:', userId);
				console.log('response:', response);
				const result = await loginAPI(fetch, email, password);
				console.log('result:', result);

				user = await getUserAPI(fetch, parseInt(userId));
				if (user) {
					console.log('User details fetched successfully:', user);
					message = $t('register.success');
					current_step++; // Move to the next step
				} else {
					console.error('Failed to fetch user details');
					toastAlert('Failed to fetch user details. Please try again.');
				}
			} else {
				const errorData = await response.json();
				console.error('Registration failed:', errorData);
				message = errorData.detail || $t('register.error.generic');
			}
		} catch (error) {
			console.error('Error during registration:', error);
			message = $t('register.error.generic');
		}
	}

	async function onData() {
		console.log('onData: ', user);
		const user_id = user?.id;

		if (!user_id) {
			toastAlert('Failed to get current user ID');
			return;
		}

		if (!ui_language || !home_language || !birthdate || !gender) {
			message = $t('register.error.emptyFields');
			return;
		}

		const res = await patchUserAPI(fetch, user_id, {
			ui_language,
			home_language,
			birthdate,
			gender
		});

		if (!res) {
			message = $t('register.error.metadata');
			return;
		}

		current_step++;
	}

	async function onAvailabilities() {
		if (!calcom_link || !calcom_link.startsWith('https://cal.com/')) {
			toastWarning($t('timeslots.calcomWarning'));
			return;
		}

		const res = user.setAvailability(timeslots, calcom_link);

		if (!res) return;

		current_step++;
	}

	async function onTyping() {
		current_step++;
	}
</script>

<div class="header mx-auto my-5">
	<ul class="steps text-xs">
		<li class="step" class:step-primary={current_step >= 1}>
			{$t('register.tab.consent')}
		</li>
		<li class="step" class:step-primary={current_step >= 2}>
			{$t('register.tab.signup')}
		</li>
		<li class="step" class:step-primary={current_step >= 3}>
			{$t('register.tab.information')}
		</li>
		<li class="step" class:step-primary={current_step >= 4}>
			{$t('register.tab.availabilities')}
		</li>
		<li class="step" class:step-primary={current_step >= 5} data-content="?">
			{$t('register.tab.continue')}
		</li>
		<li class="step" class:step-primary={current_step >= 6} data-content="">
			{$t('register.tab.test')}
		</li>
		<li class="step" class:step-primary={current_step >= 7} data-content="★">
			{$t('register.tab.start')}
		</li>
	</ul>
</div>

<div class="max-w-screen-md mx-auto p-5">
	{#if message}
		<div class="alert alert-error text-content text-base-100 py-2 mb-4">
			{message}
		</div>
	{/if}
	{#if current_step == 1}
		<div class="join join-vertical w-full">
			<div class="join-item">
				<h2 class="text-xl font-bold text-center">{$t('register.consentTutor.title')}</h2>
				<p class="m-5">{@html $t('register.consentTutor.intro')}</p>
			</div>
			<div class="collapse collapse-arrow join-item border border-base-300">
				<input type="radio" name="consent-accordion" checked="checked" />
				<div class="collapse-title font-medium">{$t('register.consentTutor.participation')}</div>
				<div class="collapse-content">
					<p>{@html $t('register.consentTutor.participationD')}</p>
				</div>
			</div>
			<div class="collapse collapse-arrow join-item border border-base-300">
				<input type="radio" name="consent-accordion" />
				<div class="collapse-title font-medium">{$t('register.consentTutor.privacy')}</div>
				<div class="collapse-content"><p>{@html $t('register.consentTutor.privacyD')}</p></div>
			</div>
			<div class="collapse collapse-arrow join-item border border-base-300">
				<input type="radio" name="consent-accordion" />
				<div class="collapse-title font-medium">{$t('register.consentTutor.rights')}</div>
				<div class="collapse-content">
					<p>
						{$t('register.consentTutor.rightsD')}
						<a
							class="link link-primary"
							href="mailto:{$t('register.consentTutor.studyData.emailD')}"
							>{$t('register.consentTutor.studyData.emailD')}</a
						>.
					</p>
				</div>
			</div>
			<div class="collapse collapse-arrow join-item border border-base-300">
				<input type="radio" name="consent-accordion" />
				<div class="collapse-title font-medium">{$t('register.consentTutor.studyData.title')}</div>
				<div class="collapse-content">
					<dl class="text-sm">
						<div class="sm:grid sm:grid-cols-3 sm:gap-4 mb-1">
							<dt class="font-medium">{$t('register.consentTutor.studyData.study')}</dt>
							<dd class="text-gray-700 sm:col-span-2">
								{$t('register.consentTutor.studyData.studyD')}
							</dd>
						</div>
						<div class="sm:grid sm:grid-cols-3 sm:gap-4 mb-1">
							<dt class="font-medium">{$t('register.consentTutor.studyData.project')}</dt>
							<dd class="text-gray-700 sm:col-span-2">
								{$t('register.consentTutor.studyData.projectD')}
							</dd>
						</div>
						<div class="sm:grid sm:grid-cols-3 sm:gap-4 mb-1">
							<dt class="font-medium">{$t('register.consentTutor.studyData.university')}</dt>
							<dd class="text-gray-700 sm:col-span-2">
								{$t('register.consentTutor.studyData.universityD')}
							</dd>
						</div>
						<div class="sm:grid sm:grid-cols-3 sm:gap-4 mb-1">
							<dt class="font-medium">{$t('register.consentTutor.studyData.address')}</dt>
							<dd class="text-gray-700 sm:col-span-2">
								{$t('register.consentTutor.studyData.addressD')}
							</dd>
						</div>
						<div class="sm:grid sm:grid-cols-3 sm:gap-4 mb-1">
							<dt class="font-medium">{$t('register.consentTutor.studyData.person')}</dt>
							<dd class="text-gray-700 sm:col-span-2">
								{$t('register.consentTutor.studyData.personD')}
							</dd>
						</div>
						<div class="sm:grid sm:grid-cols-3 sm:gap-4 mb-1">
							<dt class="font-medium">{$t('register.consentTutor.studyData.email')}</dt>
							<dd class="text-gray-700 sm:col-span-2">
								<a href="mailto:{$t('register.consentTutor.studyData.emailD')}" class="link"
									>{$t('register.consentTutor.studyData.emailD')}</a
								>
							</dd>
						</div>
					</dl>
				</div>
			</div>
		</div>
		<div class="form-control">
			<button class="button mt-4" on:click={() => current_step++}>
				{$t('register.consentTutor.ok')}
			</button>
		</div>
	{:else if current_step == 2}
		<div class="space-y-2">
			<label for="email" class="form-control">
				<div class="label">
					<span class="label-text">{$t('register.email')}</span>
					<span class="label-text-alt">{$t('register.email.note')}</span>
				</div>
				<div class="input flex items-center">
					<Icon src={Envelope} class="w-4 mr-2 opacity-70" solid />
					<input
						type="text"
						class="grow"
						bind:value={email}
						placeholder={$t('register.email.ph')}
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
						class="grow"
						bind:value={nickname}
						placeholder={$t('register.nickname.ph')}
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
						class="grow"
						bind:value={password}
						placeholder={$t('register.password')}
					/>
				</div>
			</label>
			<label for="confirmPassword" class="form-control">
				<div class="input flex items-center">
					<Icon src={Key} class="w-4 mr-2 opacity-70" solid />
					<input
						type="password"
						class="grow"
						bind:value={confirmPassword}
						placeholder={$t('register.confirmPassword')}
					/>
				</div>
			</label>
			<div class="form-control">
				<button class="button mt-2" on:click={onRegister}>{$t('register.signup')}</button>
			</div>
		</div>
	{:else if current_step == 3}
		<div class="space-y-2">
			<div class="p-5 text-sm text-prose">
				{@html $t('register.welcome')}
			</div>
			<div class="form-control">
				<label for="homeLanguage" class="label">
					<span class="label-text">{$t('register.homeLanguage')}</span>
					<span class="label-text-alt">{$t('register.homeLanguage.note')}</span>
				</label>
				<select
					class="select select-bordered"
					id="homeLanguage"
					name="homeLanguage"
					required
					bind:value={home_language}
				>
					<option disabled selected value="">{$t('register.homeLanguage')}</option>
					{#each Object.entries(config.PRIMARY_LANGUAGE) as [code, name]}
						<option value={code}>{name}</option>
					{/each}
				</select>
			</div>
			<div class="form-control">
				<label for="birthyear" class="label">
					<span class="label-text">{$t('register.birthyear')}</span>
				</label>
				<select
					class="select select-bordered"
					id="birthyear"
					name="birthyear"
					required
					on:change={(e) => (birthdate = formatToUTCDate(new Date(e.target.value, 1, 1)))}
				>
					<option disabled selected value="">{$t('register.birthyear')}</option>
					{#each Array.from({ length: 82 }, (_, i) => i + 1931).reverse() as year}
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
					<input
						type="radio"
						class="radio"
						id="male"
						name="gender"
						value="male"
						on:change={() => (gender = 'male')}
					/>
					<label for="male" class="label-text cursor-pointer">
						{$t('register.genders.male')}
					</label>
				</div>
				<div class="label justify-normal gap-2 py-0">
					<input
						type="radio"
						class="radio"
						id="female"
						name="gender"
						value="female"
						on:change={() => (gender = 'female')}
					/>
					<label for="female" class="label-text cursor-pointer">
						{$t('register.genders.female')}
					</label>
				</div>
				<div class="label justify-normal gap-2 py-0">
					<input
						type="radio"
						class="radio"
						id="other"
						name="gender"
						value="other"
						on:change={() => (gender = 'other')}
					/>
					<label for="other" class="label-text cursor-pointer">
						{$t('register.genders.other')}
					</label>
				</div>
				<div class="label justify-normal gap-2 py-0">
					<input
						type="radio"
						class="radio"
						id="na"
						name="gender"
						value="na"
						on:change={() => (gender = 'na')}
					/>
					<label for="na" class="label-text cursor-pointer">
						{$t('register.genders.na')}
					</label>
				</div>
			</div>
			<div class="form-control">
				<button class="button mt-4" on:click={onData}>{$t('button.submit')}</button>
			</div>
		</div>
	{:else if current_step == 4}
		<!--{#if get(user)}-->
		<h2 class="my-4 text-xl">{$t('timeslots.setAvailabilities')}</h2>
		<Timeslots bind:timeslots />
		<div class="form-control mt-4">
			<label class="label" for="calcom">
				<span class="label-text">
					{$t('timeslots.calcom')}
					<a
						href="https://forge.uclouvain.be/sbibauw/languagelab/-/blob/93897d67f63ec81ebbe13b10035e4cd5a3a09071/docs/cal.com.md"
						target="_blank"
					>
						<Icon
							src={QuestionMarkCircle}
							class="w-5 h-5 cursor-pointer inline"
							title="Documentation"
							solid
						/>
					</a>
				</span>
			</label>
			<div class="input flex items-center">
				<Icon src={Calendar} class="w-5 h-5 mr-2 opacity-70" solid />
				<input
					type="text"
					id="calcom"
					class="grow"
					placeholder="https://cal.com/username/tutoring"
					bind:value={calcom_link}
				/>
			</div>
		</div>
		<div class="form-control">
			<button class="button mt-4" on:click={onAvailabilities}>{$t('button.submit')}</button>
		</div>
	{:else if current_step == 5}
		<div class="text-center">
			<p class="text-center">
				{@html $t('register.continue')}
			</p>
			<button class="button mt-4 w-full" on:click={() => (current_step = 6)}>
				{$t('register.continueButton')}
			</button>
			<button class="button mt-4 w-full" on:click={() => (document.location.href = '/')}>
				{$t('register.startFastButton')}
			</button>
		</div>
	{:else if current_step == 6}
		<Typingtest onFinish={onTyping} />
	{:else if current_step == 7}
		<div class="text-center">
			<p class="text-center">
				{@html $t('register.start')}
			</p>
			<button class="button mt-4 m-auto" on:click={() => (document.location.href = '/')}>
				{$t('register.startButton')}
			</button>
		</div>
	{/if}
</div>

<style lang="postcss">
	/* input:not([type='radio']) {
		@apply w-full;
	} */

	.label-text-alt {
		@apply opacity-50 ml-8;
	}

	.steps {
		@apply text-base-300;
	}
</style>
