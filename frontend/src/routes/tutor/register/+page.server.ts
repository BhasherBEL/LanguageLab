import { redirect, type Actions } from '@sveltejs/kit';

export const actions: Actions = {
	register: async ({ request, fetch }) => {
		const formData = await request.formData();

		const email = formData.get('email');
		const nickname = formData.get('nickname');
		const password = formData.get('password');
		const is_tutor = formData.get('is_tutor') === 'true';

		if (!email || !nickname || !password) {
			return { message: 'Missing required fields' };
		}

		const registerResponse = await fetch('/api/auth/register', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email, nickname, password, is_tutor })
		});

		const registerResult = await registerResponse.json();

		if (!registerResponse.ok) {
			return { message: registerResult.detail || 'Unknown error occurred' };
		}

		const loginResponse = await fetch('/api/auth/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email, password }),
			credentials: 'include'
		});

		if (!loginResponse.ok) {
			return { message: 'Failed to log in after registration.' };
		}

		const user_id = registerResult;
		const userResponse = await fetch(`/api/users/${user_id}`, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include'
		});

		if (!userResponse.ok) {
			return { message: 'Failed to retrieve user data.' };
		}

		return redirect(303, '/tutor/register');
	}
};
