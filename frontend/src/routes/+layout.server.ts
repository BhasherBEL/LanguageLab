import { type ServerLoad, redirect } from '@sveltejs/kit';

const publicly_allowed = ['/login', '/register', '/studies'];

const isPublic = (path: string) => {
	for (const allowed of publicly_allowed) {
		if (path.startsWith(allowed)) {
			return true;
		}
	}
	return false;
};

export const load: ServerLoad = async ({ locals, url }) => {
	if (locals.user == null || locals.user == undefined) {
		if (!isPublic(url.pathname)) {
			redirect(303, `/login`);
		}
	}

	return {
		user: locals.user,
		locale: locals.locale
	};
};
