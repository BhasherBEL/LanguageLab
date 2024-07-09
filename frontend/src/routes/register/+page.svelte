<script lang="ts">
	import { loginAPI, registerAPI } from '$lib/api/auth';
	import config from '$lib/config';
	import { locale, t } from '$lib/services/i18n';
	import { user } from '$lib/types/user';
	import { toastAlert } from '$lib/utils/toasts';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import Timeslots from '$lib/components/users/timeslots.svelte';
	import User, { users } from '$lib/types/user';
	import {
		getUsersAPI,
		patchUserAPI,
		createUserContactAPI,
		getUserContactsAPI
	} from '$lib/api/users';
	import { ArrowRight, Icon, Envelope, Key, UserCircle } from 'svelte-hero-icons';
	import Typingtest from '$lib/components/tests/typingtest.svelte';

	let current_step = 0;

	$: message = '';

	//let checker: HTMLDivElement;

	onMount(async () => {
		/*checker.innerHTML =
			'<label for="humanCheck" class="cursor-pointer label">' +
			$t('register.humans') +
			'<input type="checkbox" id="humanCheck" class="checkbox" required></label>';*/
		const u = get(user);

		if (u == null) {
			current_step = 1;
			return;
		}
		User.parseAll(await getUsersAPI());

		if (!u.home_language || !u.target_language || !u.birthdate || !u.gender) {
			current_step = 3;
			return;
		}

		const contacts = User.parseAll(await getUserContactsAPI(u.id));

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
	let target_language: string;
	let birthdate: string;
	let gender: string;

	let timeslots = 0n;
	$: filteredUsers = $users.filter((user) => {
		if (user.availability === 0n) return false;
		if (timeslots === 0n) return true;

		return user.availability & timeslots;
	});

	async function onRegister() {
		if (nickname == '' || email == '' || password == '' || confirmPassword == '') {
			message = $t('register.error.emptyFields');
			return;
		}
		/*if (checker.querySelector('input')?.checked === false) {
			message = $t('register.error.humanity');
			return;
		}*/
		if (password.length < 8) {
			message = $t('register.error.passwordRules');
			return;
		}
		if (password != confirmPassword) {
			message = $t('register.error.differentPasswords');
			return;
		}
		const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
		if (!emailRegex.test(email)) {
			message = $t('register.error.emailRules');
			return;
		}
		message = '';

		const registerRes = await registerAPI(email, password, nickname);

		if (registerRes !== 'OK') {
			message = registerRes;
			return;
		}

		const loginRes = await loginAPI(email, password);

		if (loginRes !== 'OK') {
			toastAlert('Failed to login: ' + loginRes);
			document.location.href = '/login';
			return;
		}

		document.location.href = '/register';

		message = 'OK';
	}

	async function onData() {
		const user_id = get(user)?.id;

		if (!user_id) {
			toastAlert('Failed to get current user ID');
			return;
		}

		if (!ui_language || !home_language || !target_language || !birthdate || !gender) {
			message = $t('register.error.emptyFields');
			return;
		}

		const res = await patchUserAPI(user_id, {
			ui_language,
			home_language,
			target_language,
			birthdate,
			gender
		});

		if (!res) {
			message = $t('register.error.metadata');
			return;
		}

		current_step++;
	}

	async function onTutor(tutor: User) {
		const user_id = get(user)?.id;

		if (!user_id) {
			toastAlert('Failed to get current user ID');
			return;
		}

		if (confirm($t('register.confirmTutor').replaceAll('{NAME}', tutor.nickname)) === false) return;

		const res = await createUserContactAPI(user_id, tutor.id);

		if (!res) {
			message = $t('register.error.tutor');
			return;
		}
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
			{$t('register.tab.timeslots')}
		</li>
		<li class="step" class:step-primary={current_step >= 5}>
			{$t('register.tab.test')}
		</li>
		<li class="step" class:step-primary={current_step >= 6}>
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
				<h2 class="text-xl font-bold text-center">{$t('register.consent.title')}</h2>
				<p class="m-5">{@html $t('register.consent.intro')}</p>
			</div>
			<div class="collapse collapse-arrow join-item border border-base-300">
				<input type="radio" name="consent-accordion" checked="checked" />
				<div class="collapse-title font-medium">{$t('register.consent.participation')}</div>
				<div class="collapse-content"><p>{@html $t('register.consent.participationD')}</p></div>
			</div>
			<div class="collapse collapse-arrow join-item border border-base-300">
				<input type="radio" name="consent-accordion" />
				<div class="collapse-title font-medium">{$t('register.consent.privacy')}</div>
				<div class="collapse-content"><p>{@html $t('register.consent.privacyD')}</p></div>
			</div>
			<div class="collapse collapse-arrow join-item border border-base-300">
				<input type="radio" name="consent-accordion" />
				<div class="collapse-title font-medium">{$t('register.consent.rights')}</div>
				<div class="collapse-content">
					<p>
						{$t('register.consent.rightsD')}
						<a class="link link-primary" href="mailto:{$t('register.consent.studyData.emailD')}"
							>{$t('register.consent.studyData.emailD')}</a
						>.
					</p>
				</div>
			</div>
			<div class="collapse collapse-arrow join-item border border-base-300">
				<input type="radio" name="consent-accordion" />
				<div class="collapse-title font-medium">{$t('register.consent.studyData.title')}</div>
				<div class="collapse-content">
					<dl class="text-sm">
						<div class="sm:grid sm:grid-cols-3 sm:gap-4 mb-1">
							<dt class="font-medium">{$t('register.consent.studyData.study')}</dt>
							<dd class="text-gray-700 sm:col-span-2">{$t('register.consent.studyData.studyD')}</dd>
						</div>
						<div class="sm:grid sm:grid-cols-3 sm:gap-4 mb-1">
							<dt class="font-medium">{$t('register.consent.studyData.project')}</dt>
							<dd class="text-gray-700 sm:col-span-2">
								{$t('register.consent.studyData.projectD')}
							</dd>
						</div>
						<div class="sm:grid sm:grid-cols-3 sm:gap-4 mb-1">
							<dt class="font-medium">{$t('register.consent.studyData.university')}</dt>
							<dd class="text-gray-700 sm:col-span-2">
								{$t('register.consent.studyData.universityD')}
							</dd>
						</div>
						<div class="sm:grid sm:grid-cols-3 sm:gap-4 mb-1">
							<dt class="font-medium">{$t('register.consent.studyData.address')}</dt>
							<dd class="text-gray-700 sm:col-span-2">
								{$t('register.consent.studyData.addressD')}
							</dd>
						</div>
						<div class="sm:grid sm:grid-cols-3 sm:gap-4 mb-1">
							<dt class="font-medium">{$t('register.consent.studyData.person')}</dt>
							<dd class="text-gray-700 sm:col-span-2">
								{$t('register.consent.studyData.personD')}
							</dd>
						</div>
						<div class="sm:grid sm:grid-cols-3 sm:gap-4 mb-1">
							<dt class="font-medium">{$t('register.consent.studyData.email')}</dt>
							<dd class="text-gray-700 sm:col-span-2">
								<a href="mailto:{$t('register.consent.studyData.emailD')}" class="link"
									>{$t('register.consent.studyData.emailD')}</a
								>
							</dd>
						</div>
					</dl>
				</div>
			</div>
		</div>
		<div class="form-control">
			<button class="button mt-4" on:click={() => current_step++}>
				{$t('register.consent.ok')}
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
				<label for="targetLanguage" class="label">
					<span class="label-text">{$t('register.targetLanguage')}</span>
					<span class="label-text-alt">{$t('register.targetLanguage.note')}</span>
				</label>
				<select
					class="select select-bordered"
					id="targetLanguage"
					name="targetLanguage"
					required
					bind:value={target_language}
				>
					{#each config.LEARNING_LANGUAGES as language}
						<option value={language}>{language}</option>
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
					bind:value={birthdate}
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
		<h2 class="my-4 text-xl">{$t('timeslots.availabilities')}</h2>
		<Timeslots bind:timeslots />
		<h2 class="my-8 text-xl">{$t('timeslots.availableTutors')}</h2>

		{#if filteredUsers.length > 0}
			<table class="table table-fixed">
				<thead>
					<tr>
						<th>{$t('users.nickname')}</th>
						<th>{$t('users.email')}</th>
						<th>{$t('users.availability')}</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{#each filteredUsers as user}
						<tr>
							<td>{user.nickname}</td>
							<td>{user.email}</td>
							<td>
								{#each Array.from({ length: 8 }, (_, i) => i) as i}
									{@const time = i * 2 + 8}
									{#each Array.from({ length: 7 }, (_, day) => day) as day}
										{@const bin = 1n << BigInt(i * 7 + day + 1)}
										{#if user.availability & bin}
											<span class:font-bold={timeslots & bin}>
												{$t('utils.days.' + day)}
												{time}h - {time + 2}h
												<br />
											</span>
										{/if}
									{/each}
								{/each}
							</td>
							<td class="border-2 text-center">
								<button class="button m-auto" on:click={() => onTutor(user)}>
									<Icon src={ArrowRight} size="32" />
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{:else}
			<p>{$t('timeslots.noTutors')}</p>
		{/if}
	{:else if current_step == 5}
		<Typingtest onFinish={onTyping} />
	{:else if current_step == 6}
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
