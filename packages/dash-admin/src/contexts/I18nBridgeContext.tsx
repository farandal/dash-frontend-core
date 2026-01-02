/**
 * I18nBridgeContext
 * 
 * This context bridges the i18nProvider from inside React Admin's AdminContext
 * to components that render outside of it (like the sidebar menu).
 * 
 * Problem: Components like AppMaterialMenu render in DomainAppLayout which is
 * OUTSIDE the AdminContext hierarchy. This means they can't access the custom
 * i18nProvider with getLocales() - they only get the default one.
 * 
 * Solution: DASHAdmin sets this context with the real i18nProvider, and
 * components outside AdminContext can use this context to access it.
 */
import React, { createContext, useContext, useState, useCallback } from 'react';
import type { I18nProvider } from 'react-admin';

interface I18nBridgeContextValue {
    i18nProvider: I18nProvider | null;
    setI18nProvider: (provider: I18nProvider) => void;
}

const I18nBridgeContext = createContext<I18nBridgeContextValue>({
    i18nProvider: null,
    setI18nProvider: () => {},
});

export const I18nBridgeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [i18nProvider, setI18nProviderState] = useState<I18nProvider | null>(null);

    const setI18nProvider = useCallback((provider: I18nProvider) => {
        console.log('🌐 I18nBridgeContext: Setting bridged i18nProvider', {
            hasGetLocales: !!provider?.getLocales,
            locales: provider?.getLocales?.(),
        });
        setI18nProviderState(provider);
    }, []);

    return (
        <I18nBridgeContext.Provider value={{ i18nProvider, setI18nProvider }}>
            {children}
        </I18nBridgeContext.Provider>
    );
};

/**
 * Hook to access the bridged i18nProvider
 * This should be used by components outside AdminContext that need i18n access
 */
export const useI18nBridge = () => {
    const context = useContext(I18nBridgeContext);
    return context;
};

/**
 * Hook to get locales from the bridged provider
 * Falls back to empty array if no bridge is available
 */
export const useBridgedLocales = () => {
    const { i18nProvider } = useI18nBridge();
    
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
export const useBridgedChangeLocale = () => {
    const { i18nProvider } = useI18nBridge();
    
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
export const useBridgedLocale = () => {
    const { i18nProvider } = useI18nBridge();
    
    const locale = React.useMemo(() => {
        if (!i18nProvider?.getLocale) {
            return 'en';
        }
        return i18nProvider.getLocale();
    }, [i18nProvider]);

    return locale;
};

export default I18nBridgeContext;
