/**
 * I18nBridgeProviderLight
 * 
 * A lightweight I18n bridge provider that doesn't depend on react-admin.
 * Used for the public landing page to avoid pulling in the heavy react-admin bundle.
 */
import React, { createContext, useContext, useState, useCallback } from 'react';

// Simple I18nProvider interface - matches ra-core but doesn't import it
export interface SimpleI18nProvider {
    translate: (key: string, options?: any) => string;
    changeLocale: (locale: string) => Promise<void>;
    getLocale: () => string;
    getLocales?: () => Array<{ locale: string; name: string }>;
    getMessages?: (locale: string) => any;
}

interface I18nBridgeContextValue {
    i18nProvider: SimpleI18nProvider | null;
    locale: string;
    setI18nProvider: (provider: SimpleI18nProvider) => void;
    setLocale: (locale: string) => void;
}

const I18nBridgeContext = createContext<I18nBridgeContextValue>({
    i18nProvider: null,
    locale: 'es', // Default to es
    setI18nProvider: () => {},
    setLocale: () => {},
});

export const I18nBridgeProviderLight: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [i18nProvider, setI18nProviderState] = useState<SimpleI18nProvider | null>(null);
    const [locale, setLocale] = useState<string>('es');

    const setI18nProvider = useCallback((provider: SimpleI18nProvider) => {
        console.log('🌐 I18nBridgeProviderLight: Setting bridged i18nProvider');
        setI18nProviderState(provider);
        // Also sync initial locale from provider if possible
        if (provider?.getLocale) {
            setLocale(provider.getLocale());
        }
    }, []);

    return (
        <I18nBridgeContext.Provider value={{ i18nProvider, locale, setI18nProvider, setLocale }}>
            {children}
        </I18nBridgeContext.Provider>
    );
};

/**
 * Hook to access the bridged i18nProvider
 */
export const useI18nBridgeLight = () => {
    const context = useContext(I18nBridgeContext);
    return context;
};

/**
 * Hook to get locales from the bridged provider
 */
export const useBridgedLocalesLight = () => {
    const { i18nProvider } = useI18nBridgeLight();
    
    const locales = React.useMemo(() => {
        if (!i18nProvider?.getLocales) {
            return [];
        }
        return i18nProvider.getLocales();
    }, [i18nProvider]);

    return locales;
};

/**
 * Hook to change locale using the bridged provider
 */
export const useBridgedChangeLocaleLight = () => {
    const { i18nProvider } = useI18nBridgeLight();
    
    const changeLocale = useCallback(async (locale: string) => {
        if (i18nProvider?.changeLocale) {
            await i18nProvider.changeLocale(locale);
        }
    }, [i18nProvider]);

    return changeLocale;
};

/**
 * Hook to get current locale from the bridged provider
 */
export const useBridgedLocaleLight = () => {
    const { locale } = useI18nBridgeLight();
    return locale;
};

export default I18nBridgeContext;
