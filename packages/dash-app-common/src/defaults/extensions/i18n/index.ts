/**
 * i18n Extensions Index
 * 
 * Internationalization configurations and providers.
 */

// Default Translations
export { 
    dashDefaultTranslations, 
    dashDefaultAvailableLocales, 
    dashDefaultLocale, 
    createDashDefaultI18nProvider,
    loadDashDefaultTranslationsAsync,
    createDashDefaultI18nProviderAsync 
} from './dashDefaultTranslations';

// Default i18n Provider hook and factory
export { 
    useDashDefaultI18nProvider, 
    createDashDefaultI18nProviderWithSettings,
    createDashDefaultI18nProviderFromAppState 
} from './dashDefaultI18nProvider';
