<script lang="ts">
	import config from '$lib/config';
	import { patchUserAPI } from '$lib/api/users';
	import { displayDate } from '$lib/utils/date';
	import { t } from '$lib/services/i18n';
	import { Icon, Envelope, Key, UserCircle } from 'svelte-hero-icons';
	import { browser } from '$app/environment';
	import type { PageData } from './$types';
	import Consent from '$lib/components/surveys/consent.svelte';
	import type Study from '$lib/types/study';

	let { data, form }: { data: PageData; form: FormData } = $props();
	let study: Study | undefined | null = $state(data.study);
	let studies: Study[] | undefined = $state(data.studies);
	let user = $state(data.user);
	let message = $state('');

	let selectedStudy: Study | undefined = $state();

	let tutors = $state(data.tutors || []);
	let isLoading = $state(false);
	let selectedTutorEmail = $state('');
	let is_tutor = $state(false);
	const MAX_BIO_LENGTH = 100;
	let remainingCharacters = $state(MAX_BIO_LENGTH);
	let bio = $state('');

	type Availability = {
		day: string;
		start: string;
		end: string;
	};

	let selectedWeekday: string = $state('');
	let selectedTimeStart: string = $state('');
	let selectedTimeEnd: string = $state('');

	const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
	let availability: Availability[] = $state([]);
	let showSchedulePopup = $state(false);
	let selectedTutor: any = $state(null);
	let selectedSlot: Availability | null = $state(null);

	let current_step = $state(
		(() => {
			if (user == null) {
				if (form?.message) return 3;
				if (study) return 2;
				return 1;
			} else if (user.type == 1)
				if (!user.home_language || !user.birthdate || !user.gender || !user.bio) {
					return 4;
				} else if (user.bio) {
					return 6;
				} else {
					return 8;
				}
			else if (user.type == 2) {
				if (!user.home_language || !user.target_language || !user.birthdate || !user.gender) {
					return 4;
				} else if (tutors.length > 0) {
					return 5;
				} else if (!user.my_tutor) {
					return 7;
				} else {
					return 8;
				}
			}
			return 1;
		})()
	);

	let study_id: number | null = (() => {
		if (!browser) return null;
		let study_id_str = new URLSearchParams(window.location.search).get('study');
		if (!study_id_str) return null;
		return parseInt(study_id_str) || null;
	})();

	async function handleTutorSelection(tutor: any) {
		selectedTutorEmail = tutor.email;
		selectedTutor = tutor;
		showSchedulePopup = true;
	}

	async function confirmMeeting() {
		if (!selectedSlot) return;

		const updatedSlots = [...(user.my_slots || []), selectedSlot];
		selectedTutorEmail = selectedTutor.email;
		showSchedulePopup = false;

		if (user?.id) {
			try {
				// Fixme: this should be moved to the server side
				const success = await patchUserAPI(fetch, user.id, {
					my_tutor: selectedTutorEmail,
					my_slots: updatedSlots
				});
				if (success) current_step += 2;
			} catch (error) {
				console.error('Error:', error);
			}
		}
	}

	function handleBioInput(event: Event) {
		const target = event.target as HTMLTextAreaElement;

		if (target.value.length > MAX_BIO_LENGTH) {
			target.value = target.value.slice(0, MAX_BIO_LENGTH);
		}

		bio = target.value;
		remainingCharacters = MAX_BIO_LENGTH - bio.length;
	}

	function addAvailability(): void {
		if (!selectedWeekday || !selectedTimeStart || !selectedTimeEnd) {
			console.error('All fields must be selected.');
			return;
		}
		const startHour = parseInt(selectedTimeStart.split(':')[0]);
		const endHour = parseInt(selectedTimeEnd.split(':')[0]);

		if (startHour >= endHour) {
			alert('End time must be later than start time.');
			return;
		}

		availability.push({
			day: selectedWeekday,
			start: selectedTimeStart,
			end: selectedTimeEnd
		});

		selectedWeekday = '';
		selectedTimeStart = '';
		selectedTimeEnd = '';
	}

	function removeAvailability(index: number): void {
		availability.splice(index, 1);
	}

	async function onAvailabilities() {
		let res;
		if (user && user.id) {
			res = await patchUserAPI(fetch, user.id, {
				availabilities: availability
			});
		}

		if (!res) return;

		current_step++;
	}
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
		<li class="step" class:step-primary={current_step >= 6}>
			{$t('register.tab.availabilities')}
		</li>
		<li class="step" class:step-primary={current_step >= 7} data-content="?">
			{$t('register.tab.continue')}
		</li>
		<li class="step" class:step-primary={current_step >= 8} data-content="">
			{$t('register.tab.test')}
		</li>
		<li class="step" class:step-primary={current_step >= 9} data-content="★">
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
	{/if}

	{#if current_step == 2}
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
					<label for="role" class="label">
						<span class="label-text">{$t('register.role')}</span>
					</label>
					<select class="select select-bordered" id="role" name="role" bind:value={is_tutor}>
						<option value="2">{$t('register.roles.learner')}</option>
						<option value="1">{$t('register.roles.tutor')}</option>
					</select>
				</div>
				<div class="form-control">
					<button class="button mt-2">{$t('register.signup')}</button>
				</div>
			</form>
		</div>
	{:else if current_step == 4}
		{#if user && user.type === 2}
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
				<div class="form-control">
					<button class="button mt-4">{$t('button.submit')}</button>
				</div>
			</form>
		{:else}
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
				<div class="form-control">
					<label for="bio" class="label">
						<span class="label-text">{$t('register.bio')}</span>
						<span class="label-text-alt">{remainingCharacters} / {MAX_BIO_LENGTH}</span>
					</label>
					<textarea
						id="bio"
						name="bio"
						class="textarea textarea-bordered"
						placeholder={$t('register.bio.note')}
						rows="3"
						required
						oninput={handleBioInput}
						bind:value={bio}
					></textarea>
				</div>
				<div class="form-control">
					<button class="button mt-4">{$t('button.submit')}</button>
				</div>
			</form>
		{/if}
	{:else if current_step == 5}
		{#if isLoading}
			<p>{$t('register.loadingTutors')}</p>
		{:else if tutors && tutors.length > 0}
			<div class="max-w-4xl mx-auto">
				<ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-gray-100">
					{#each tutors as tutor}
						<li
							class="card shadow-lg bg-white border border-gray-200 rounded-lg hover:shadow-xl transition-shadow w-full max-w-[300px] mx-auto"
						>
							<div class="card-body flex flex-col items-center text-center p-4">
								<div class="avatar placeholder">
									<div
										class="bg-neutral-focus text-neutral-content rounded-full w-16 h-16 flex items-center justify-center mb-4"
									>
										{#if tutor.gender === 'female'}
											<span class="text-2xl">👩</span>
										{:else if tutor.gender === 'male'}
											<span class="text-2xl">👨</span>
										{:else}
											<span class="text-2xl">👤</span>
										{/if}
									</div>
								</div>
								<h3 class="card-title text-lg font-bold text-gray-800 break-all">
									{tutor.nickname}
								</h3>
								<p class="text-sm text-gray-600 break-all">{tutor.email}</p>
								<p class="text-sm text-gray-600">
									{$t('register.firstLanguage')}
									{tutor.home_language || 'Not specified'}
								</p>
								<p class="text-xs text-gray-500 mt-1">{tutor.bio || 'No bio available.'}</p>
								{#if tutor.availabilities?.length > 0}
									<p class="text-sm text-gray-800 mt-2">{$t('register.availabilities')}</p>
									<ul class="text-xs text-gray-500">
										{#each tutor.availabilities as availability}
											<li>{availability.day}: {availability.start} - {availability.end}</li>
										{/each}
									</ul>
								{:else}
									<p class="text-xs text-gray-500 mt-1">{$t('register.noAvailabilities')}</p>
								{/if}
								{#if tutor.availabilities?.length > 0}
									<button
										class="btn btn-primary mt-4 text-white"
										onclick={() => handleTutorSelection(tutor)}
										onkeydown={(e) => e.key === 'Enter' && handleTutorSelection(tutor)}
									>
										{$t('register.scheduleMeeting')}
									</button>
								{:else}
									<button class="btn btn-disabled mt-4">{$t('register.notAvailable')} </button>
								{/if}
							</div>
						</li>
					{/each}
				</ul>
			</div>
		{:else}
			<p>{$t('register.noTutorsAvailable')}</p>
		{/if}
	{:else if current_step == 6}
		<h2 class="my-4 text-xl">{$t('timeslots.setAvailabilities')}</h2>
		<div class="form-control mt-4">
			<select id="weekday" bind:value={selectedWeekday} class="select select-bordered w-full">
				<option disabled value="">{$t('register.weekday')}</option>
				{#each days as dayKey}
					<option value={dayKey}>{$t(`utils.days.${dayKey}`)}</option>
				{/each}
			</select>
		</div>

		<div class="form-control mt-4">
			<select id="timeStart" bind:value={selectedTimeStart} class="select select-bordered w-full">
				<option disabled value="">{$t('register.startTime')}</option>
				{#each Array.from({ length: 24 }, (_, i) => `${i}:00`) as time}
					<option value={time}>{time}</option>
				{/each}
			</select>
		</div>

		<div class="form-control mt-4">
			<select id="timeEnd" bind:value={selectedTimeEnd} class="select select-bordered w-full">
				<option disabled value="">{$t('register.endTime')}</option>
				{#each Array.from({ length: 24 }, (_, i) => `${i}:00`) as time}
					<option value={time}>{time}</option>
				{/each}
			</select>
		</div>

		<div class="form-control mt-4">
			<button class="button" onclick={addAvailability}>{$t('register.addAvailability')}</button>
		</div>

		{#if availability.length > 0}
			<h3 class="mt-4 text-lg">{$t('register.yourAvailabilities')}</h3>
			<ul class="list-disc pl-6">
				{#each availability as { day, start, end }, index}
					<li class="flex justify-between items-center">
						<span>{day}: {start} - {end}</span>
						<button onclick={() => removeAvailability(index)} class="text-red-500 ml-4">
							{$t('register.remove')}
						</button>
					</li>
				{/each}
			</ul>
		{/if}
		<div class="form-control">
			<form onsubmit={onAvailabilities}>
				<button type="submit" class="button mt-4">{$t('button.submit')}</button>
			</form>
		</div>
	{:else if current_step == 7}
		<div class="text-center">
			<a class="button mt-4 w-full" href="/studies/{study?.id || user?.studies_id[0]}">
				{$t('register.continueButton')}
			</a>
			<button class="button mt-4 w-full" onclick={() => (document.location.href = '/')}>
				{$t('register.startFastButton')}
			</button>
		</div>
	{:else if current_step == 8}{:else if current_step == 9}
		<div class="text-center">
			<button class="button mt-4 m-auto" onclick={() => (document.location.href = '/')}>
				{$t('register.startButton')}
			</button>
		</div>
	{/if}
	{#if showSchedulePopup}
		<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
			<div class="bg-white rounded-lg p-6 max-w-sm w-full">
				<h3 class="text-lg font-bold mb-4">
					{$t('register.ScheduleWith')}
					{selectedTutor.nickname}
				</h3>

				{#if selectedTutor.availabilities?.length > 0}
					<p class="mb-2">{$t('register.tab.availableSlots')}</p>
					<ul class="space-y-2">
						{#each selectedTutor.availabilities as availability (availability.day)}
							<button
								type="button"
								class="flex justify-between items-center p-2 rounded cursor-pointer transition-colors {selectedSlot?.day ===
									availability.day && selectedSlot?.start === availability.start
									? 'bg-blue-100'
									: 'bg-gray-50 hover:bg-gray-100'}"
								onclick={() => (selectedSlot = availability)}
							>
								<span>
									{$t(`${availability.day.toLowerCase()}`)}:
									{availability.start} - {availability.end}
								</span>
							</button>
						{/each}
					</ul>
				{:else}
					<p>{$t('register.noAvailability')}</p>
				{/if}

				<div class="mt-4 flex gap-2 justify-end">
					<button class="btn btn-ghost" onclick={() => (showSchedulePopup = false)}>
						{$t('button.cancel')}
					</button>
					<button class="btn btn-primary" onclick={confirmMeeting} disabled={!selectedSlot}>
						{$t('register.confirm')}
					</button>
				</div>
			</div>
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
