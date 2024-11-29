import { safeRedirectAuto } from '$lib/utils/security';
import { type Actions, type ServerLoad, redirect } from '@sveltejs/kit';

export const load: ServerLoad = async ({ locals, url }) => {
	if (locals.user != null && locals.user != undefined) {
		const path = url.searchParams.get('redirect') || '/';
		redirect(303, path);
	}

	return {
		user: locals.user,
		jwt: locals.jwt,
		locale: locals.locale
	};
};

export const actions: Actions = {
	default: async ({ request, url, fetch }) => {
		const formData = await request.formData();

		const email = formData.get('email');
		const password = formData.get('password');

		if (!email || !password) {
			return {
				message: 'Invalid request'
			};
		}

		const response = await fetch(`/api/auth/login`, {
			headers: {
				'Content-Type': 'application/json'
			},
			method: 'POST',
			body: JSON.stringify({ email, password })
		});

		if (response.status === 401) return { message: 'Incorrect email or password' };
		if (response.status === 422) return { message: 'Invalid request' };
		if (response.status !== 200) return { message: 'Unknown error occurred' };

		return safeRedirectAuto(url);
	}
};
