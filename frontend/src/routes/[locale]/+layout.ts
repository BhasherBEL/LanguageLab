//export const prerender = true;
export const ssr = true;
//export const trailingSlash = 'always';

import type { Load } from '@sveltejs/kit';
import { loadTranslations } from '$lib/services/i18n';

export const load: Load = async ({ params, url, parent }) => {
	const initLocale = params.locale || 'fr';
	const { pathname } = url;

	await loadTranslations(initLocale, pathname);

	const { user } = await parent();
	return {
		user: user
	};
};