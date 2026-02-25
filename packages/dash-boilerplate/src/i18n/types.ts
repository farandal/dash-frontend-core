/**
 * I18n Types for dash-boilerplate
 * 
 * Shared types for internationalization across apps.
 */

/**
 * Simple I18nProvider interface - matches ra-core but doesn't import it.
 * Used for lightweight apps that don't depend on react-admin.
 */
export interface SimpleI18nProvider {
    translate: (key: string, options?: Record<string, any>) => string;
    changeLocale: (locale: string) => Promise<void>;
    getLocale: () => string;
    getLocales?: () => Array<{ locale: string; name: string }>;
    getMessages?: (locale: string) => Record<string, any>;
}

/**
 * Locale definition
 */
export interface LocaleDefinition {
    locale: string;
    name: string;
    languageId?: string;
    icon?: string;
}

/**
 * Translation messages type
 */
export type TranslationMessages = Record<string, any>;

/**
 * Translations map by locale
 */
export type TranslationsMap = Record<string, TranslationMessages>;
