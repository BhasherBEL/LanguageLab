import { redirect, type ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ params, locals }) => {
	if (locals.user == null || locals.user == undefined) {
		redirect(303, '/login?redirect=/tests/typing/' + params.id);
	}
};
