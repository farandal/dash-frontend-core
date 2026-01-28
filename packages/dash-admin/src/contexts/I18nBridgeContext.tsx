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
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { I18nProvider } from 'react-admin';

// Custom event name for locale changes from URL detection
export const LOCALE_CHANGE_EVENT = 'dash:locale-change';

interface I18nBridgeContextValue {
    i18nProvider: I18nProvider | null;
    locale: string;
    setI18nProvider: (provider: I18nProvider) => void;
    setLocale: (locale: string) => void;
}

const I18nBridgeContext = createContext<I18nBridgeContextValue>({
    i18nProvider: null,
    locale: 'es', // Default to es
    setI18nProvider: () => {},
    setLocale: () => {},
});

export const I18nBridgeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Initialize locale from localStorage if available
    const [i18nProvider, setI18nProviderState] = useState<I18nProvider | null>(null);
    const [locale, setLocale] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('dash-user-locale') || 'es';
        }
        return 'es';
    });

    const setI18nProvider = useCallback(async (provider: I18nProvider) => {
        console.log('🌐 I18nBridgeContext: Setting bridged i18nProvider', {
            hasGetLocales: !!provider?.getLocales,
            locales: provider?.getLocales?.(),
            providerLocale: provider?.getLocale?.(),
            desiredLocale: locale,
        });
        setI18nProviderState(provider);
        
        // Check if the desired locale (from localStorage/state) differs from provider's locale
        const providerLocale = provider?.getLocale?.();
        if (providerLocale && providerLocale !== locale && provider?.changeLocale) {
            console.log(`🌐 I18nBridgeContext: Provider locale (${providerLocale}) differs from desired (${locale}), switching...`);
            try {
                await provider.changeLocale(locale);
                console.log(`🌐 I18nBridgeContext: Successfully switched provider to ${locale}`);
            } catch (e) {
                console.warn('🌐 I18nBridgeContext: Failed to switch provider locale:', e);
            }
        } else if (provider?.getLocale) {
            // Sync state from provider if they match or no desired locale
            setLocale(provider.getLocale());
        }
    }, [locale]);

    // Listen for locale change events from URL detection (useUrlLocaleDetection hook)
    useEffect(() => {
        const handleLocaleChange = async (event: CustomEvent<{ locale: string }>) => {
            const newLocale = event.detail?.locale;
            if (newLocale && newLocale !== locale) {
                console.log('🌐 I18nBridgeContext: Received locale change event:', newLocale);
                
                // Update the provider's locale if available
                if (i18nProvider?.changeLocale) {
                    try {
                        await i18nProvider.changeLocale(newLocale);
                    } catch (e) {
                        console.warn('Failed to change provider locale:', e);
                    }
                }
                
                // Update context locale state to trigger re-renders
                setLocale(newLocale);
            }
        };

        window.addEventListener(LOCALE_CHANGE_EVENT, handleLocaleChange as EventListener);
        
        return () => {
            window.removeEventListener(LOCALE_CHANGE_EVENT, handleLocaleChange as EventListener);
        };
    }, [i18nProvider, locale]);

    return (
        <I18nBridgeContext.Provider value={{ i18nProvider, locale, setI18nProvider, setLocale }}>
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
 * Also updates the context's locale state to trigger re-renders
 */
export const useBridgedChangeLocale = () => {
    const { i18nProvider, setLocale } = useI18nBridge();
    
    const changeLocale = useCallback(async (locale: string) => {
        if (i18nProvider?.changeLocale) {
            await i18nProvider.changeLocale(locale);
        }
        // Also update the context's locale state to trigger re-renders
        setLocale(locale);
    }, [i18nProvider, setLocale]);

    return changeLocale;
};

/**
 * Hook to get current locale from the bridged provider
 */
export const useBridgedLocale = () => {
    const { locale } = useI18nBridge();
    return locale;
};

export default I18nBridgeContext;
