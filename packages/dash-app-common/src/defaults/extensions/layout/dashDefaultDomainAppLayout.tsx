/**
 * Dash Default Domain App Layout Extension
 * 
 * Dash default app layout wrapper that includes window controls for Electron.
 */
import React, { useCallback, Suspense } from 'react';
import DASHAppLayout from 'dash-admin/src/default-theme/DomainAppLayout';
import { IDomainAppLayout } from 'dash-admin/src/default-theme/DomainAppLayout';
import { getEnv } from 'dash-constants';

// Lazy load components
const IPCMessageBrokerProvider = React.lazy(() => 
    import('dash-utils').then(m => ({ default: m.IPCMessageBrokerProvider }))
);

// Simple loading fallback
const DashDefaultLayoutLoadingFallback = () => (
    <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '200px' 
    }}>
        Loading...
    </div>
);

/**
 * Check if running in Electron
 */
const isElectron = (): boolean => {
    try {
        return JSON.parse(getEnv('IS_ELECTRON') || 'false');
    } catch {
        return false;
    }
};

/**
 * Create Dash Default Domain App Layout component (sync version)
 * Wraps the default DASHAppLayout
 */
export const createDashDefaultDomainAppLayout = () => {
    const DashDefaultDomainAppLayout = <U, A>(props: IDomainAppLayout<U, A>): React.JSX.Element => {
        const { ThemeComponent, children } = props;
        return (
            <DASHAppLayout ThemeComponent={ThemeComponent}>
                {children}
            </DASHAppLayout>
        );
    };
    
    return DashDefaultDomainAppLayout;
};

/**
 * Create Dash Default Domain App Layout with Electron IPC support
 * Wraps with IPCMessageBrokerProvider when in Electron
 */
export const createDashDefaultDomainAppLayoutWithIPC = () => {
    const DashDefaultDomainAppLayout = <U, A>(props: IDomainAppLayout<U, A>): React.JSX.Element => {
        const { ThemeComponent, children } = props;
        const inElectron = isElectron();

        const LayoutContent = inElectron ? (
            <Suspense fallback={<DashDefaultLayoutLoadingFallback />}>
                <IPCMessageBrokerProvider>
                    {children}
                </IPCMessageBrokerProvider>
            </Suspense>
        ) : (
            children
        );

        return (
            <DASHAppLayout ThemeComponent={ThemeComponent}>
                {LayoutContent}
            </DASHAppLayout>
        );
    };
    
    return DashDefaultDomainAppLayout;
};

/**
 * Hook to get memoized Dash Default DomainAppLayout
 */
export const useDashDefaultDomainAppLayout = () => {
    return useCallback(<U, A>(props: IDomainAppLayout<U, A>): React.JSX.Element => {
        const { ThemeComponent, children } = props;
        return (
            <DASHAppLayout ThemeComponent={ThemeComponent}>
                {children}
            </DASHAppLayout>
        );
    }, []);
};

/**
 * Hook to get memoized Dash Default DomainAppLayout with Electron IPC support
 */
export const useDashDefaultDomainAppLayoutWithIPC = () => {
    const inElectron = isElectron();
    
    return useCallback(<U, A>(props: IDomainAppLayout<U, A>): React.JSX.Element => {
        const { ThemeComponent, children } = props;

        const LayoutContent = inElectron ? (
            <Suspense fallback={<DashDefaultLayoutLoadingFallback />}>
                <IPCMessageBrokerProvider>
                    {children}
                </IPCMessageBrokerProvider>
            </Suspense>
        ) : (
            children
        );

        return (
            <DASHAppLayout ThemeComponent={ThemeComponent}>
                {LayoutContent}
            </DASHAppLayout>
        );
    }, [inElectron]);
};

export default createDashDefaultDomainAppLayout;
