import * as React from 'react';
import { resolveBrowserLocale } from 'react-admin';
import polyglotI18nProvider from 'ra-i18n-polyglot';
import englishMessages from './i18n/en';
import spanishMessages from './i18n/es';

const messages = {
	es: spanishMessages,
	en: englishMessages,
};

const availableLocales = [
	{ locale: 'en', name: 'English' },
	{ locale: 'es', name: 'Español' },
];

// ra-i18n-polyglot signature: (getMessages, initialLocale, availableLocales, polyglotOptions)
export default polyglotI18nProvider(
	(locale) => (messages[locale] ? messages[locale] : messages.es),
	resolveBrowserLocale(),
	availableLocales,    // 3rd param: availableLocales array
	{ allowMissing: true } // 4th param: polyglotOptions
);
