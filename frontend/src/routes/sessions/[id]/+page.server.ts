import { type ServerLoad, redirect } from '@sveltejs/kit';

export const load: ServerLoad = async ({ params, locals }) => {
	if (locals.user == null || locals.user == undefined) {
		redirect(307, '/login?redirect=/sessions/' + params.id);
	}

	return locals;
};
