import * as React from 'react';
import { resolveBrowserLocale } from 'react-admin';
import polyglotI18nProvider from 'ra-i18n-polyglot';
import englishMessages from './i18n/en';
import spanishMessages from './i18n/es';

const messages = {
	es: spanishMessages,
	en: englishMessages,
};

export default polyglotI18nProvider(
	(locale) => (messages[locale] ? messages[locale] : messages.es),
	resolveBrowserLocale(),
);
