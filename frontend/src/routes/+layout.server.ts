import { type ServerLoad, redirect } from '@sveltejs/kit';
import { patchUserAPI } from '$lib/api/users';

const publicly_allowed = ['/login', '/register', '/tests', '/surveys', '/tutor/register'];

const isPublic = (path: string) => {
	for (const allowed of publicly_allowed) {
		if (path.startsWith(allowed)) {
			return true;
		}
	}
	return false;
};

export const load: ServerLoad = async ({ locals, url, fetch }) => {

	if (locals.user == null || locals.user == undefined) {
		if (!isPublic(url.pathname)) {
			throw redirect(303, `/login`);
		}
	} else {
		try {
			await patchUserAPI(fetch, locals.user.id, { is_active: true });
		} catch (error) {
			console.error('Failed to update user status:', error);
		}
	}

	return {
		user: locals.user,
		locale: locals.locale
	};
};
