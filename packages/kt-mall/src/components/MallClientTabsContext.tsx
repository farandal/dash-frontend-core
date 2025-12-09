import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAxios } from 'dash-axios-hook';
import { dashStorage } from 'dash-utils';
import useLaravelEcho from 'dash-admin/src/contexts/com/useLaravelEcho';
import type { IDashAutoAdminResourceConfig } from 'dash-auto-admin';

// Notification data structure from API
export interface IMallNotification {
    id: number;
    mall_session_id: number;
    type: string;
    title: string;
    message: string;
    data: {
        event: string;
        child_order_id?: number;
        child_status?: string;
        parent_order_id?: number;
        parent_status?: string;
        master_tab_id?: number;
        tenant_tab_id?: number;
        tenant_tab_status?: string;
        tenant_id?: number;
        tenant_name?: string;
        status?: string;
        timestamp?: string;
        customer_info?: {
            name: string;
            table: string;
        };
        products?: Array<{
            id: number;
            product_id: number;
            product_name: string;
            quantity: number;
            status: string;
        }>;
        mall_session_hash?: string;
        formatted_customer_info?: string;
        priority?: string;
        type?: string;
    };
    tenant_id: number | null;
    tenant_name: string | null;
    status: string | null;
    is_read: boolean;
    reference_type: string | null;
    reference_id: string | null;
    created_at: string;
    updated_at: string;
}

// Tenant tab status extracted from notifications
export interface ITenantTabStatus {
    tenant_tab_id: number;
    tenant_id: number;
    tenant_name: string;
    status: string;
    timestamp: string;
    products: Array<{
        id: number;
        product_id: number;
        product_name: string;
        quantity: number;
        status: string;
    }>;
}

// Context value interface
export interface IMallClientTabsContextValue {
    sessionHash: string | null;
    notifications: IMallNotification[];
    tenantStatusesByTab: Record<number, ITenantTabStatus[]>; // Indexed by master_tab_id
    loading: boolean;
    error: string | null;
    unreadCount: number;
    totalCount: number;
    refreshNotifications: (tabId?: number) => Promise<void>;
    getTenantStatusesForTab: (masterTabId: number) => ITenantTabStatus[];
}

// Create context with default values
const MallClientTabsContext = createContext<IMallClientTabsContextValue>({
    sessionHash: null,
    notifications: [],
    tenantStatusesByTab: {},
    loading: false,
    error: null,
    unreadCount: 0,
    totalCount: 0,
    refreshNotifications: async () => {},
    getTenantStatusesForTab: () => [],
});

// Hook to use the context
export const useMallClientTabsContext = () => {
    const context = useContext(MallClientTabsContext);
    if (!context) {
        console.warn('useMallClientTabsContext must be used within MallClientTabsProvider');
    }
    return context;
};

// Context props
interface MallClientTabsProviderProps {
    children: React.ReactNode;
    mode?: 'list' | 'create' | 'edit' | 'show';
    resourceConfig?: IDashAutoAdminResourceConfig;
}

// Provider component
export const MallClientTabsProvider: React.FC<MallClientTabsProviderProps> = ({ 
    children, 
    mode,
    resourceConfig 
}) => {
    const [sessionHash, setSessionHash] = useState<string | null>(null);
    const [notifications, setNotifications] = useState<IMallNotification[]>([]);
    const [tenantStatusesByTab, setTenantStatusesByTab] = useState<Record<number, ITenantTabStatus[]>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    
    const axios = useAxios();

    // Get session hash from localStorage
    useEffect(() => {
        const hash = dashStorage.getItem('mall-session-hash');
        console.log('[MallClientTabsContext] Session hash from storage:', hash);
        setSessionHash(hash);
    }, []);

    // Subscribe to mall session WebSocket channel directly
    const { lastEvent, isConnected } = useLaravelEcho({
        type: 'public',
        channel: sessionHash ? `session.${sessionHash}` : null,
        enabled: !!sessionHash,
        debug: true,
    });

    // Log connection status
    useEffect(() => {
        if (sessionHash) {
            console.log(`[MallClientTabsContext] WebSocket ${isConnected ? 'connected' : 'disconnected'} to session.${sessionHash}`);
        }
    }, [isConnected, sessionHash]);

    // Process notifications to extract tenant statuses grouped by master_tab_id
    const processNotifications = useCallback((notificationList: IMallNotification[]) => {
        const statusesByTab: Record<number, Map<number, ITenantTabStatus>> = {};

        // Sort by timestamp descending (newest first) to get latest status per tenant
        const sortedNotifications = [...notificationList].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        sortedNotifications.forEach(notification => {
            if (notification.type === 'mall_order_status_update' && notification.data) {
                const data = notification.data;
                const masterTabId = data.master_tab_id;
                const tenantTabId = data.tenant_tab_id;
                const tenantId = data.tenant_id;

                if (masterTabId && tenantTabId && tenantId) {
                    // Initialize map for this master tab if needed
                    if (!statusesByTab[masterTabId]) {
                        statusesByTab[masterTabId] = new Map();
                    }

                    // Only set if we haven't seen this tenant yet (since we're processing newest first)
                    if (!statusesByTab[masterTabId].has(tenantId)) {
                        // Status can come in different field names depending on source
                        const status = data.child_status || data.status || data.tenant_tab_status || notification.status || 'CREATED';
                        
                        console.log('[MallClientTabsContext] Processing notification for tenant', {
                            tenantId,
                            tenantName: data.tenant_name,
                            status,
                            masterTabId,
                        });

                        statusesByTab[masterTabId].set(tenantId, {
                            tenant_tab_id: tenantTabId,
                            tenant_id: tenantId,
                            tenant_name: data.tenant_name || notification.tenant_name || `Tienda #${tenantId}`,
                            status: status,
                            timestamp: notification.created_at,
                            products: data.products || [],
                        });
                    }
                }
            }
        });

        // Convert Maps to arrays
        const result: Record<number, ITenantTabStatus[]> = {};
        Object.entries(statusesByTab).forEach(([tabId, tenantMap]) => {
            result[parseInt(tabId)] = Array.from(tenantMap.values());
        });

        setTenantStatusesByTab(result);
    }, []);

    // Fetch notifications from API
    const fetchNotifications = useCallback(async (tabId?: number) => {
        if (!sessionHash) {
            console.log('[MallClientTabsContext] No session hash available');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Build URL with optional tab_id filter
            let url = `/public/mall/session/${sessionHash}/notifications`;
            if (tabId) {
                url += `?tab_id=${tabId}`;
            }

            console.log('[MallClientTabsContext] Fetching notifications:', url);
            const response = await axios.get(url);

            if (response.data) {
                const notificationList = response.data.notifications || [];
                setNotifications(notificationList);
                setUnreadCount(response.data.unread_count || 0);
                setTotalCount(response.data.total_count || 0);
                
                // Process notifications to extract tenant statuses
                processNotifications(notificationList);
                
                console.log('[MallClientTabsContext] Loaded notifications:', notificationList.length);
            }
        } catch (err: any) {
            console.error('[MallClientTabsContext] Error fetching notifications:', err);
            setError(err.message || 'Error fetching notifications');
        } finally {
            setLoading(false);
        }
    }, [sessionHash, axios, processNotifications]);

    // Refresh notifications
    const refreshNotifications = useCallback(async (tabId?: number) => {
        await fetchNotifications(tabId);
    }, [fetchNotifications]);

    // Get tenant statuses for a specific master tab
    const getTenantStatusesForTab = useCallback((masterTabId: number): ITenantTabStatus[] => {
        return tenantStatusesByTab[masterTabId] || [];
    }, [tenantStatusesByTab]);

    // Initial fetch when session hash is available
    useEffect(() => {
        if (sessionHash) {
            fetchNotifications();
        }
    }, [sessionHash]);

    // Listen for WebSocket events and refresh notifications
    useEffect(() => {
        if (!lastEvent) return;

        // The lastEvent from useLaravelEcho has structure: { event: string, data: any, channel?: string }
        // The data contains the actual event payload with type, model, etc.
        const eventData = lastEvent.data || lastEvent;
        
        console.log('[MallClientTabsContext] Checking lastEvent:', {
            eventName: lastEvent.event,
            eventType: eventData?.type,
            dataType: eventData?.data?.type,
            model: eventData?.model,
        });

        // Check if this is a mall order status update event
        // The event can come in different formats depending on how it's dispatched
        const isMallStatusUpdate = 
            lastEvent.event === 'mall_order_status_update' ||
            eventData?.type === 'mall_order_status_update' ||
            eventData?.data?.type === 'mall_order_status_update' ||
            (eventData?.model === 'Domain\\App\\Models\\Mall\\MallSession' && eventData?.type === 'mall_order_status_update');

        if (isMallStatusUpdate) {
            console.log('[MallClientTabsContext] ✅ Received status update event');
            
            // Extract data from event - the actual payload is in eventData.data or eventData
            const payload = eventData?.data || eventData || {};
            const masterTabId = payload.master_tab_id;
            const tenantTabId = payload.tenant_tab_id;
            const tenantId = payload.tenant_id;
            const tenantName = payload.tenant_name;
            const status = payload.child_status || payload.status || payload.tenant_tab_status;
            const products = payload.products || [];
            
            console.log('[MallClientTabsContext] Event data:', {
                masterTabId,
                tenantTabId,
                tenantId,
                tenantName,
                status,
            });

            // Immediately update local state if we have all needed data
            if (masterTabId && tenantId && status) {
                setTenantStatusesByTab(prev => {
                    const updated = { ...prev };
                    const existingStatuses = updated[masterTabId] || [];
                    
                    // Find and update existing tenant status or add new one
                    const existingIndex = existingStatuses.findIndex(s => s.tenant_id === tenantId);
                    
                    const newStatus: ITenantTabStatus = {
                        tenant_tab_id: tenantTabId || 0,
                        tenant_id: tenantId,
                        tenant_name: tenantName || `Tienda #${tenantId}`,
                        status: status,
                        timestamp: new Date().toISOString(),
                        products: products,
                    };
                    
                    if (existingIndex >= 0) {
                        // Update existing
                        const newStatuses = [...existingStatuses];
                        newStatuses[existingIndex] = newStatus;
                        updated[masterTabId] = newStatuses;
                    } else {
                        // Add new
                        updated[masterTabId] = [...existingStatuses, newStatus];
                    }
                    
                    console.log('[MallClientTabsContext] Updated tenant statuses:', updated[masterTabId]);
                    return updated;
                });
            }
            
            // Also refresh from API to get full data
            refreshNotifications(masterTabId);
        } else {
            console.log('[MallClientTabsContext] ❌ Event not recognized as mall status update');
        }
    }, [lastEvent, refreshNotifications]);

    // Memoize context value
    const contextValue = useMemo<IMallClientTabsContextValue>(() => ({
        sessionHash,
        notifications,
        tenantStatusesByTab,
        loading,
        error,
        unreadCount,
        totalCount,
        refreshNotifications,
        getTenantStatusesForTab,
    }), [
        sessionHash,
        notifications,
        tenantStatusesByTab,
        loading,
        error,
        unreadCount,
        totalCount,
        refreshNotifications,
        getTenantStatusesForTab,
    ]);

    return (
        <MallClientTabsContext.Provider value={contextValue}>
            {children}
        </MallClientTabsContext.Provider>
    );
};

// Context component for resource config (follows dash-auto-admin pattern)
export const MallClientTabsContextComponent: IDashAutoAdminResourceConfig["contextComponent"] = (props) => {
    const { children, mode, resourceConfig } = props;

    // Always wrap with provider for all modes
    return (
        <MallClientTabsProvider mode={mode} resourceConfig={resourceConfig}>
            {children}
        </MallClientTabsProvider>
    );
};

export default MallClientTabsContext;
