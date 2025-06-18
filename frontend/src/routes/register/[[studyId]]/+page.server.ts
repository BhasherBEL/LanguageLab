import { addUserToStudyAPI } from '$lib/api/studies';
import { patchUserAPI } from '$lib/api/users';
import { formatToUTCDate } from '$lib/utils/date';
import { validateEmail, validatePassword, validateUsername } from '$lib/utils/security';
import { redirect, type Actions } from '@sveltejs/kit';

export const actions: Actions = {
	register: async ({ request, fetch, params, url }) => {
		const formData = await request.formData();
		const study_idStr = params.studyId;
		if (!study_idStr) return { message: 'Invalid request' };
		const study_id = parseInt(study_idStr);
		if (isNaN(study_id)) return { message: 'Invalid request' };

		const email = formData.get('email');
		const nickname = formData.get('nickname');
		const password = formData.get('password');
		const confirmPassword = formData.get('confirmPassword');
		const role = formData.get('role');

		if (!email || !nickname || !password || !confirmPassword) {
			return { message: 'Invalid request' };
		}

		if (!validateEmail(email)) return { message: 'Invalid email' };
		if (!validateUsername(nickname)) return { message: 'Invalid username' };
		if (!validatePassword(password)) return { message: 'Invalid password' };

		if (password !== confirmPassword) return { message: 'Passwords do not match' };

		const is_tutor = Number(role) === 1;

		let response = await fetch(`/api/auth/register`, {
			headers: {
				'Content-Type': 'application/json'
			},
			method: 'POST',
			body: JSON.stringify({ email, nickname, password, is_tutor, study_id })
		});

		if (response.status === 400) return { message: 'User already exists' };
		if (response.status === 401) return { message: 'Failed to create user' };
		if (response.status === 422) return { message: 'Invalid request' };
		if (!response.ok) return { message: 'Unknown error occurred' };

		response = await fetch(`/api/auth/login`, {
			headers: {
				'Content-Type': 'application/json'
			},
			method: 'POST',
			body: JSON.stringify({ email, password })
		});

		if (response.status === 401) return { message: 'Incorrect email or password' };
		if (response.status === 422) return { message: 'Invalid request' };
		if (!response.ok) return { message: 'Unknown error occurred' };

		if (url.searchParams.has('role')) {
			return redirect(303, `/register/${study_id}?role=${url.searchParams.get('role')}`);
		}

		return redirect(303, `/register/${study_id}`);
	},
	data: async ({ request, fetch, locals }) => {
		if (!locals.user) {
			return { message: 'Unauthorized' };
		}

		const formData = await request.formData();

		const homeLanguage = formData.get('homeLanguage');
		const targetLanguage = formData.get('targetLanguage');
		const birthyear = formData.get('birthyear');
		const gender = formData.get('gender');
		const bio = formData.get('bio');
		let my_tutor = formData.get('myTutor');

		if (locals.user.human_user.type == 2) {
			if (!homeLanguage || !targetLanguage || !birthyear || !gender) {
				return { message: 'Invalid request' };
			}
			// Fixme: I struggled to retrieve the my_tutor's value in the form (temporary fix)
			if (!my_tutor || (my_tutor as string).trim() === '') {
				my_tutor = '';
			}

			let birthdate;
			try {
				birthdate = formatToUTCDate(new Date(parseInt(birthyear.toString()), 0, 30));
			} catch (e) {
				return { message: 'Invalid request' };
			}

			let response = await patchUserAPI(fetch, locals.user.id, {
				human_user: {
					home_language: homeLanguage,
					target_language: targetLanguage,
					gender,
					birthdate,
					my_tutor: my_tutor
				}
			});
			if (!response) return { message: 'Unknown error occurred' };

			redirect(303, `/register/`);
		} else if (locals.user.human_user.type == 1) {
			if (!homeLanguage || !birthyear || !gender || !bio) {
				return { message: 'Invalid request' };
			}

			let birthdate;
			try {
				birthdate = formatToUTCDate(new Date(parseInt(birthyear.toString()), 0, 30));
			} catch (e) {
				return { message: 'Invalid request' };
			}

			let response = await patchUserAPI(fetch, locals.user.id, {
				human_user: {
					home_language: homeLanguage,
					target_language: targetLanguage,
					gender,
					birthdate,
					bio
				}
			});
			if (!response) return { message: 'Unknown error occurred' };
			redirect(303, `/register/`);
		}
	}
};
