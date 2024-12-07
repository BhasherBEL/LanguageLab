export const ssr = true;

import { error, type Load } from '@sveltejs/kit';
import { loadTranslations } from '$lib/services/i18n';
import User from '$lib/types/user';

export const load: Load = async ({ url, data }) => {
	if (!data) {
		return error(500, 'No data');
	}

	const { user, locale } = data!;
	const { pathname } = url;

	await loadTranslations(locale, pathname);

	return {
		user: user ? User.parse(user) : null
	};
};
