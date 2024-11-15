import { type ServerLoad, redirect } from '@sveltejs/kit';

const publicly_allowed = ['/login', '/register', '/tests', '/surveys'];

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
			redirect(307, `/login`);
		}
	}

	return {
		user: locals.user,
		session: locals.session,
		locale: locals.locale
	};
};
