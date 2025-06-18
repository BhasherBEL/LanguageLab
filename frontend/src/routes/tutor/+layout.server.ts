import { type ServerLoad, error, redirect } from '@sveltejs/kit';

export const load: ServerLoad = async ({ locals }) => {
	if (locals.user == null || locals.user == undefined) {
		redirect(303, '/login');
	}

	if (locals.user == null || locals.user == undefined || locals.user.human_user.type > 1) {
		error(403, 'Forbidden');
	}
};
