import { type ServerLoad, error, redirect } from '@sveltejs/kit';

export const load: ServerLoad = async ({ locals, url }) => {
	if (locals.user == null || locals.user == undefined) {
		if (url.pathname.startsWith('/tutor/register')) {
			return {};
		}
		redirect(303, '/login');
	}

	const user = JSON.parse(locals.user);
	if (user == null || user == undefined || user.type > 1) {
		error(403, 'Forbidden');
	}
};
