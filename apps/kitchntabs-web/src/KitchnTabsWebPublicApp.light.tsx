/**
 * KitchnTabsPublicApp (Light)
 * 
 * OPTIMIZED: Public (unauthenticated) app for KitchnTabs.
 * This version uses lightweight components that don't depend on react-admin,
 * reducing the initial bundle size significantly.
 */
import React, { useMemo, useCallback } from 'react';
import { Routes, BrowserRouter, HashRouter, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import { DASHAdminSystemConstants, getEnv } from 'dash-constants';

// Import from local dash-extensions - lightweight versions
import GlobalSmallLoader from './dash-extensions/components/GlobalSmallLoader';
import { dashPublicRoutes } from '@app/KitchnTabsWebPublicRoutes';
import ThemeComponent from './components/theme/ThemeComponent';

// OPTIMIZED: Use lightweight providers instead of dash-admin versions
import { I18nBridgeProviderLight, useI18nBridgeLight } from './dash-extensions/components/I18nBridgeProviderLight';
import { DashThemeProviderLight } from './dash-extensions/components/DashThemeProviderLight';

// Import translations
import customEnglish from './i18n/en';
import customSpanish from './i18n/es';

interface KitchnTabsPublicAppProps {}

// Simple I18n Provider Implementation for Light App
const createSimpleI18nProvider = (translations: any, initialLocale: string) => {
    let locale = initialLocale;
    
    // Helper to get nested value
    const getNestedValue = (obj: any, path: string) => {
        return path.split('.').reduce((prev, curr) => prev ? prev[curr] : null, obj);
    };

    // Simple interpolation for variables like %{name}
    const interpolate = (text: string, options: any) => {
        if (!options || !text) return text;
        return Object.keys(options).reduce((acc, key) => {
            return acc.replace(new RegExp(`%\\{${key}\\}`, 'g'), options[key]);
        }, text);
    };

    return {
        translate: (key: string, options?: any) => {
            const messages = translations[locale] || translations['en'];
            const text = getNestedValue(messages, key);
            
            // If text is found, interpolate; otherwise return key
            if (typeof text === 'string') {
                return interpolate(text, options);
            }
            return key;
        },
        changeLocale: (newLocale: string) => {
            if (translations[newLocale]) {
                locale = newLocale;
                return Promise.resolve();
            }
            return Promise.reject('Locale not found');
        },
        getLocale: () => locale,
        getLocales: () => [
            { locale: 'en', name: 'English' },
            { locale: 'es', name: 'Español' }
        ],
        getMessages: (l: string) => translations[l]
    };
};

const KitchnTabsPublicApp: React.FC<KitchnTabsPublicAppProps> = () => {
    // Memoize environment variables
    const envVars = useMemo(() => ({
        APP_VERSION: getEnv('APP_VERSION') || '1.0.0',
        BUILD_TIME: getEnv('BUILD_TIME') || new Date().toISOString(),
        IS_ELECTRON: JSON.parse(getEnv('IS_ELECTRON') || 'false'),
        PLATFORM: getEnv('PLATFORM') || "unknown",
        PLATFORM_TYPE: getEnv('PLATFORM_TYPE') || "desktop",
        LATEST_RELEASE_VERSION: getEnv('LATEST_RELEASE_VERSION') || "1.0.0",
    }), []);

    console.log('KitchnTabsPublicApp: Environment Variables:', envVars);

    const routePath = DASHAdminSystemConstants.system.URL_PREFIX || "/";
   
    const RouterComponent = useCallback(({ children }: { children: React.ReactNode }) => {
        return (
            envVars.IS_ELECTRON ? (
                <HashRouter basename={""}>
                    {children}
                </HashRouter>
            ) : (
                <BrowserRouter basename={routePath}>
                    {children}
                </BrowserRouter>
            )
        );
    }, [envVars.IS_ELECTRON, routePath]);

    // Memoize translations data
    const translationsData = useMemo(() => {
        return {
            en: {
                ...customEnglish
            },
            es: {
                ...customSpanish,
            },
        };
    }, []);

    // Create simple i18nProvider
    const i18nProvider = useMemo(() => {
        const initialLocale = localStorage.getItem('dash-user-locale') || 'es';
        return createSimpleI18nProvider(translationsData, initialLocale);
    }, [translationsData]);

    // Memoize theme options
    const extendedThemeOptions = useMemo(() => ({
        components: {
            MuiButton: {
                styleOverrides: {
                    root: {
                        transition: 'all 0.2s ease-in-out',
                    }
                }
            },
            MuiBox: {
                styleOverrides: {
                    root: {
                        contain: 'layout style',
                    }
                }
            }
        },
    }), []);

    // Bridge setter component - using light version
    const I18nBridgeSetter = ({ provider }: { provider: any }) => {
        const { setI18nProvider } = useI18nBridgeLight();
        React.useEffect(() => {
            if (provider) setI18nProvider(provider);
        }, [provider, setI18nProvider]);
        return null;
    };

    return (
        <RouterComponent>
            <I18nBridgeProviderLight>
                <I18nBridgeSetter provider={i18nProvider} />
                <DashThemeProviderLight extendedOptions={extendedThemeOptions}>
                    <Box className="kitchntabs-public-app">
                        <ThemeComponent>
                            <React.Suspense fallback={<GlobalSmallLoader />}>
                                <Routes>
                                    {/* Render shared routes */}
                                    {dashPublicRoutes()}
                                </Routes>
                            </React.Suspense>
                        </ThemeComponent>
                    </Box>
                </DashThemeProviderLight>
            </I18nBridgeProviderLight>
        </RouterComponent>
    );
};

export default KitchnTabsPublicApp;
