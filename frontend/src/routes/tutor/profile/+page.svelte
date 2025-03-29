<script lang="ts">
	import { t } from '$lib/services/i18n';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const formatBirthdate = (dateStr: string | undefined): string => {
		if (!dateStr) return '';
		const isoDate = dateStr.split('T')[0];
		if (/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return isoDate;
		const [day, month, year] = dateStr.split('/');
		if (year?.length === 4) {
			return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
		}

		return '';
	};

	let email = data.user?.email || '';
	let nickname = data.user?.nickname || '';
	let birthdate = formatBirthdate(
		data.user?.birthdate ? data.user.birthdate.toString() : undefined
	);
	let gender = data.user?.gender || '';
	let bio = data.user?.bio || '';
	let availabilities = data.user?.availabilities
		? JSON.stringify(data.user.availabilities, null, 2)
		: '';

	function updateProfile() {
		let parsedAvailabilities;
		try {
			parsedAvailabilities = availabilities ? JSON.parse(availabilities) : [];
		} catch (error) {
			alert($t('errors.invalidAvailabilities'));
			return;
		}

		console.log({
			email,
			nickname,
			birthdate,
			gender,
			bio,
			availabilities: parsedAvailabilities
		});
		alert($t('profile.updatedSuccessfully'));
	}
</script>

<h1 class="text-2xl font-bold text-center my-5">{$t('header.tutor.profile')}</h1>

<div class="max-w-lg mx-auto bg-white shadow-md rounded-lg p-6">
	<form on:submit|preventDefault={updateProfile}>
		<div class="mb-4">
			<label for="email" class="block text-sm font-medium text-gray-700">{$t('home.email')}</label>
			<input
				type="email"
				id="email"
				bind:value={email}
				class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
				required
			/>
		</div>

		<div class="mb-4">
			<label for="nickname" class="block text-sm font-medium text-gray-700"
				>{$t('home.nickname')}</label
			>
			<input
				type="text"
				id="nickname"
				bind:value={nickname}
				class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
				required
			/>
		</div>

		<div class="mb-4">
			<label for="birthdate" class="block text-sm font-medium text-gray-700"
				>{$t('home.birthdate')}</label
			>
			<input
				type="date"
				id="birthdate"
				bind:value={birthdate}
				class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
				required
			/>
		</div>

		<div class="mb-4">
			<label for="gender" class="block text-sm font-medium text-gray-700"
				>{$t('users.gender')}</label
			>
			<select
				id="gender"
				bind:value={gender}
				class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
				required
			>
				<option value="" disabled>{$t('header.tutor.selectGender')}</option>
				<option value="male">{$t('users.genders.male')}</option>
				<option value="female">{$t('users.genders.female')}</option>
				<option value="other">{$t('users.genders.other')}</option>
			</select>
		</div>

		<div class="mb-4">
			<label for="bio" class="block text-sm font-medium text-gray-700">{$t('register.bio')}</label>
			<textarea
				id="bio"
				rows="4"
				bind:value={bio}
				placeholder={$t('header.tutor.bio')}
				class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
				required
			></textarea>
		</div>

		<div class="mb-4">
			<label for="availabilities" class="block text-sm font-medium text-gray-700"
				>{$t('register.availabilities')}</label
			>
			<textarea
				id="availabilities"
				rows="4"
				bind:value={availabilities}
				placeholder={$t('header.tutor.availabilities')}
				class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
				required
			></textarea>
		</div>

		<button
			type="submit"
			class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md shadow-md focus:outline-none focus:ring focus:ring-indigo-200"
		>
			{$t('header.tutor.update')}
		</button>
	</form>
</div>
