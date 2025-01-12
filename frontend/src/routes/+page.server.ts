import { type ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ locals }) => {
	if (locals.user == null || locals.user == undefined) {
		return {};
	}

	return { jwt: locals.jwt, user: locals.user };
};
