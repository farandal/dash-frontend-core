/**
 * KitchnTabsPrivateApp
 * 
 * Private (authenticated) app for KitchnTabs.
 * Uses kt-* packages for all domain-specific functionality.
 */
import React, { useMemo, useCallback, useEffect, Suspense, useState, PropsWithChildren } from 'react';
import { BrowserRouter, HashRouter, Routes, Route } from 'react-router-dom';
import { QueryClient } from '@tanstack/react-query';
import polyglotI18nProvider from 'ra-i18n-polyglot';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';


// Import translations
import customEnglish from '../i18n/en';
import customSpanish from '../i18n/es';

// Import dash-admin translations statically
import { en as dashAdminEn, es as dashAdminEs } from 'dash-admin';

// Import essential admin components
import { NotFound } from 'dash-components';
import { dashStorage } from 'dash-utils';
import { DASHAdminSystemConstants, getEnv } from 'dash-constants';
import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';
import { useDashResourceManifest, isResourceManifest, isResourceArray, ResourceManifest } from 'dash-app-common/src/components/DashResourceLoader';
import { useSelector } from 'react-redux';

// Import from local dash-extensions
import DASHDataProvider from '../dash-extensions/config/DASHDataProvider';
import DASHAuthProvider from '../dash-extensions/config/DASHAuthProvider';
import { createSharedRoutes as DASHPrivateSharedRoutes } from '../dash-extensions/config/DASHPrivateSharedRoutes';
import DASHWSMessagesManager from '../dash-extensions/managers/DASHWSMessagesManager';
import GlobalSmallLoader from '../dash-extensions/components/GlobalSmallLoader';
import DASHLayoutSettings from '../dash-extensions/config/DASHLayoutSettings';

// Import from kt-pages
import DASHLightWeightLogin from 'kt-pages/src/dash-pages/DASHLightWeightLogin';

// Lazy load heavy admin components
const DASHAdmin = React.lazy(() => import('dash-admin').then(module => ({ default: module.DASHAdmin })));
const AnimatedRoutesWrapper = React.lazy(() => import('dash-admin').then(module => ({ default: module.AnimatedRoutesWrapper })));
const RoutingWrapper = React.lazy(() => import('dash-admin').then(module => ({ default: module.RoutingWrapper })));
const DASHAppLayout = React.lazy(() => import('dash-admin').then(module => ({ default: module.DASHAppLayout })));
const DASHAppProviders = React.lazy(() => import('dash-admin').then(module => ({ default: module.DASHAppProviders })));

interface KitchnTabsPrivateAppProps extends PropsWithChildren {
    appPath?: string;
    customResources?: IDashAutoAdminResourceConfig[] | ResourceManifest;
    useOwnRouter?: boolean;
    GlobalHook?: React.ComponentType<any>;
    AdminHook?: React.ComponentType<any>;
    customDataProvider?: any;
    customAuthProvider?: any;
    customPublicRoutes?: any;
    customPrivateRoutes?: any;
}

// Custom notification component
const CustomReactAdminNotification = (props: any) => {
    return <div {...props} />;
};

// Create persister for localStorage
export const localStoragePersister = createAsyncStoragePersister({
    storage: window.localStorage,
    key: 'KITCHNTABS_QUERY_CACHE', // Unique key for your app
    serialize: (data) => JSON.stringify(data),
    deserialize: (data) => JSON.parse(data),
});


const KitchnTabsPrivateApp: React.FC<KitchnTabsPrivateAppProps> = ({
    appPath = null,
    customResources = null,
    useOwnRouter = true,
    GlobalHook = () => <></>,
    AdminHook = (props) => props.children,
    customDataProvider,
    customAuthProvider,
    customPublicRoutes = null,
    customPrivateRoutes = null,
    children
}) => {

    const DEBUG = false;
    const envVars = useMemo(() => ({
        APP_VERSION: getEnv('APP_VERSION') || '1.0.0',
        BUILD_TIME: getEnv('BUILD_TIME') || new Date().toISOString(),
        IS_ELECTRON: JSON.parse(getEnv('IS_ELECTRON') || 'false'),
        PLATFORM: getEnv('PLATFORM') || "unknown",
        PLATFORM_TYPE: getEnv('PLATFORM_TYPE') || "desktop",
        IS_ANDROID: JSON.parse(getEnv('IS_ANDROID') || 'false'),
        IS_IOS: JSON.parse(getEnv('IS_IOS') || 'false'),
        IS_CAPACITOR: JSON.parse(getEnv('IS_CAPACITOR') || 'false'),
        IS_MOBILE: JSON.parse(getEnv('IS_MOBILE') || 'false'),
    }), []);

    console.log('KitchnTabsPrivateApp: Environment Variables:', envVars);

    // Create React Query client
    const customQueryClient = useMemo(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 5, // 2 hours - data is fresh for 2 hours
                gcTime: 1000 * 5, // 2 hours - keep in cache for 2 hours
                retry: 1,
                refetchOnWindowFocus: false,
                refetchOnMount: false, // Don't refetch immediately if we have cached data
            },
        },
    }), []);

    // Add custom defaults for specific endpoints (query keys)
    useEffect(() => {
        // Cache "products" for 24 hours (longer cache for less-changing data)
        /*customQueryClient.setQueryDefaults(['products'], {
            staleTime: 1000 * 60 * 60 * 24, // 24 hours
            gcTime: 1000 * 60 * 60 * 24,    // Keep in cache for 24 hours
        });

        // Cache "users" for 1 hour (shorter for frequently-changing data)
        customQueryClient.setQueryDefaults(['users'], {
            staleTime: 1000 * 60 * 60 * 1, // 1 hour
            gcTime: 1000 * 60 * 60 * 1,    // Keep in cache for 1 hour
        });*/

        // Cache "ecommerce/product" for 24 hours
        customQueryClient.setQueryDefaults(['ecommerce/product'], {
            staleTime: 1000 * 60 * 60 * 4, // 24 hours
            gcTime: 1000 * 60 * 60 * 4,    // Keep in cache for 24 hours
        });

        // Cache "ecommerce/category" for 24 hours
        customQueryClient.setQueryDefaults(['ecommerce/category'], {
            staleTime: 1000 * 60 * 60 * 24, // 24 hours
            gcTime: 1000 * 60 * 60 * 24,    // Keep in cache for 24 hours
        });

        // Add more as needed for other endpoints/resources
    }, [customQueryClient]);

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

    // Create i18n provider with lazy loaded translations
    const [translations, setTranslations] = React.useState<any>(null);
    const [i18nProvider, setI18nProvider] = React.useState<any>(null);

    const common = useSelector((state: any) => state.common);
    const settings = useSelector((state: any) => state.settings);

    const [routePath, setRoutePath] = useState<string>('');

    // Determine which providers to use
    const dataProvider = useMemo(() => {
        return customDataProvider || DASHDataProvider;
    }, [customDataProvider]);

    const authProvider = useMemo(() => {
        return customAuthProvider || DASHAuthProvider;
    }, [customAuthProvider]);

    // Calculate route path
    useEffect(() => {
        const calculateRoutePath = () => {
            const path = appPath || (common?.appPath || DASHAdminSystemConstants.system.URL_PREFIX);
            const cleanPath = path.replace(/\/\*$/, '');
            // @deprecated - removed currentAppPath storage that caused path duplication
            // dashStorage.setItem('currentAppPath', cleanPath);
            DEBUG && console.log('ROUTE-BASE-PATH:', cleanPath);
            return path;
        };

        const calculatedPath = calculateRoutePath();
        setRoutePath(calculatedPath);
    }, [useOwnRouter, appPath, common?.appPath]);

    useEffect(() => {
        const loadTranslations = () => {
            try {
                console.log('🌍 Loading translations...');
                console.log('🌍 customEnglish keys:', Object.keys(customEnglish));
                console.log('🌍 customSpanish keys:', Object.keys(customSpanish));

                // Use static imports for dash-admin translations
                console.log('🌍 dashAdminEn type:', typeof dashAdminEn, 'keys:', dashAdminEn ? Object.keys(dashAdminEn) : 'null');
                console.log('🌍 dashAdminEs type:', typeof dashAdminEs, 'keys:', dashAdminEs ? Object.keys(dashAdminEs) : 'null');

                const translationsData = {
                    en: {
                        ...dashAdminEn,
                        ...customEnglish,
                        resource: {
                            ...(dashAdminEn?.resource || {}),
                            ...(customEnglish?.resource || {}),
                        },
                    },
                    es: {
                        ...dashAdminEs,
                        ...customSpanish,
                        resource: {
                            ...(dashAdminEs?.resource || {}),
                            ...(customSpanish?.resource || {}),
                        },
                    },
                };

                console.log('🌍 Final translationsData.en keys count:', Object.keys(translationsData.en).length);
                console.log('🌍 Final translationsData.es keys count:', Object.keys(translationsData.es).length);
                // Check nested path properly (not flat key lookup)
                console.log('🌍 Check nested path in dashAdminEn:', {
                    hasResource: !!dashAdminEn?.resource,
                    hasSystem: !!dashAdminEn?.resource?.system,
                    hasTenants: !!dashAdminEn?.resource?.system?.tenants,
                    tenantsLabel: dashAdminEn?.resource?.system?.tenants?.label,
                });
                console.log('🌍 Check nested path in translationsData.en:', {
                    hasResource: !!translationsData.en?.resource,
                    hasSystem: !!translationsData.en?.resource?.system,
                    hasTenants: !!translationsData.en?.resource?.system?.tenants,
                    tenantsLabel: translationsData.en?.resource?.system?.tenants?.label,
                });
                console.log('🌍 Full resource object in dashAdminEn:', JSON.stringify(dashAdminEn?.resource, null, 2));

                setTranslations(translationsData);

                const availableLocales = settings?.availableLocales?.map(({ locale, name }) => ({ locale, name })) || [
                    { locale: 'en', name: 'English' },
                    { locale: 'es', name: 'Español' }
                ];

                DEBUG && console.log('🌍 KitchnTabsPrivateApp: Creating i18nProvider with availableLocales:', JSON.stringify(availableLocales, null, 2));

                // Locale priority:
                // 1. User's explicitly selected locale (persisted in localStorage)
                // 2. Tenant's configured primary language code (from settings.primary_language_code or settings.primary_language)
                // 3. Default to 'en'
                const persistedLocale = localStorage.getItem('dash-user-locale');

                // Get tenant's language code - could be from primary_language_code or primary_language (string)
                const tenantLanguageCode = typeof settings?.primary_language_code === 'string'
                    ? settings.primary_language_code
                    : (typeof settings?.primary_language === 'string'
                        ? settings.primary_language
                        : null);

                // If user has explicitly chosen a locale, use that; otherwise use tenant's language
                const initialLocale = persistedLocale || tenantLanguageCode || settings?.locale || 'en';

                DEBUG && console.log('🌍 KitchnTabsPrivateApp: Persisted locale:', persistedLocale);
                DEBUG && console.log('🌍 KitchnTabsPrivateApp: Tenant language code:', tenantLanguageCode);
                DEBUG && console.log('🌍 KitchnTabsPrivateApp: Initial locale:', initialLocale);
                DEBUG && console.log('🌍 KitchnTabsPrivateApp: translationsData keys:', Object.keys(translationsData));
                DEBUG && console.log('🌍 KitchnTabsPrivateApp: EN messages count:', Object.keys(translationsData.en || {}).length);
                DEBUG && console.log('🌍 KitchnTabsPrivateApp: ES messages count:', Object.keys(translationsData.es || {}).length);

                // Filter availableLocales to only include locales that have translations
                const localesWithTranslations = availableLocales.filter(
                    ({ locale }) => translationsData[locale] && Object.keys(translationsData[locale]).length > 0
                );

                DEBUG && console.log('🌍 KitchnTabsPrivateApp: Locales with translations:', JSON.stringify(localesWithTranslations, null, 2));

                // ra-i18n-polyglot signature: (getMessages, initialLocale, availableLocales, polyglotOptions)
                // 3rd param = availableLocales (array), 4th param = polyglotOptions (object)
                DEBUG && console.log('🌍 Creating provider with correct parameter order...');
                const provider = polyglotI18nProvider(
                    (locale) => translationsData[locale] || translationsData.en,
                    initialLocale,  // Use persisted locale or fallback
                    localesWithTranslations,  // 3rd param: availableLocales array
                    { allowMissing: true }    // 4th param: polyglotOptions
                );

                DEBUG && console.log('🌍 KitchnTabsPrivateApp: i18nProvider created:', provider);
                DEBUG && console.log('🌍 KitchnTabsPrivateApp: i18nProvider.getLocales result:', JSON.stringify(provider.getLocales ? provider.getLocales() : 'NO METHOD', null, 2));

                setI18nProvider(provider);
            } catch (error) {
                DEBUG && console.error('Failed to load translations:', error);
            }
        };

        loadTranslations();
    }, [settings]);

    // Load auto admin components
    const [dashAutoAdminComponents, setDashAutoAdminComponents] = React.useState<any>(null);

    useEffect(() => {
        const loadAutoAdminComponents = async () => {
            try {

                const [
                    UberStoreAvailability,
                    BasicTokenGeneratorField,
                    JsonComp,
                    JsonColorSelectorComp,
                    JsonCssVarValuesComp,
                    NotificationPreferencesComp
                ] = await Promise.all([
                    import('../components/ecommerce/uber/UberStoreAvailability'),
                    import('../components/ecommerce/uber/BasicTokenGeneratorField'),
                    import('dash-components').then(module => ({ default: module.Json })),
                    import('dash-components').then(module => ({ default: module.JsonColorSelectorEnhanced })),
                    import('dash-components').then(module => ({ default: module.JsonCssVarValues })),
                    import('dash-components').then(module => ({ default: module.NotificationPreferences }))
                ]);

                setDashAutoAdminComponents({
                    "UberStoreAvailability": UberStoreAvailability.default,
                    "BasicTokenGeneratorField": BasicTokenGeneratorField.default,
                    "Json": JsonComp.default,
                    "JsonColorSelector": JsonColorSelectorComp.default,
                    "JsonCssVarValues": JsonCssVarValuesComp.default,
                    "NotificationPreferences": NotificationPreferencesComp.default
                });

            } catch (error) {
                console.error('Failed to load auto admin components:', error);
                setDashAutoAdminComponents({});
            }
        };

        loadAutoAdminComponents();
    }, []);



    // Domain App Layout wrapper
    const DomainAppLayout = useCallback((props: any) => {
        const { themeComponent, children: c } = props;

        return (
            <Suspense fallback={<GlobalSmallLoader message="Loading layout..." />}>
                <DASHAppLayout themeComponent={themeComponent}>
                    <Suspense fallback={<GlobalSmallLoader message="Loading content..." />}>
                        {c}
                    </Suspense>
                </DASHAppLayout>
            </Suspense>
        );
    }, []);

    // Minimal layout for react-admin
    const MinimalLayout: React.FC<any> = ({ children: cm }) => cm;

    // Router component
    const RouterComponent = useCallback(({ children: cr }: { children: React.ReactNode }) => {
        return (
            envVars.PLATFORM_TYPE === "desktop" || envVars.IS_ELECTRON ? (
                <HashRouter basename={""}>
                    {cr}
                </HashRouter>
            ) : (
                <BrowserRouter basename={routePath}>
                    {cr}
                </BrowserRouter>
            )
        );
    }, [envVars.PLATFORM_TYPE, envVars.IS_ELECTRON, routePath]);


    // Create shared routes
    const customRoutes = customPublicRoutes ? customPublicRoutes() : DASHPrivateSharedRoutes();
    const customAuthRoutes = customPrivateRoutes ? customPrivateRoutes() : DASHPrivateSharedRoutes();

    // Resolve resources
    const manifestToLoad = isResourceManifest(customResources) ? customResources : null;
    const { resources: manifestResources, loading: resourcesLoading } = useDashResourceManifest(manifestToLoad as ResourceManifest);

    const resolvedResources: IDashAutoAdminResourceConfig[] = isResourceArray(customResources)
        ? customResources
        : (manifestResources || []);

    // Show loading while essential components are loading
    if (!translations || !i18nProvider || !dashAutoAdminComponents || !routePath) {
        return <GlobalSmallLoader message="Loading admin application..." />;
    }

    if (isResourceManifest(customResources) && resourcesLoading) {
        return <GlobalSmallLoader message="Loading resources..." />;
    }

    DEBUG && console.log('KitchnTabsPrivateApp Debug:', {
        useOwnRouter,
        routePath,
        appPath,
        windowPathname: window.location.pathname,
        resourceCount: resolvedResources.length,
    });

    return (
        <Suspense fallback={<GlobalSmallLoader message="Loading admin providers..." />}>
            <DASHAppProviders
                wsMessagesManager={DASHWSMessagesManager}
                extendedThemeOptions={extendedThemeOptions}
                dashAutoAdminComponents={dashAutoAdminComponents}
                queryClient={customQueryClient}
                queryPersister={localStoragePersister}
            >
                <GlobalHook />

                {useOwnRouter ? (
                    <Suspense fallback={<GlobalSmallLoader message="Loading routing..." />}>
                        <RoutingWrapper
                            BrowserRouterComponent={RouterComponent}
                            Wrapper={AnimatedRoutesWrapper}
                            LayoutComponent={DomainAppLayout}
                        >
                            <Route
                                path={routePath + "/*"}
                                element={
                                    <Suspense fallback={<GlobalSmallLoader message="Loading admin interface..." />}>
                                        {children}
                                        <DASHAdmin
                                            basePath={routePath}
                                            customDataProvider={dataProvider}
                                            customAuthProvider={authProvider}
                                            customQueryClient={customQueryClient}
                                            customResources={resolvedResources}
                                            useCoreResources={false}
                                            customLayout={MinimalLayout}
                                            customErrorPage={NotFound}
                                            customI18nProvider={i18nProvider}
                                            customNotification={CustomReactAdminNotification}
                                            customAuthRoutes={customAuthRoutes}
                                            customRoutes={customRoutes}
                                            customLoginPage={DASHLightWeightLogin}
                                            AdminHook={AdminHook}
                                        />
                                    </Suspense>
                                }
                            />
                        </RoutingWrapper>
                    </Suspense>
                ) : (
                    <Suspense fallback={<GlobalSmallLoader message="Loading layout..." />}>
                        <DomainAppLayout>
                            <Suspense fallback={<GlobalSmallLoader message="Loading admin interface..." />}>
                                {children}
                                <DASHAdmin
                                    basePath={routePath}
                                    customDataProvider={dataProvider}
                                    customAuthProvider={authProvider}
                                    customQueryClient={customQueryClient}
                                    customResources={resolvedResources}
                                    useCoreResources={false}
                                    customLayout={MinimalLayout}
                                    customErrorPage={NotFound}
                                    customI18nProvider={i18nProvider}
                                    customNotification={CustomReactAdminNotification}
                                    customAuthRoutes={customAuthRoutes}
                                    customRoutes={customRoutes}
                                    customLoginPage={DASHLightWeightLogin}
                                />
                            </Suspense>
                        </DomainAppLayout>
                    </Suspense>
                )}
            </DASHAppProviders>
        </Suspense>
    );
};

export default KitchnTabsPrivateApp;
