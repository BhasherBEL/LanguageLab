import { addUserToStudyAPI } from '$lib/api/studies';
import { patchUserAPI } from '$lib/api/users';
import { formatToUTCDate } from '$lib/utils/date';
import { validateEmail, validatePassword, validateUsername } from '$lib/utils/security';
import { redirect, type Actions } from '@sveltejs/kit';

export const actions: Actions = {
	register: async ({ request, fetch, params }) => {
		const formData = await request.formData();
		const studyId = params.studyId;
		if (!studyId) return { message: 'Invalid request' };

		const email = formData.get('email');
		const nickname = formData.get('nickname');
		const password = formData.get('password');
		const confirmPassword = formData.get('confirmPassword');

		if (!email || !nickname || !password || !confirmPassword) {
			return { message: 'Invalid request' };
		}

		if (!validateEmail(email)) return { message: 'Invalid email' };
		if (!validateUsername(nickname)) return { message: 'Invalid username' };
		if (!validatePassword(password)) return { message: 'Invalid password' };

		if (password !== confirmPassword) return { message: 'Passwords do not match' };

		let response = await fetch(`/api/auth/register`, {
			headers: {
				'Content-Type': 'application/json'
			},
			method: 'POST',
			body: JSON.stringify({ email, nickname, password, is_tutor: false })
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

		return redirect(303, `/register/${studyId}`);
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
		const study = formData.get('study');

		if (!homeLanguage || !targetLanguage || !birthyear || !gender || !study) {
			return { message: 'Invalid request' };
		}

		let birthdate;
		try {
			birthdate = formatToUTCDate(new Date(parseInt(birthyear.toString()), 0, 30));
		} catch (e) {
			return { message: 'Invalid request' };
		}

		let studyId;
		try {
			studyId = parseInt(study.toString());
		} catch (e) {
			return { message: 'Invalid request' };
		}

		let response = await patchUserAPI(fetch, locals.user.id, {
			home_language: homeLanguage,
			target_language: targetLanguage,
			gender,
			birthdate
		});
		if (!response) return { message: 'Unknown error occurred' };

		response = await addUserToStudyAPI(fetch, studyId, locals.user.id);
		if (!response) return { message: 'Failed to add user to study' };

		redirect(303, '/register');
	}
};
