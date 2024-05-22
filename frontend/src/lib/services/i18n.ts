import i18n, { type Config } from 'sveltekit-i18n';

const config: Config = {
	loaders: [
		{
			locale: 'en',
			key: '',
			loader: async () => (await import('../../lang/en.json')).default
		},
		{
			locale: 'fr',
			key: '',
			loader: async () => (await import('../../lang/fr.json')).default
		}
	],
	fallbackLocale: 'fr'
};

export const { t, locale, locales, loading, loadTranslations } = new i18n(config);
