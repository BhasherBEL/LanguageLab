import { type ServerLoad, redirect } from '@sveltejs/kit';

export const load: ServerLoad = async ({ locals, url }) => {
	if (locals.user != null && locals.user != undefined) {
		const path = url.searchParams.get('redirect') || '/';
		redirect(307, path);
	}

	return {
		user: locals.user,
		session: locals.session,
		locale: locals.locale
	};
};
