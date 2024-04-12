import { type ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ locals }) => {
	console.log('LO', locals);
	return {
		user: locals.user,
		session: locals.session,
		locale: locals.locale
	};
};
