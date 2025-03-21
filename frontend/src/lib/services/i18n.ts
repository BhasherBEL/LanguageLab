import i18n from '@sveltekit-i18n/base';
import parser from '@sveltekit-i18n/parser-icu';

import type { Config } from '@sveltekit-i18n/parser-icu';

const config: Config = {
	parser: parser({
		ignoreTag: true
	}),
	loaders: [
		{
			locale: 'en',
			key: '',
			loader: async () => (await import('../../lang/en.json')).default
		},
		{
			locale: 'es',
			key: '',
			loader: async () => (await import('../../lang/es.json')).default
		},
		{
			locale: 'fr',
			key: '',
			loader: async () => (await import('../../lang/fr.json')).default
		},
		{
			locale: 'nl',
			key: '',
			loader: async () => (await import('../../lang/nl.json')).default
		}
	],
	fallbackLocale: 'fr'
};

export const { t, locale, locales, loading, loadTranslations } = new i18n(config);
