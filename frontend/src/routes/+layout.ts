export const ssr = true;

import type { Load } from '@sveltejs/kit';
import { loadTranslations } from '$lib/services/i18n';

export const load: Load = async ({ url, data }) => {
	const { user, locale } = data;
	const { pathname } = url;

	console.log('locale', locale);

	await loadTranslations(locale, pathname);

	return {
		user: user
	};
};
