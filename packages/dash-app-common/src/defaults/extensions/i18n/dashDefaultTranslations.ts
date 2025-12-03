/**
 * Dash Default i18n Translations Extension
 * 
 * Default translations that extend the base dash-admin translations.
 */
import polyglotI18nProvider from 'ra-i18n-polyglot';
import { en, es } from 'dash-admin/src/providers/i18n/languages';

/**
 * Dash default merged translations combining dash-admin base translations
 */
export const dashDefaultTranslations: Record<string, any> = {
    en: {
        ...en,
    },
    es: {
        ...es,
    },
};

/**
 * Dash default available locales configuration
 */
export const dashDefaultAvailableLocales = [
    { locale: 'en', name: 'English' },
    { locale: 'es', name: 'Español' }
];

/**
 * Dash default locale
 */
export const dashDefaultLocale = 'en';

/**
 * Create dash default i18n provider with merged translations
 */
export const createDashDefaultI18nProvider = (locale: string = dashDefaultLocale) => {
    return polyglotI18nProvider(
        (loc) => dashDefaultTranslations[loc as keyof typeof dashDefaultTranslations] || dashDefaultTranslations.en,
        locale,
        dashDefaultAvailableLocales
    );
};

/**
 * Load dash default translations asynchronously
 * Useful for lazy loading to reduce initial bundle size
 */
export const loadDashDefaultTranslationsAsync = async () => {
    try {
        const [enLang, esLang] = await Promise.all([
            import('dash-admin').then(module => module.en),
            import('dash-admin').then(module => module.es)
        ]);

        return {
            en: { ...enLang },
            es: { ...esLang },
        };
    } catch (error) {
        console.error('Failed to load dash default translations:', error);
        return dashDefaultTranslations;
    }
};

/**
 * Create dash default i18n provider asynchronously
 */
export const createDashDefaultI18nProviderAsync = async (
    locale: string = dashDefaultLocale,
    locales?: Array<{ locale: string; name: string }>
) => {
    const loadedTranslations = await loadDashDefaultTranslationsAsync();
    
    return polyglotI18nProvider(
        (loc) => loadedTranslations[loc as keyof typeof loadedTranslations] || loadedTranslations.en,
        locale,
        locales || dashDefaultAvailableLocales
    );
};

export default dashDefaultTranslations;
