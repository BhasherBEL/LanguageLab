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
	import { getUsersAPI, patchUserAPI, createUserContactAPI } from '$lib/api/users';
	import { ArrowRight, Icon } from 'svelte-hero-icons';
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

		if (!u.home_language || !u.target_language || !u.birthdate) {
			current_step = 3;
			return;
		}

		if (!u.tutor_id) {
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

	let timeslots = 0;
	$: filteredUsers = $users.filter((user) => {
		if (user.availability === 0) return false;
		if (timeslots === 0) return true;

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

		if (!ui_language || !home_language || !target_language || !birthdate) {
			message = $t('register.error.emptyFields');
			return;
		}

		const res = await patchUserAPI(user_id, {
			ui_language,
			home_language,
			target_language,
			birthdate
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
	<ul class="steps">
		<li class="step cursor-pointer" class:step-primary={current_step >= 1}>
			{$t('register.tab.consent')}
		</li>
		<li class="step cursor-pointer" class:step-primary={current_step >= 2}>
			{$t('register.tab.signup')}
		</li>
		<li class="step cursor-pointer" class:step-primary={current_step >= 3}>
			{$t('register.tab.information')}
		</li>
		<li class="step cursor-pointer" class:step-primary={current_step >= 4}>
			{$t('register.tab.timeslots')}
		</li>
		<li class="step cursor-pointer" class:step-primary={current_step >= 5}>
			{$t('register.tab.test')}
		</li>
		<li class="step cursor-pointer" class:step-primary={current_step >= 6}>
			{$t('register.tab.start')}
		</li>
	</ul>
</div>

<div class="mt-5 w-[700px] max-w-full mx-auto">
	{#if message}
		<div class="w-full py-1 bg-red-600 text-white text-center font-bold rounded mb-4">
			{message}
		</div>
	{/if}
	{#if current_step == 1}
		<div class="text-center">
			<div>{@html $t('register.consentText')}</div>
			<button class="button mt-4" on:click={() => current_step++}>
				{$t('register.consentOK')}
			</button>
		</div>
	{:else if current_step == 2}
		<div class="space-y-5">
			<label class="input input-bordered flex items-center gap-2">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 16 16"
					fill="currentColor"
					class="w-4 h-4 opacity-70"
					><path
						d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z"
					/><path
						d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z"
					/></svg
				>
				<input type="text" class="grow" bind:value={email} placeholder={$t('register.email')} />
			</label>
			<label class="input input-bordered flex items-center gap-2">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 16 16"
					fill="currentColor"
					class="w-4 h-4 opacity-70"
					><path
						d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z"
					/></svg
				>
				<input
					type="text"
					class="grow"
					bind:value={nickname}
					placeholder={$t('register.nickname')}
				/>
			</label>
			<label class="input input-bordered flex items-center gap-2">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 16 16"
					fill="currentColor"
					class="w-4 h-4 opacity-70"
					><path
						fill-rule="evenodd"
						d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
						clip-rule="evenodd"
					/></svg
				>
				<input
					type="password"
					class="grow"
					bind:value={password}
					placeholder={$t('register.password')}
					required
				/>
			</label>
			<label class="input input-bordered flex items-center gap-2">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 16 16"
					fill="currentColor"
					class="w-4 h-4 opacity-70"
					><path
						fill-rule="evenodd"
						d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
						clip-rule="evenodd"
					/></svg
				>
				<input
					type="password"
					class="grow"
					bind:value={confirmPassword}
					placeholder={$t('register.confirmPassword')}
					required
				/>
			</label>
			<!--<div bind:this={checker} class="text-center"></div>-->
			<div class="text-center">
				<button class="button" on:click={onRegister}>{$t('register.signup')}</button>
			</div>
		</div>
	{:else if current_step == 3}
		<div class="text-center pb-2">
			{@html $t('register.welcome')}
		</div>
		<div class="mt-4">
			<label for="home_language">
				{$t('register.home_language')}
			</label>
			<select
				class="input mt-2 w-full bg-transparent"
				id="home_language"
				name="home_language"
				required
				bind:value={home_language}
			>
				{#each Object.entries(config.PRIMARY_LANGUAGE) as [code, name]}
					<option value={code}>{name}</option>
				{/each}
			</select>
		</div>
		<div class="mt-4">
			<label for="targetLanguage">{$t('register.targetLanguage')}</label>
			<select
				class="input mt-2 w-full bg-transparent"
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
		<div class="mt-4">
			<label for="birthyear">{$t('register.birthyear')}</label>
			<select
				class="input mt-2 w-full bg-transparent"
				id="birthyear"
				name="birthyear"
				required
				bind:value={birthdate}
			>
				{#each Array.from({ length: 41 }, (_, i) => i + 1980).reverse() as year}
					<option value={year}>{year}</option>
				{/each}
			</select>
		</div>
		<div class="mt-4 text-center">
			<button class="button" on:click={onData}>{$t('button.submit')}</button>
		</div>
	{:else if current_step == 4}
		<!--{#if get(user)}-->
		<h2 class="my-4 text-xl">{$t('timeslots.availabilities')}</h2>
		<Timeslots bind:timeslots />
		<h2 class="my-8 text-xl">{$t('timeslots.availableTutors')}</h2>

		{#if filteredUsers.length > 0}
			<table class="table-fixed w-full border-collapse text-center">
				<thead>
					<tr class="bg-gray-100">
						<th class="border-2 h-10">{$t('users.nickname')}</th>
						<th class="border-2">{$t('users.email')}</th>
						<th class="border-2">{$t('users.availability')}</th>
						<th class="border-2"></th>
					</tr>
				</thead>
				<tbody>
					{#each filteredUsers as user}
						<tr>
							<td class="border-2">{user.nickname}</td>
							<td class="border-2">{user.email}</td>
							<td class="border-2">
								{#each Array.from({ length: 5 }, (_, i) => i) as i}
									{@const time = i * 2 + 8}
									{#each Array.from({ length: 5 }, (_, day) => day) as day}
										{@const bin = 1 << (i * 5 + day)}
										{#if user.availability & bin}
											<span class:font-bold={timeslots & bin}>
												{$t('utils.days.' + day)}
												{time}:30 - {time + 2}:30
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
	input {
		@apply w-full;
	}
</style>
