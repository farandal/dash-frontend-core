/**
 * Lazy App Loader Utilities
 *
 * Provides utilities for creating lazy-loaded app components with
 * error handling and initialization delays.
 */
import React from 'react';

export interface LazyAppLoaderConfig {
    /**
     * Dynamic import function that returns the module with the app component
     * Example: () => import('./DASHAppLoader')
     */
    importFn: () => Promise<{ default: React.ComponentType<any> }>;

    /**
     * Delay in milliseconds before loading the component (default: 150ms)
     * This helps ensure all modules are properly initialized
     */
    initDelay?: number;

    /**
     * Custom fallback component to show if loading fails
     * If not provided, a default error message is shown
     */
    fallbackComponent?: React.ComponentType<any>;

    /**
     * Error handler callback
     */
    onError?: (error: Error) => void;
}

/**
 * Default fallback component shown when app loading fails
 */
export const DefaultLoadFailedComponent: React.FC<{ message?: string }> = ({
    message = 'Failed to load application'
}) => (
    <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(to bottom, var(--bodybg-primary), var(--bodybg-secondary))',
        color: '#ff4444',
        flexDirection: 'column',
        gap: '16px'
    }}>
        <div style={{ fontSize: '18px' }}>{message}</div>
        <button
            onClick={() => window.location.reload()}
            style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
            }}
        >
            Reload Page
        </button>
    </div>
);

/**
 * Create a lazy-loaded app component with error handling
 *
 * @param config - Configuration options for the lazy loader
 * @returns A React lazy component
 *
 * @example
 * ```tsx
 * const AppComponent = createLazyAppComponent({
 *     importFn: () => import('./DASHAppLoader'),
 *     initDelay: 150,
 *     onError: (error) => console.error('Failed to load app:', error)
 * });
 *
 * // Then use with Suspense:
 * <React.Suspense fallback={<InitialLoader />}>
 *     <AppComponent />
 * </React.Suspense>
 * ```
 */
export const createLazyAppComponent = (
    config: LazyAppLoaderConfig
): React.LazyExoticComponent<React.ComponentType<any>> => {
    const {
        importFn,
        initDelay = 150,
        fallbackComponent: FallbackComponent,
        onError
    } = config;

    return React.lazy(() => {
        return new Promise<{ default: React.ComponentType<any> }>((resolve) => {
            setTimeout(() => {
                importFn()
                    .then((module) => {
                        resolve({ default: module.default });
                    })
                    .catch((error: Error) => {
                        console.error('Failed to load app component:', error);
                        onError?.(error);

                        // Use custom fallback or default
                        const ErrorComponent: React.FC = FallbackComponent
                            ? () => React.createElement(FallbackComponent)
                            : () => React.createElement(DefaultLoadFailedComponent, {
                                message: `Failed to load: ${error.message}`
                            });

                        resolve({ default: ErrorComponent });
                    });
            }, initDelay);
        });
    });
};

/**
 * Simple version of createLazyAppComponent with minimal configuration
 *
 * @param importFn - Dynamic import function
 * @param initDelay - Optional delay in milliseconds (default: 150)
 * @returns A React lazy component
 *
 * @example
 * ```tsx
 * const AppComponent = createSimpleLazyApp(
 *     () => import('./DASHAppLoader')
 * );
 * ```
 */
export const createSimpleLazyApp = (
    importFn: () => Promise<{ default: React.ComponentType<any> }>,
    initDelay: number = 150
): React.LazyExoticComponent<React.ComponentType<any>> => {
    return createLazyAppComponent({ importFn, initDelay });
};

export default createLazyAppComponent;
