import { type ServerLoad, redirect } from '@sveltejs/kit';
import { patchUserAPI } from '$lib/api/users';

export const load: ServerLoad = async ({ cookies, locals, fetch }) => {
	if (locals.user) {
		try {
			const success = await patchUserAPI(fetch, locals.user.id, { is_active: false });
			if (!success) {
				console.error('Failed to update user status.');
			}
		} catch (error) {
			console.error('Error updating user status:', error);
		}
	}

	cookies.set('access_token_cookie', '', { maxAge: -1, path: '/' });
	cookies.set('refresh_token_cookie', '', { maxAge: -1, path: '/' });

	locals.user = null;

	throw redirect(303, '/login');
};
