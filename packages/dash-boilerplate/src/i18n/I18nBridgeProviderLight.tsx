/**
 * I18nBridgeProviderLight
 * 
 * A lightweight I18n bridge provider that doesn't depend on react-admin.
 * Used for the public landing page to avoid pulling in the heavy react-admin bundle.
 */
import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { SimpleI18nProvider } from './types';

// Custom event name for locale changes from URL detection - must match DashBootstrapUtils
export const LOCALE_CHANGE_EVENT = 'dash:locale-change';

interface I18nBridgeContextValue {
    i18nProvider: SimpleI18nProvider | null;
    locale: string;
    setI18nProvider: (provider: SimpleI18nProvider) => void;
    setLocale: (locale: string) => void;
}

const defaultContextValue: I18nBridgeContextValue = {
    i18nProvider: null,
    locale: 'es',
    setI18nProvider: () => {},
    setLocale: () => {},
};

const I18nBridgeContext = createContext<I18nBridgeContextValue>(defaultContextValue);

export interface I18nBridgeProviderLightProps {
    children: React.ReactNode;
    defaultLocale?: string;
}

export const I18nBridgeProviderLight: React.FC<I18nBridgeProviderLightProps> = ({ 
    children,
    defaultLocale = 'es',
}) => {
    const [i18nProvider, setI18nProviderState] = useState<SimpleI18nProvider | null>(null);
    // Initialize locale from localStorage if available
    const [locale, setLocale] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('dash-user-locale') || defaultLocale;
        }
        return defaultLocale;
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
        const handleLocaleChange = async (event: Event) => {
            const customEvent = event as CustomEvent<{ locale: string }>;
            const newLocale = customEvent.detail?.locale;
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

        window.addEventListener(LOCALE_CHANGE_EVENT, handleLocaleChange);
        
        return () => {
            window.removeEventListener(LOCALE_CHANGE_EVENT, handleLocaleChange);
        };
    }, [i18nProvider, locale]);

    const contextValue = useMemo(() => ({
        i18nProvider,
        locale,
        setI18nProvider,
        setLocale,
    }), [i18nProvider, locale, setI18nProvider]);

    return (
        <I18nBridgeContext.Provider value={contextValue}>
            {children}
        </I18nBridgeContext.Provider>
    );
};

/**
 * Hook to access the bridged i18nProvider
 */
export const useI18nBridgeLight = (): I18nBridgeContextValue => {
    const context = useContext(I18nBridgeContext);
    return context;
};

/**
 * Hook to get locales from the bridged provider
 */
export const useBridgedLocalesLight = () => {
    const { i18nProvider } = useI18nBridgeLight();

    const locales = useMemo(() => {
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
    const { i18nProvider, setLocale } = useI18nBridgeLight();

    const changeLocale = useCallback(async (locale: string) => {
        if (i18nProvider?.changeLocale) {
            await i18nProvider.changeLocale(locale);
            setLocale(locale);
        }
    }, [i18nProvider, setLocale]);

    return changeLocale;
};

/**
 * Hook to get current locale from the bridged provider
 */
export const useBridgedLocaleLight = (): string => {
    const { locale } = useI18nBridgeLight();
    return locale;
};

/**
 * Hook to translate using the bridged provider
 */
export const useTranslateLight = () => {
    const { i18nProvider } = useI18nBridgeLight();

    const translate = useCallback((key: string, options?: Record<string, any>): string => {
        if (i18nProvider?.translate) {
            return i18nProvider.translate(key, options);
        }
        return key;
    }, [i18nProvider]);

    return translate;
};

export { I18nBridgeContext };
export default I18nBridgeProviderLight;
