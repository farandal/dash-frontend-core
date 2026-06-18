/**
 * I18nBridgeProviderLight
 * 
 * A lightweight I18n bridge provider that doesn't depend on react-admin.
 * Used for the public landing page to avoid pulling in the heavy react-admin bundle.
 */
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

// Custom event name for locale changes from URL detection - must match dash-boilerplate
export const LOCALE_CHANGE_EVENT = 'dash:locale-change';

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
    // Initialize locale from localStorage if available
    const [locale, setLocale] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('dash-user-locale') || 'es';
        }
        return 'es';
    });

    const setI18nProvider = useCallback(async (provider: SimpleI18nProvider) => {
        console.log('🌐 I18nBridgeProviderLight: Setting bridged i18nProvider', {
            providerLocale: provider?.getLocale?.(),
            desiredLocale: locale,
        });
        setI18nProviderState(provider);
        
        // Check if the desired locale (from localStorage/state) differs from provider's locale
        const providerLocale = provider?.getLocale?.();
        if (providerLocale && providerLocale !== locale && provider?.changeLocale) {
            console.log(`🌐 I18nBridgeProviderLight: Provider locale (${providerLocale}) differs from desired (${locale}), switching...`);
            try {
                await provider.changeLocale(locale);
                console.log(`🌐 I18nBridgeProviderLight: Successfully switched provider to ${locale}`);
            } catch (e) {
                console.warn('🌐 I18nBridgeProviderLight: Failed to switch provider locale:', e);
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
                console.log('🌐 I18nBridgeProviderLight: Received locale change event:', newLocale);
                
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
