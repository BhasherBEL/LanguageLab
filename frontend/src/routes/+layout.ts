export const ssr = true;

import type { Load } from '@sveltejs/kit';
import { loadTranslations } from '$lib/services/i18n';

export const load: Load = async ({ url, data }) => {
	const { user, session, locale } = data;
	const { pathname } = url;

	await loadTranslations(locale, pathname);

	return {
		user,
		token: session
	};
};
