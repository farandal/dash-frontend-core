/**
 * SelfServiceContext.tsx
 * 
 * Session and Auth management context for self-service kiosk.
 * Acts as the base provider for Tenant and Session identity.
 */
import React, { createContext, useContext, useState, useMemo, useEffect, PropsWithChildren } from 'react';
import { dashStorage } from 'dash-utils';
import { useSelfServiceEcho } from './SelfServiceEchoContext';

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * Context value interface
 */
interface SelfServiceContextValue {
    // Session
    sessionId: string | null;
    tenantSlug: string | null;
    tenantData: any | null;
    isLoading: boolean;
    error: string | null;
    
    // Legacy / Stubbed Props for potential backward compatibility
    // These should be keyed as optional in the interface if we want to be strict,
    // but for now we won't expose them in the interface to force compilation errors if used.
    // If usage exists, we should have fixed it by now.
}

const SelfServiceContext = createContext<SelfServiceContextValue | null>(null);

// ============================================================================
// HOOK
// ============================================================================

export const useSelfService = () => {
    const context = useContext(SelfServiceContext);
    if (!context) {
        throw new Error('useSelfService must be used within a SelfServiceProvider');
    }
    return context;
};

// ============================================================================
// PROVIDER
// ============================================================================

interface SelfServiceProviderProps extends PropsWithChildren {
    // No specific props needed for this simplified context
}

export const SelfServiceProvider: React.FC<SelfServiceProviderProps> = ({
    children,
}) => {
    // Auth state from Echo
    const { sessionHash } = useSelfServiceEcho();
    
    // Local state (optional, if we want to sync with Echo or Store)
    const [tenantData, setTenantData] = useState<any | null>(() => {
        const stored = dashStorage.getItem('selfservice-tenant-data');
        return stored ? JSON.parse(stored) : null;
    });
    const [isLoading, setIsLoading] = useState(false); // Initial loading state, can be adjusted if async ops are added
    const [error, setError] = useState<string | null>(null);

    // Get tenant slug
    const tenantSlug = useMemo(() => dashStorage.getItem('selfservice-tenant-slug'), []);
   
    // We can rely on SelfServiceEchoContext for sessionHash, but for compatibility we expose it as sessionId
    const sessionId = sessionHash;

    // ========================================================================
    // SYNC SESSION DATA FROM STORAGE (handles timing with SelfServiceClientWrapper)
    // ========================================================================
    
    useEffect(() => {
        // Re-read tenantData from storage after mount in case wrapper set values after initial render
        const storedTenantData = dashStorage.getItem('selfservice-tenant-data');
        
        if (storedTenantData && !tenantData) {
            try {
                const parsed = JSON.parse(storedTenantData);
                console.log('🔄 SelfServiceContext: Syncing tenantData from storage');
                setTenantData(parsed);
            } catch (e) {
                console.error('Failed to parse tenant data from storage');
            }
        }
        // If sessionId or tenantSlug are needed to be synced from storage,
        // they would be handled here, but currently they are derived from Echo/useMemo.
        setIsLoading(false); // Mark loading as false after initial sync attempt
    }, [tenantData]); // Run once after mount, or when tenantData changes if we want to re-sync

    // ========================================================================
    // CONTEXT VALUE
    // ========================================================================
    
    const value: SelfServiceContextValue = useMemo(() => ({
        sessionId,
        tenantSlug,
        tenantData,
        isLoading,
        error,
    }), [sessionId, tenantSlug, tenantData, isLoading, error]);

    return (
        <SelfServiceContext.Provider value={value}>
            {children}
        </SelfServiceContext.Provider>
    );
};

export default SelfServiceContext;
