/**
 * DashRouterComponent
 *
 * A smart router component that automatically chooses between
 * HashRouter (for Electron/desktop) and BrowserRouter (for web).
 *
 * Environment detection is automatic when props are not provided.
 */
import React, { Suspense } from 'react';
import { BrowserRouter, HashRouter, Routes } from 'react-router-dom';
import { getEnv } from '../utils/envUtils';

/**
 * Props for DashRouterComponent
 */
export interface DashRouterComponentProps {
    /**
     * Direct children - used when publicRoutes is not provided
     * @deprecated Use publicRoutes prop instead for cleaner API
     */
    children?: React.ReactNode;
    /** Force a specific router type */
    forceType?: 'hash' | 'browser';
    /**
     * Base path for BrowserRouter
     * @default getEnv('BASE_PATH') || '/'
     */
    basename?: string;
    /**
     * Platform type from environment (optional - auto-detected from VITE_PLATFORM_TYPE)
     * @default getEnv('PLATFORM_TYPE')
     */
    platformType?: string;
    /**
     * Platform name from environment (optional - auto-detected from VITE_PLATFORM)
     * @default getEnv('PLATFORM')
     */
    platform?: string;
    /** Loading fallback component shown during lazy loading */
    loader?: React.ReactNode;
    /**
     * Public routes to render inside Routes component.
     * Can be a function that returns routes (recommended) or pre-created ReactNode.
     * Using a function ensures routes are created inside Router context.
     */
    publicRoutes?: React.ReactNode | (() => React.ReactNode);
    /** Optional className for the wrapper div */
    className?: string;
}

/** @deprecated Use DashRouterComponentProps instead */
export type RouterComponentProps = DashRouterComponentProps;

/**
 * Determine if HashRouter should be used based on environment
 */
export const shouldUseHashRouter = (platformType?: string, platform?: string): boolean => {
    return platformType === 'desktop' || platform === 'electron';
};

/**
 * Inner component that renders routes inside Router context
 * This ensures route components with hooks are created INSIDE the Router
 */
const RouterContent: React.FC<{
    publicRoutes?: React.ReactNode | (() => React.ReactNode);
    loader?: React.ReactNode;
    className: string;
    children?: React.ReactNode;
}> = ({ publicRoutes, loader, className, children }) => {
    if (!publicRoutes) {
        // Legacy: direct children
        return <>{children}</>;
    }

    // Resolve routes - call function if it's a function, otherwise use directly
    // This is called INSIDE the Router context, so useNavigate etc. will work
    let routes: React.ReactNode;
    if (typeof publicRoutes === 'function') {
        routes = (publicRoutes as () => React.ReactNode)();
    } else {
        routes = publicRoutes;
    }

    return (
        <div className={className}>
            <Suspense fallback={loader || <div>Loading...</div>}>
                <Routes>
                    {routes}
                </Routes>
            </Suspense>
        </div>
    );
};

/**
 * DashRouterComponent - Smart router that chooses the appropriate router type
 *
 * Automatically detects platform environment when props are not provided:
 * - platformType: from VITE_PLATFORM_TYPE env var
 * - platform: from VITE_PLATFORM env var
 * - basename: from VITE_BASE_PATH env var (defaults to '/')
 */
export const DashRouterComponent: React.FC<DashRouterComponentProps> = ({
    children,
    forceType,
    basename,
    platformType,
    platform,
    loader,
    publicRoutes,
    className = 'dash-public-app',
}) => {
    // Get environment values internally if not provided as props
    const effectivePlatformType = platformType ?? getEnv('PLATFORM_TYPE');
    const effectivePlatform = platform ?? getEnv('PLATFORM');
    const effectiveBasename = basename ?? getEnv('BASE_PATH') ?? '/';

    // Render content using RouterContent component (which runs inside Router context)
    const content = (
        <RouterContent
            publicRoutes={publicRoutes}
            loader={loader}
            className={className}
        >
            {children}
        </RouterContent>
    );

    // If forceType is specified, use that
    if (forceType === 'hash') {
        return <HashRouter basename="">{content}</HashRouter>;
    }

    if (forceType === 'browser') {
        return <BrowserRouter basename={effectiveBasename}>{content}</BrowserRouter>;
    }

    // Auto-detect based on platform
    if (shouldUseHashRouter(effectivePlatformType, effectivePlatform)) {
        return <HashRouter basename="">{content}</HashRouter>;
    }

    return <BrowserRouter basename={effectiveBasename}>{content}</BrowserRouter>;
};

/**
 * Create a DashRouterComponent with pre-configured environment settings
 */
export const createRouterComponent = (envVars: {
    PLATFORM_TYPE?: string;
    PLATFORM?: string;
}): React.FC<{ children: React.ReactNode }> => {
    const RouterWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
        <DashRouterComponent
            platformType={envVars.PLATFORM_TYPE}
            platform={envVars.PLATFORM}
        >
            {children}
        </DashRouterComponent>
    );

    return RouterWrapper;
};

/** @deprecated Use DashRouterComponent instead */
export const RouterComponent = DashRouterComponent;

export default DashRouterComponent;
