/**
 * Inspired by https://github.com/PhraseApp-Blog/svelte-i18n-2020-06/tree/master
 */

import { get, derived, writable } from 'svelte/store';
import {
	_,
	date,
	init,
	locale,
	number,
	dictionary,
	addMessages,
	getLocaleFromNavigator
} from 'svelte-i18n';

export const locales = {
	en: 'En',
	fr: 'Fr'
};

const fallbackLocale = 'fr';

const MESSAGE_FILE_URL_TEMPLATE = '/lang/{locale}.json';

export let _activeLocale: string;

const isDownloading = writable(false);

function setupI18n(options = { withLocale: fallbackLocale }) {
	const locale_ = supported(options.withLocale || language(getLocaleFromNavigator() ?? ''));

	init({ initialLocale: locale_, fallbackLocale: fallbackLocale });

	if (!hasLoadedLocale(locale_)) {
		isDownloading.set(true);

		const messagesFileUrl = MESSAGE_FILE_URL_TEMPLATE.replace('{locale}', locale_);

		return loadJson(messagesFileUrl).then((messages) => {
			_activeLocale = locale_;

			addMessages(locale_, messages);

			locale.set(locale_);

			isDownloading.set(false);
		});
	}
}

const isLocaleLoaded = derived(
	[isDownloading, dictionary],
	([$isDownloading, $dictionary]) =>
		!$isDownloading &&
		$dictionary[_activeLocale] &&
		Object.keys($dictionary[_activeLocale]).length > 0
);

const dir = derived(locale, ($locale) => ($locale === 'ar' ? 'rtl' : 'ltr'));

function loadJson(url: string) {
	return fetch(url).then((response) => response.json());
}

function hasLoadedLocale(locale: string) {
	return get(dictionary)[locale];
}

function language(locale: string): string {
	return locale.replace('_', '-').split('-')[0];
}

function supported(locale: string): string {
	if (Object.keys(locales).includes(locale)) {
		return locale;
	} else {
		return fallbackLocale;
	}
}

export { _, setupI18n, isLocaleLoaded, locale, dir, date, number };
