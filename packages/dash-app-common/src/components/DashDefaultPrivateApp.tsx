/**
 * DefaultPrivateApp
 * 
 * A minimal authenticated admin application.
 * Used as the default fallback when no custom privateAppImport is provided.
 * 
 * This provides a basic admin shell with:
 * - DASHAdmin with default configuration
 * - Default data and auth providers from dash-admin
 * - Minimal routing setup
 * 
 * NOTE: This is a minimal fallback. For full functionality, apps should
 * provide their own privateAppImport with proper provider configuration.
 */
import React, { Suspense, useMemo, PropsWithChildren, ReactElement } from 'react';
import { Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { DashRouterComponent, MinimalLayout, RouterComponent } from 'dash-utils';
import { NotFound } from 'dash-components';
import AppLoadingFallback from 'dash-components/src/components/theme/AppLoadingFallback';


// Import default providers from dash-admin (these are already configured)
import authProvider from 'dash-admin/src/providers/authProvider';
import dataProvider from 'dash-admin/src/providers/dataProvider';
import DefaultPrivateResources from './DashDefaultPrivateResources';
import DomainAppLayout from 'dash-admin/src/default-theme/DomainAppLayout';



// Lazy load DASHAdmin components
const DASHAdmin = React.lazy(() => import('dash-admin').then(module => ({ default: module.DASHAdmin })));
const DASHAppProviders = React.lazy(() => import('dash-admin').then(module => ({ default: module.DASHAppProviders })));
const RoutingWrapper = React.lazy(() => import('dash-admin').then(module => ({ default: module.RoutingWrapper })));
const AnimatedRoutesWrapper = React.lazy(() => import('dash-admin').then(module => ({ default: module.AnimatedRoutesWrapper })));

// Default loading fallback
const LoadingFallback: React.FC<{ message?: string }> = ({ message }) => (
    <AppLoadingFallback message={message || "Loading..."} />
);

// ============================================================================
// TYPES
// ============================================================================

/**
 * Props for DefaultPrivateApp
 * 
 * Includes all DASHAdmin props plus app-specific configuration.
 * Props are passed through to DASHAdmin with sensible defaults.
 */
interface DefaultPrivateAppProps extends PropsWithChildren {
    // ========================================================================
    // APP CONFIGURATION PROPS
    // ========================================================================
    /**
     * Base path for the admin app
     */
    appPath?: string;
    
    /**
     * Custom resources configuration
     */
    resources?: any[];
    
    /**
     * Whether to use the internal router
     */
    useOwnRouter?: boolean;
    
    /**
     * Global hook component (for global side effects)
     */
    GlobalHook?: React.ComponentType<any>;

    // ========================================================================
    // DASHADMIN PROPS (passed through to DASHAdmin)
    // ========================================================================
    /**
     * Admin hook component (wraps admin content)
     */
    AdminHook?: React.ComponentType<any>;
    
    /**
     * Custom layout component for the admin
     */
    customLayout?: React.FC<any>;
    
    /**
     * Custom login page component
     */
    customLoginPage?: React.FC<any>;
    
    /**
     * Custom notification component
     */
    customNotification?: () => React.JSX.Element;
    
    /**
     * Custom error/catch-all page component
     */
    customErrorPage?: any;
    
    /**
     * Custom data provider
     */
    customDataProvider?: any;
    
    /**
     * Custom auth provider
     */
    customAuthProvider?: any;
    
    /**
     * Custom i18n provider
     */
    customI18nProvider?: any;
    
    /**
     * Whether to use core resources (default: false)
     */
    useCoreResources?: boolean;
    
    /**
     * Custom profile page component (false to disable)
     */
    customProfilePage?: React.JSX.Element | false;
    
    /**
     * Custom recover password page (false to disable)
     */
    customRecoverPassword?: React.JSX.Element | false;
    
    /**
     * Custom change password page (false to disable)
     */
    customChangePassword?: React.JSX.Element | false;
    
    /**
     * Custom verify account page (false to disable)
     */
    customVerifyAccount?: React.JSX.Element | false;
    
    /**
     * Custom theme configuration
     */
    customThemeConfig?: any;
    
    /**
     * Custom authenticated routes (passed directly to DASHAdmin)
     */
    customAuthRoutes?: React.ReactElement[];
    
    /**
     * Custom public routes (passed directly to DASHAdmin)
     */
    customRoutes?: React.ReactElement[];
    
    /**
     * Custom public routes (returns array, legacy support)
     */
    customPublicRoutes?: () => ReactElement[];
    
    /**
     * Custom private routes (returns array, legacy support)
     */
    customPrivateRoutes?: () => ReactElement[];
    
    /**
     * Custom React Query client
     */
    customQueryClient?: any;
    
    /**
     * Custom dictionary for translations
     */
    customDict?: { [x: string]: string };
    
    /**
     * Custom string replacements
     */
    customReplacements?: { [x: string]: string };
    
    /**
     * Custom history object
     */
    history?: any;
    
    /**
     * Initial app constants
     */
    initialAppConstants?: any;
    
    /**
     * WebSocket messages manager for real-time notifications
     */
    wsMessagesManager?: any;
}

// ============================================================================
// COMPONENT
// ============================================================================
const DefaultPrivateApp: React.FC<DefaultPrivateAppProps> = ({
    // App configuration props
    appPath = null,
    resources = DefaultPrivateResources,
    useOwnRouter = true,
    GlobalHook = () => <></>,
    
    // DASHAdmin props with defaults
    AdminHook = (props) => props.children,
    customLayout = DomainAppLayout,
    customLoginPage,
    customNotification,
    customErrorPage = NotFound,
    customDataProvider = null,
    customAuthProvider = null,
    customI18nProvider,
    useCoreResources = false,
    customProfilePage,
    customRecoverPassword,
    customChangePassword,
    customVerifyAccount,
    customThemeConfig,
    customAuthRoutes,
    customRoutes,
    customPublicRoutes = null,
    customPrivateRoutes = null,
    customQueryClient,
    customDict,
    customReplacements,
    history,
    initialAppConstants,
    wsMessagesManager,
    
    children
}) => {
    // Get common state for route path calculation
    const common = useSelector((state: any) => state?.common || {});
    
    // Calculate route path
    const routePath = useMemo(() => {
        return appPath || common?.appPath || '/';
    }, [appPath, common?.appPath]);

    // Create router component wrapper
    const RouterWrapper = useMemo(() => {
        const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children: c }) => (
            <DashRouterComponent basename={routePath}>
                {c}
            </DashRouterComponent>
        );
        return Wrapper;
    }, [routePath]);

    // Routes configuration - support both direct arrays and function-based routes
    // Direct arrays (customRoutes, customAuthRoutes) take precedence over function-based
    const resolvedCustomRoutes = useMemo(
        () => customRoutes || (customPublicRoutes ? customPublicRoutes() : []),
        [customRoutes, customPublicRoutes]
    );
    
    const resolvedAuthRoutes = useMemo(
        () => customAuthRoutes || (customPrivateRoutes ? customPrivateRoutes() : []),
        [customAuthRoutes, customPrivateRoutes]
    );

    // State for lazy-loaded providers - use defaults from dash-admin
    const resolvedDataProvider = customDataProvider || dataProvider;
    const resolvedAuthProvider = customAuthProvider || authProvider;

    return (
        <Suspense fallback={<LoadingFallback message="Loading admin providers..." />}>
            <DASHAppProviders wsMessagesManager={wsMessagesManager}>
                <GlobalHook />
                
                {useOwnRouter ? (
                    <Suspense fallback={<LoadingFallback message="Loading routing..." />}>
                        <RoutingWrapper
                            BrowserRouterComponent={RouterWrapper}
                            Wrapper={AnimatedRoutesWrapper}
                            LayoutComponent={MinimalLayout}
                        >
                            <Route
                                path={routePath + "/*"}
                                element={
                                    <Suspense fallback={<LoadingFallback message="Loading admin..." />}>
                                        {children}
                                        <DASHAdmin
                                            basePath={routePath}
                                            customDataProvider={resolvedDataProvider}
                                            customAuthProvider={resolvedAuthProvider}
                                            customResources={resources}
                                            useCoreResources={useCoreResources}
                                            customLayout={customLayout}
                                            customLoginPage={customLoginPage}
                                            customNotification={customNotification}
                                            customErrorPage={customErrorPage}
                                            customI18nProvider={customI18nProvider}
                                            customProfilePage={customProfilePage}
                                            customRecoverPassword={customRecoverPassword}
                                            customChangePassword={customChangePassword}
                                            customVerifyAccount={customVerifyAccount}
                                            customThemeConfig={customThemeConfig}
                                            customAuthRoutes={resolvedAuthRoutes}
                                            customRoutes={resolvedCustomRoutes}
                                            customQueryClient={customQueryClient}
                                            customDict={customDict}
                                            customReplacements={customReplacements}
                                            history={history}
                                            initialAppConstants={initialAppConstants}
                                            AdminHook={AdminHook}
                                        />
                                    </Suspense>
                                }
                            />
                        </RoutingWrapper>
                    </Suspense>
                ) : (
                    <Suspense fallback={<LoadingFallback message="Loading layout..." />}>
                        <MinimalLayout>
                            <Suspense fallback={<LoadingFallback message="Loading admin..." />}>
                                {children}
                                <DASHAdmin
                                    basePath={routePath}
                                    customDataProvider={resolvedDataProvider}
                                    customAuthProvider={resolvedAuthProvider}
                                    customResources={resources}
                                    useCoreResources={useCoreResources}
                                    customLayout={customLayout}
                                    customLoginPage={customLoginPage}
                                    customNotification={customNotification}
                                    customErrorPage={customErrorPage}
                                    customI18nProvider={customI18nProvider}
                                    customProfilePage={customProfilePage}
                                    customRecoverPassword={customRecoverPassword}
                                    customChangePassword={customChangePassword}
                                    customVerifyAccount={customVerifyAccount}
                                    customThemeConfig={customThemeConfig}
                                    customAuthRoutes={resolvedAuthRoutes}
                                    customRoutes={resolvedCustomRoutes}
                                    customQueryClient={customQueryClient}
                                    customDict={customDict}
                                    customReplacements={customReplacements}
                                    history={history}
                                    initialAppConstants={initialAppConstants}
                                    AdminHook={AdminHook}
                                />
                            </Suspense>
                        </MinimalLayout>
                    </Suspense>
                )}
            </DASHAppProviders>
        </Suspense>
    );
};

export default DefaultPrivateApp;
