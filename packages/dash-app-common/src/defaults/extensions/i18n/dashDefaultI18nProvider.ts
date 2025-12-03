/**
 * Dash Default i18n Provider Extension
 * 
 * Internationalization provider configuration with memoization support.
 */
import { useMemo } from 'react';
import polyglotI18nProvider from 'ra-i18n-polyglot';
import { dashDefaultTranslations, dashDefaultAvailableLocales, dashDefaultLocale } from './dashDefaultTranslations';

// Re-export dash default translations
export { dashDefaultTranslations, dashDefaultAvailableLocales, dashDefaultLocale } from './dashDefaultTranslations';
export { loadDashDefaultTranslationsAsync, createDashDefaultI18nProviderAsync } from './dashDefaultTranslations';
/**
 * Create dash default i18n provider with settings state
 */
export const createDashDefaultI18nProviderWithSettings = (settings: {
    locale?: string;
    availableLocales?: Array<{ locale: string; name: string }>;
}) => {
    const locale = settings.locale || dashDefaultLocale;
    const locales = settings.availableLocales || dashDefaultAvailableLocales;
    
    return polyglotI18nProvider(
        (loc) => dashDefaultTranslations[loc as keyof typeof dashDefaultTranslations] || dashDefaultTranslations.en,
        locale,
        locales
    );
};

/**
 * Hook to create memoized dash default i18n provider
 * Prevents recreation on every render
 */
export const useDashDefaultI18nProvider = (settings?: {
    locale?: string;
    availableLocales?: Array<{ locale: string; name: string }>;
}) => {
    return useMemo(() => {
        const locale = settings?.locale || dashDefaultLocale;
        const locales = settings?.availableLocales || dashDefaultAvailableLocales;
        
        return polyglotI18nProvider(
            (loc) => dashDefaultTranslations[loc as keyof typeof dashDefaultTranslations] || dashDefaultTranslations.en,
            locale,
            locales.map(({ locale, name }) => ({ locale, name }))
        );
    }, [settings?.locale, settings?.availableLocales]);
};

/**
 * Create dash default i18n provider from INITIAL_APP_STATE settings
 */
export const createDashDefaultI18nProviderFromAppState = (appState: {
    settings: {
        locale: string;
        availableLocales: Array<{ locale: string; name: string }>;
    };
}) => {
    return polyglotI18nProvider(
        (loc) => dashDefaultTranslations[loc as keyof typeof dashDefaultTranslations] || dashDefaultTranslations.en,
        appState.settings.locale,
        appState.settings.availableLocales.map(({ locale, name }) => ({ locale, name }))
    );
};

export default useDashDefaultI18nProvider;
