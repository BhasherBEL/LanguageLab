import { fail, type Actions } from '@sveltejs/kit';
import { patchUserAPI } from '$lib/api/users';
import { safeRedirectAuto } from '$lib/utils/security';

export const actions: Actions = {
	default: async ({ request, fetch, locals, url }) => {
		if (!locals.user) {
			return fail(401, { message: 'Unauthorized' });
		}
		const formData = await request.formData();
		const nickname = formData.get('nickname') as string;
		const email = formData.get('email') as string;
		const gender = formData.get('gender') as string;
		const birthyear = formData.get('birthdate') as string;
		const bio = formData.get('bio') as string;
		const availabilitiesRaw = formData.getAll('availability[]') as string[];

		if (!birthyear || birthyear.length !== 4 || isNaN(Number(birthyear))) {
			return fail(400, { message: 'Invalid birth year.' });
		}

		const birthdate = `${birthyear}-01-01`;

		let availabilities: { day: string; start: string; end: string }[] = [];
		for (const availability of availabilitiesRaw) {
			const [day, start, end] = availability.split('-', 3);

			if (!day || !start || !end) continue;

			availabilities.push({
				day: day.trim(),
				start: start.trim(),
				end: end.trim()
			});
		}

		console.log('Updating profile with data:', {
			nickname,
			email,
			gender,
			birthdate,
			bio,
			availabilities
		});

		const data: any = {
			nickname,
			email,
			gender,
			birthdate,
			bio,
			availabilities
		};

		const ok = await patchUserAPI(fetch, locals.user.id, data);

		if (!ok) {
			return fail(400, { message: 'Failed to update profile.' });
		}

		return safeRedirectAuto(url);
	}
};
