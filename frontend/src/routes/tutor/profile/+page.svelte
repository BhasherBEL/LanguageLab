<script lang="ts">
	import { t } from '$lib/services/i18n';
	import { patchUserAPI } from '$lib/api/users';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const formatBirthdate = (dateStr: string | Date | undefined): string => {
		if (!dateStr) return '';
		const date = new Date(dateStr);
		if (!isNaN(date.getTime())) return date.toISOString().split('T')[0];
		if (typeof dateStr === 'string') {
			const [day, month, year] = dateStr.split('/');
			if (year?.length === 4) return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
		}
		return '';
	};

	let email = data.user?.email || '';
	let nickname = data.user?.nickname || '';
	let birthdate = formatBirthdate(data.user?.birthdate ?? undefined);
	let gender = data.user?.gender || '';
	let bio = data.user?.bio || '';
	let availabilities = data.user?.availabilities
		? JSON.stringify(data.user.availabilities, null, 2)
		: '';

	async function updateProfile() {
		try {
			const parsedAvailabilities = availabilities ? JSON.parse(availabilities) : [];
			const updateData = {
				email,
				nickname,
				birthdate,
				gender,
				bio,
				availabilities: parsedAvailabilities
			};

			let success = false;
			if (data.user) {
				success = await patchUserAPI(fetch, data.user.id, updateData);
			} else {
				throw new Error($t('header.tutor.userNotFound'));
			}
			if (success) {
				alert($t('header.tutor.updatedSuccessfully'));
			} else {
				alert($t('header.tutor.updateError'));
			}
		} catch (error) {
			console.error('Update failed:', error);
			alert(error instanceof Error ? error.message : $t('errors.updateFailed'));
		}
	}
</script>

<h1 class="text-3xl font-bold text-center mb-8 text-primary">
	{$t('header.tutor.profile')}
</h1>

<div class="card bg-base-100 shadow-xl max-w-2xl mx-auto p-8">
	<form on:submit|preventDefault={updateProfile} class="space-y-4">
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div class="form-control">
				<label class="label" for="email">
					<span class="label-text">{$t('home.email')}</span>
				</label>
				<input
					type="email"
					id="email"
					bind:value={email}
					class="input input-bordered focus:input-primary"
					required
				/>
			</div>

			<div class="form-control">
				<label class="label" for="nickname">
					<span class="label-text">{$t('home.nickname')}</span>
				</label>
				<input
					type="text"
					id="nickname"
					bind:value={nickname}
					class="input input-bordered focus:input-primary"
					required
				/>
			</div>

			<div class="form-control">
				<label class="label" for="birthdate">
					<span class="label-text">{$t('home.birthdate')}</span>
				</label>
				<input
					type="date"
					id="birthdate"
					bind:value={birthdate}
					class="input input-bordered focus:input-primary"
					required
				/>
			</div>

			<div class="form-control">
				<label class="label" for="gender">
					<span class="label-text">{$t('users.gender')}</span>
				</label>
				<select
					id="gender"
					bind:value={gender}
					class="select select-bordered focus:select-primary"
					required
				>
					<option value="" disabled>{$t('header.tutor.selectGender')}</option>
					<option value="male">{$t('users.genders.male')}</option>
					<option value="female">{$t('users.genders.female')}</option>
					<option value="other">{$t('users.genders.other')}</option>
				</select>
			</div>
		</div>

		<div class="form-control">
			<label class="label" for="bio">
				<span class="label-text">{$t('register.bio')}</span>
			</label>
			<textarea
				id="bio"
				rows="4"
				bind:value={bio}
				placeholder={$t('header.tutor.bio')}
				class="textarea textarea-bordered focus:textarea-primary h-24"
				required
			></textarea>
		</div>

		<div class="form-control">
			<label class="label" for="availabilities">
				<span class="label-text">
					{$t('register.availabilities')}
					<span class="text-xs text-info ml-2">(JSON format)</span>
				</span>
			</label>
			<textarea
				id="availabilities"
				rows="4"
				bind:value={availabilities}
				placeholder={$t('header.tutor.availabilities')}
				class="textarea textarea-bordered focus:textarea-primary font-mono h-32"
				required
			></textarea>
		</div>

		<button type="submit" class="btn btn-primary w-full mt-6 text-lg">
			{$t('header.tutor.update')}
		</button>
	</form>
</div>
