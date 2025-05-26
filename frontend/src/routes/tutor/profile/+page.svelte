<script lang="ts">
	import { t } from '$lib/services/i18n';
	import type { PageData } from './$types';
	import autosize from 'svelte-autosize';

	let { data, form }: { data: PageData; form: FormData } = $props();
	let user = $state(data.user);

	let isLoading = false;
	let message = $state(form?.message || '');

	const MAX_BIO_LENGTH = 100;

	let bio = $state(user?.bio || '');

	let remainingCharacters = $derived(MAX_BIO_LENGTH - bio.length);

	type Availability = {
		day: string;
		start: string;
		end: string;
	};

	const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

	let availabilities: Availability[] = $state(
		user?.availabilities ? [...user?.availabilities] : []
	);
	let selectedWeekday = $state('');
	let selectedTimeStart = $state('');
	let selectedTimeEnd = $state('');

	function addAvailability() {
		if (!selectedWeekday || !selectedTimeStart || !selectedTimeEnd) {
			message = 'All fields must be selected.';
			return;
		}
		const startHour = parseInt(selectedTimeStart.split(':')[0]);
		const endHour = parseInt(selectedTimeEnd.split(':')[0]);
		if (startHour >= endHour) {
			message = 'End time must be later than start time.';
			return;
		}
		availabilities = [
			...availabilities,
			{ day: selectedWeekday, start: selectedTimeStart, end: selectedTimeEnd }
		];
		selectedWeekday = '';
		selectedTimeStart = '';
		selectedTimeEnd = '';
		message = '';
	}

	function removeAvailability(index: number) {
		availabilities = availabilities.filter((_, i) => i !== index);
	}
</script>

<div class="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow mt-8">
	<h1 class="text-2xl font-bold mb-6">{$t('profile.title')}</h1>
	{#if message}
		<div class="alert alert-error mb-4">{message}</div>
	{/if}
	<form class="space-y-6" method="POST">
		<div>
			<label class="block text-sm font-medium mb-1" for="nickname">
				{$t('register.nickname')}
			</label>
			<input
				id="nickname"
				name="nickname"
				type="text"
				class="input input-bordered w-full"
				value={user?.nickname}
				required
			/>
		</div>
		<div>
			<label class="block text-sm font-medium mb-1" for="email">
				{$t('register.email')}
			</label>
			<input
				id="email"
				name="email"
				type="email"
				class="input input-bordered w-full"
				value={user?.email}
				required
			/>
		</div>
		<div>
			<label class="block text-sm font-medium mb-1" for="gender">
				{$t('register.gender')}
			</label>
			<select
				id="gender"
				name="gender"
				class="select select-bordered w-full"
				value={user?.gender}
				required
			>
				<option value="" disabled>{$t('register.gender')}</option>
				<option value="male">{$t('register.genders.male')}</option>
				<option value="female">{$t('register.genders.female')}</option>
				<option value="other">{$t('register.genders.other')}</option>
				<option value="na">{$t('register.genders.na')}</option>
			</select>
		</div>
		<div>
			<label class="block text-sm font-medium mb-1" for="birthdate">
				{$t('register.birthyear')}
			</label>
			<input
				id="birthdate"
				name="birthdate"
				type="date"
				class="input input-bordered w-full"
				value={user?.birthdateAsDay}
			/>
			required />
		</div>
		<div>
			<label class="block text-sm font-medium mb-1" for="bio">
				{$t('register.bio')}
				<span class="text-xs text-gray-400 ml-2">{remainingCharacters} / {MAX_BIO_LENGTH}</span>
			</label>
			<textarea
				use:autosize
				id="bio"
				name="bio"
				class="textarea textarea-bordered w-full"
				bind:value={bio}
				maxlength={MAX_BIO_LENGTH}
				required
			></textarea>
		</div>
		<div>
			<h2 class="text-lg font-semibold">
				{$t('register.availabilities')}
			</h2>
			<div class="flex flex-row gap-2 mb-2 w-full">
				<select class="select select-bordered flex-grow" bind:value={selectedWeekday}>
					<option value="" disabled>{$t('register.weekday')}</option>
					{#each days as dayKey}
						<option value={dayKey}>{$t(`utils.days.${dayKey}`)}</option>
					{/each}
				</select>
				<select class="select select-bordered flex-grow" bind:value={selectedTimeStart}>
					<option value="" disabled>{$t('register.startTime')}</option>
					{#each Array.from({ length: 24 }, (_, i) => `${i}:00`) as time}
						<option value={time}>{time}</option>
					{/each}
				</select>
				<select class="select select-bordered flex-grow" bind:value={selectedTimeEnd}>
					<option value="" disabled>{$t('register.endTime')}</option>
					{#each Array.from({ length: 24 }, (_, i) => `${i}:00`) as time}
						<option value={time}>{time}</option>
					{/each}
				</select>
				<button type="button" class="btn btn-primary flex-grow" onclick={addAvailability}>
					{$t('register.addAvailability')}
				</button>
			</div>
			{#if availabilities.length > 0}
				<ul class="list-disc pl-6 py-2">
					{#each availabilities as { day, start, end }, index}
						<li class="flex justify-between items-center">
							<input type="hidden" name="availability[]" value={`${day}-${start}-${end}`} />

							<span>{$t(`utils.days.${day}`)}: {start} - {end}</span>
							<button
								type="button"
								class="text-red-500 ml-4"
								onclick={() => removeAvailability(index)}
							>
								{$t('register.remove')}
							</button>
						</li>
					{/each}
				</ul>
			{:else}
				<p class="text-gray-500 text-sm py-2">
					{$t('register.noAvailabilities')}
				</p>
			{/if}
		</div>
		<div>
			<button type="submit" class="btn btn-primary w-full mt-4" disabled={isLoading}>
				{isLoading ? $t('profile.saving') : $t('profile.save')}
			</button>
		</div>
	</form>
</div>
