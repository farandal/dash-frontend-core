/**
 * createSimpleI18nProvider
 * 
 * Creates a lightweight i18n provider that doesn't depend on react-admin.
 * Uses Polyglot-style interpolation (%{variable}).
 */
import { SimpleI18nProvider, TranslationsMap, LocaleDefinition } from './types';

/**
 * Helper to get nested value from object using dot notation
 */
const getNestedValue = (obj: Record<string, any>, path: string): any => {
    return path.split('.').reduce((prev, curr) => (prev ? prev[curr] : null), obj);
};

/**
 * Simple interpolation for variables like %{name}
 */
const interpolate = (text: string, options?: Record<string, any>): string => {
    if (!options || !text) return text;
    return Object.keys(options).reduce((acc, key) => {
        return acc.replace(new RegExp(`%\\{${key}\\}`, 'g'), String(options[key]));
    }, text);
};

/**
 * Default locales if none provided
 */
const defaultLocales: LocaleDefinition[] = [
    { locale: 'en', name: 'English' },
    { locale: 'es', name: 'Español' },
];

export interface CreateSimpleI18nProviderOptions {
    translations: TranslationsMap;
    initialLocale?: string;
    fallbackLocale?: string;
    locales?: LocaleDefinition[];
    onLocaleChange?: (locale: string) => void;
}

/**
 * Creates a simple i18n provider for lightweight apps
 * 
 * @param options Configuration options
 * @returns SimpleI18nProvider instance
 */
export const createSimpleI18nProvider = (
    options: CreateSimpleI18nProviderOptions
): SimpleI18nProvider => {
    const {
        translations,
        initialLocale = 'es',
        fallbackLocale = 'en',
        locales = defaultLocales,
        onLocaleChange,
    } = options;

    let currentLocale = initialLocale;

    const translate = (key: string, interpolationOptions?: Record<string, any>): string => {
        // Try current locale first, then fallback
        const messages = translations[currentLocale] || translations[fallbackLocale] || {};
        const text = getNestedValue(messages, key);

        // If text is found, interpolate; otherwise return key
        if (typeof text === 'string') {
            return interpolate(text, interpolationOptions);
        }

        // Try fallback locale if not found in current
        if (currentLocale !== fallbackLocale) {
            const fallbackMessages = translations[fallbackLocale] || {};
            const fallbackText = getNestedValue(fallbackMessages, key);
            if (typeof fallbackText === 'string') {
                return interpolate(fallbackText, interpolationOptions);
            }
        }

        // Return key if not found
        return key;
    };

    const changeLocale = async (newLocale: string): Promise<void> => {
        if (translations[newLocale]) {
            currentLocale = newLocale;
            // Persist to localStorage
            localStorage.setItem('dash-user-locale', newLocale);
            onLocaleChange?.(newLocale);
            return Promise.resolve();
        }
        return Promise.reject(new Error(`Locale '${newLocale}' not found`));
    };

    const getLocale = (): string => currentLocale;

    const getLocales = (): LocaleDefinition[] => locales;

    const getMessages = (locale: string): Record<string, any> => {
        return translations[locale] || {};
    };

    return {
        translate,
        changeLocale,
        getLocale,
        getLocales,
        getMessages,
    };
};

export default createSimpleI18nProvider;
