import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAxios } from 'dash-axios-hook';
import { dashStorage } from 'dash-utils';
import { useRefresh } from 'react-admin';
import type { IDashAutoAdminResourceConfig } from 'dash-auto-admin';
import { useMallEchoBridge } from '../contexts/MallEchoBridgeContext';

// NOTE: This context uses the MallEchoBridge to receive WebSocket events.
// The MallEchoBridgeProvider (in MallClientWrapper) bridges events from MallSessionEchoContext.
// MallSessionEchoContext is the SINGLE SOURCE OF TRUTH for WebSocket subscriptions.

// Notification data structure from API
export interface IMallNotification {
    id: number;
    mall_session_id: number;
    type: string;
    title: string;
    message: string;
    data: {
        event: string;
        child_order_id?: string;
        child_status?: string;
        parent_order_id?: string;
        parent_status?: string;
        master_tab_id?: string;
        tenant_tab_id?: string;
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
    tenant_id: string | null;
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
    tenant_tab_id: string;
    tenant_id: string;
    tenant_name: string;
    status: string;
    progress: number;
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
    tenantStatusesByTab: Record<string, ITenantTabStatus[]>; // Indexed by master_tab_id
    loading: boolean;
    error: string | null;
    unreadCount: number;
    totalCount: number;
    lastEvent: any | null; // Last WebSocket event received
    refreshNotifications: (force?: boolean) => Promise<void>;
    getTenantStatusesForTab: (masterTabId: string) => ITenantTabStatus[];
    markAsRead: (notificationId: number) => Promise<void>;
    markAllAsRead: () => Promise<void>;
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
    lastEvent: null,
    refreshNotifications: async () => {},
    getTenantStatusesForTab: () => [],
    markAsRead: async () => {},
    markAllAsRead: async () => {},
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
    /** Storage key for session hash (default: 'mall-session-hash') */
    sessionStorageKey?: string;
    /** API path prefix (default: '/public/mall') */
    apiPathPrefix?: string;
}

const DEFAULT_SESSION_STORAGE_KEY = 'mall-session-hash';
const DEFAULT_API_PATH_PREFIX = '/public/mall';

export const MallClientTabsProvider: React.FC<MallClientTabsProviderProps> = ({ 
    children, 
    mode,
    resourceConfig,
    sessionStorageKey = DEFAULT_SESSION_STORAGE_KEY,
    apiPathPrefix = DEFAULT_API_PATH_PREFIX,
}) => {
    const [sessionHash, setSessionHash] = useState<string | null>(null);
    const [notifications, setNotifications] = useState<IMallNotification[]>([]);
    const [tenantStatusesByTab, setTenantStatusesByTab] = useState<Record<string, ITenantTabStatus[]>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    
    // Track if initial fetch has been done to prevent duplicate requests
    // Using localStorage to persist across component remounts (e.g., theme switches)
    const getFetchKey = () => sessionHash ? `mall-session-initial-fetch-${sessionHash}` : null;
    const isInitialFetchDone = () => {
        const key = getFetchKey();
        return key ? localStorage.getItem(key) === 'true' : false;
    };
    const setInitialFetchDone = () => {
        const key = getFetchKey();
        if (key) localStorage.setItem(key, 'true');
    };
    
    const axios = useAxios();

    // Get lastEvent from the MallEchoBridge context
    // This is the SINGLE SOURCE OF TRUTH - events come from MallSessionEchoContext via bridge
    const { lastEvent } = useMallEchoBridge();

    // Get session hash from localStorage
    useEffect(() => {
        const hash = dashStorage.getItem(sessionStorageKey);
        setSessionHash(hash);
    }, []);

    // Process notifications to extract tenant statuses grouped by master_tab_id
    const processNotifications = useCallback((notificationList: IMallNotification[]) => {
        const statusesByTab: Record<string, Map<number, ITenantTabStatus>> = {};

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
                        
                        // Get progress from notification data, fallback to calculation
                        const progress = (data as any).progress ?? (() => {
                            switch (status) {
                                case 'CREATED': return 10;
                                case 'CONFIRMED': return 25;
                                case 'IN_PREPARATION': return 50;
                                case 'PREPARED': return 75;
                                case 'DELIVERED': return 90;
                                case 'CLOSED': return 100;
                                case 'CANCELLED': return 0;
                                default: return 0;
                            }
                        })();
                        

                        statusesByTab[masterTabId].set(tenantId, {
                            tenant_tab_id: tenantTabId,
                            tenant_id: String(tenantId),
                            tenant_name: data.tenant_name || notification.tenant_name || `Tienda #${tenantId}`,
                            status: status,
                            progress: progress,
                            timestamp: notification.created_at,
                            products: data.products || [],
                        });
                    }
                }
            }
        });

        // Convert Maps to arrays
        const result: Record<string, ITenantTabStatus[]> = {};
        Object.entries(statusesByTab).forEach(([tabId, tenantMap]) => {
            result[tabId] = Array.from(tenantMap.values());
        });

        setTenantStatusesByTab(result);
    }, []);

    // Fetch notifications from API
    const fetchNotifications = useCallback(async (force = false) => {
        // Skip if already fetched and not forced
        if (isInitialFetchDone() && !force) {
            return;
        }

        if (!sessionHash) {
            return;
        }

        setLoading(true);
        setError(null);

        // Refresh are quicks, so the response sometimes not performed.
        setInitialFetchDone();

        try {
            const url = `${apiPathPrefix}/session/${sessionHash}/notifications`;

            const response = await axios.get(url);

             

            if (response.data) {
                const notificationList = response.data.notifications || [];
                setNotifications(notificationList);
                setUnreadCount(response.data.unread_count || 0);
                setTotalCount(response.data.total_count || 0);
                
                // Process notifications to extract tenant statuses
                processNotifications(notificationList);
                
                // Mark initial fetch as done
                //initialFetchDone.current = true;
            }
        } catch (err: any) {
            console.error('[MallClientTabsContext] Error fetching notifications:', err);
            setError(err.message || 'Error fetching notifications');
        } finally {
            setLoading(false);
        }
    }, [sessionHash, axios, processNotifications]);

    // Refresh notifications (force fetch)
    const refreshNotifications = useCallback(async (force = false) => {
      
        await fetchNotifications(force);
    }, [fetchNotifications]);

    // Mark a single notification as read
    const markAsRead = useCallback(async (notificationId: number) => {
        if (!sessionHash) return;
        
        // Update local state immediately
        setNotifications(prev => 
            prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));

        try {
            await axios.post(`${apiPathPrefix}/session/${sessionHash}/notifications/mark-read`, {
                notification_ids: [notificationId]
            });
        } catch (error) {
            console.error('[MallClientTabsContext] Error marking notification as read:', error);
        }
    }, [sessionHash, axios]);

    // Mark all notifications as read
    const markAllAsRead = useCallback(async () => {
        if (!sessionHash) return;
        
        // Update local state immediately
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);

        try {
            await axios.post(`${apiPathPrefix}/session/${sessionHash}/notifications/mark-read`, {});
        } catch (error) {
            console.error('[MallClientTabsContext] Error marking all notifications as read:', error);
        }
    }, [sessionHash, axios]);

    // Get tenant statuses for a specific master tab
    const getTenantStatusesForTab = useCallback((masterTabId: string): ITenantTabStatus[] => {
        return tenantStatusesByTab[masterTabId] || [];
    }, [tenantStatusesByTab]);

    // Initial fetch when session hash is available
    useEffect(() => {
        if (sessionHash && !isInitialFetchDone()) {
        
            fetchNotifications();
        }
    }, [sessionHash]);

    // List of modes that should trigger a refresh
    const MODES_TO_REFRESH = ['edit', 'show'];

    // Hook to refresh the current view
    const refreshView = useRefresh();

    // Listen for WebSocket events and refresh notifications
    useEffect(() => {
        if (!lastEvent) return;

        // The lastEvent from useLaravelEcho has structure: { event: string, data: any, channel?: string }
        // The data contains the actual event payload with type, model, etc.
        const eventData = lastEvent.data || lastEvent;
        const notificationPayload = lastEvent.notificationPayload || eventData?.notificationPayload;

        const isMallStatusUpdate = 
            // Standard Mall events
            lastEvent.event === 'mall_order_status_update' ||
            lastEvent.type === 'mall_order_status_update' ||
            eventData?.type === 'mall_order_status_update' ||
            eventData?.data?.type === 'mall_order_status_update' ||
            eventData?.data?.event === 'mall_order_status_update' ||
            notificationPayload?.class === 'MallSessionOrderStatusNotification' ||
            (eventData?.model === 'Domain\\App\\Models\\Mall\\MallSession' && eventData?.type === 'mall_order_status_update') ||
            // Self-Service events
            lastEvent.event === 'selfservice_session_order_status_update' ||
            lastEvent.type === 'selfservice_session_order_status_update' ||
            eventData?.type === 'selfservice_session_order_status_update' ||
            notificationPayload?.class === 'SelfServiceSessionOrderStatusNotification' ||
            (eventData?.model === 'Domain\\App\\Models\\SelfService\\SelfServiceSession' && eventData?.type === 'selfservice_session_order_status_update');

        if (isMallStatusUpdate) {
            // Extract data from event - handle nested notificationPayload structure
            const payload = notificationPayload?.notificationPayload || eventData?.data || eventData || {};
            const masterTabId = payload.master_tab_id || payload.tab_id; // Support tab_id from self-service event
            const tenantTabId = payload.tenant_tab_id;
            const tenantId = payload.tenant_id;
            const tenantName = payload.tenant_name;
            const status = payload.child_status || payload.status || payload.tenant_tab_status;
            const products = payload.products || [];

            // Immediately update local state if we have all needed data
            if (masterTabId && tenantId && status) {
                setTenantStatusesByTab(prev => {
                    const updated = { ...prev };
                    const existingStatuses = updated[masterTabId] || [];
                    
                    // Calculate progress from notification data or fallback
                    const progress = (() => {
                        const notificationData = lastEvent?.data;
                        if (notificationData && (notificationData as any).progress !== undefined) {
                            return (notificationData as any).progress;
                        }
                        switch (status) {
                            case 'CREATED': return 10;
                            case 'CONFIRMED': return 25;
                            case 'IN_PREPARATION': return 50;
                            case 'PREPARED': return 75;
                            case 'DELIVERED': return 90;
                            case 'CLOSED': return 100;
                            case 'CANCELLED': return 0;
                            default: return 0;
                        }
                    })();
                    
                    const existingIndex = existingStatuses.findIndex(s => s.tenant_id === tenantId);
                    
                    const newStatus: ITenantTabStatus = {
                        tenant_tab_id: String(tenantTabId || ''),
                        tenant_id: tenantId,
                        tenant_name: tenantName || `Tienda #${tenantId}`,
                        status: status,
                        progress: progress,
                        timestamp: new Date().toISOString(),
                        products: products,
                    };
                    
                    if (existingIndex >= 0) {
                        const newStatuses = [...existingStatuses];
                        newStatuses[existingIndex] = newStatus;
                        updated[masterTabId] = newStatuses;
                    } else {
                        updated[masterTabId] = [...existingStatuses, newStatus];
                    }
                    
                    return updated;
                });
            }
            
            // Refresh the view if in edit/show mode to get latest data from backend
            if (mode && MODES_TO_REFRESH.includes(mode)) {
                //console.log('🔄 MallClientTabsContext: Refreshing view due to notification in', mode, 'mode');
                refreshView();
            }
        }
    }, [lastEvent, mode, refreshView]);

    // Memoize context value
    const contextValue = useMemo<IMallClientTabsContextValue>(() => ({
        sessionHash,
        notifications,
        tenantStatusesByTab,
        loading,
        error,
        unreadCount,
        totalCount,
        lastEvent,
        refreshNotifications,
        getTenantStatusesForTab,
        markAsRead,
        markAllAsRead,
    }), [
        sessionHash,
        notifications,
        tenantStatusesByTab,
        loading,
        error,
        unreadCount,
        totalCount,
        lastEvent,
        refreshNotifications,
        getTenantStatusesForTab,
        markAsRead,
        markAllAsRead,
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
