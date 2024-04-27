import { type ServerLoad, redirect } from '@sveltejs/kit';

const publicly_allowed = ['/login', '/register', '/tests/vocabulary'];

export const load: ServerLoad = async ({ locals, url }) => {
	if (locals.user == null || locals.user == undefined) {
		if (!publicly_allowed.includes(url.pathname)) {
			redirect(307, `/login`);
		}
	}

	return {
		user: locals.user,
		session: locals.session,
		locale: locals.locale
	};
};
