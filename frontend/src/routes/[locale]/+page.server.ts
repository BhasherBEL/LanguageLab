import { type ServerLoad, redirect } from '@sveltejs/kit';
import { locale } from '$lib/services/i18n';

export const load: ServerLoad = async ({ locals }) => {
	console.log(locals);
	if (locals.user == null || locals.user == undefined) {
		redirect(307, `/${locale}/login`);
	}
};
