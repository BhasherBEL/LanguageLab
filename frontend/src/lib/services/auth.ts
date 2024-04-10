import { type ServerLoad, redirect } from '@sveltejs/kit';
import { loadTranslations } from '$lib/services/i18n';

export const requireLogin: ServerLoad = async ({ params, url, cookies }) => {
	const initLocale = params.locale || 'fr';
	const { pathname } = url;

	await loadTranslations(initLocale, pathname);

	const session = cookies.get('token');

	if (!session) {
		redirect(302, `/${initLocale}/login`);
	}
};

export const getLogin: ServerLoad = async ({ cookies }) => {
	const session = cookies.get('token');

	if (!session) {
		return null;
	}
};
