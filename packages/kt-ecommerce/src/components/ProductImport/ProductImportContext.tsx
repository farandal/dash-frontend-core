/**
 * ProductImportContext
 * 
 * Context component for the Product Import resource.
 * Handles WebSocket notifications for import progress, completion, and errors.
 * Similar pattern to SelfServiceTabsContext.
 */
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useRefresh, useNotify, useTranslate } from 'react-admin';
import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';
// IMPORTANT: Import from 'dash-admin' package (not source path) to ensure same context instance as main app
import { LaravelEchoContext, ILaravelEchoContext } from 'dash-admin';
import { dashStorage } from 'dash-utils';



// ============ Types ============

export interface INormalizedProgress {
    percent: number;
    processed: number;
    total: number;
    current_sku: string;
    timestamp: string;
}

export interface INormalizedStats {
    products_to_create?: number;
    products_to_update?: number;
    products_created?: number;
    products_updated?: number;
    categories_to_create?: number;
    categories_created?: number;
    brands_to_create?: number;
    galleries_to_create?: number;
    galleries_created?: number;
    errors_count: number;
    skipped_rows: number;
}

export interface IProgressUpdate {
    phaseName: string;
    phaseNumber: number;
    processedItems: number;
    totalItems: number;
    totalPhases: number;
}

export interface IProductImportContextValue {
    // Normalized import state
    normalizedProgress: INormalizedProgress | null;
    normalizedStats: INormalizedStats | null;
    isNormalizedImportActive: boolean;
    
    // Legacy template import state
    templateProgress: Record<string, IProgressUpdate>;
    
    // Import results
    importStats: any;
    
    // Notification dialog state
    notificationDialogOpen: boolean;
    notificationDialogProps: any;
    closeNotificationDialog: () => void;
    
    // Last event for components that need raw access
    lastImportEvent: any;
    
    // Actions
    clearProgress: () => void;
}

const defaultContextValue: IProductImportContextValue = {
    normalizedProgress: null,
    normalizedStats: null,
    isNormalizedImportActive: false,
    templateProgress: {},
    importStats: null,
    notificationDialogOpen: false,
    notificationDialogProps: null,
    closeNotificationDialog: () => {},
    lastImportEvent: null,
    clearProgress: () => {},
};

export const ProductImportStateContext = createContext<IProductImportContextValue>(defaultContextValue);

export const useProductImportState = () => useContext(ProductImportStateContext);

// ============ Notification Listener Component ============

interface NotificationListenerProps {
    children: React.ReactNode;
}

const ProductImportNotificationListener: React.FC<NotificationListenerProps> = ({ children }) => {
    const refresh = useRefresh();
    const notify = useNotify();
    const translate = useTranslate();
    const laravelEchoContext = useContext<ILaravelEchoContext>(LaravelEchoContext);
    // Use both events array AND lastEvent to ensure we don't miss any events
    const { events, lastEvent } = laravelEchoContext;
    
    // Debug: Log on every render to confirm context is mounted
    console.log('🔵🔵🔵 [ProductImportContext] NotificationListener RENDER 🔵🔵🔵', { 
        hasLaravelEchoContext: !!laravelEchoContext,
        lastEventType: lastEvent?.type,
        lastEventPayloadType: lastEvent?.notificationPayload?.type,
        eventsCount: events?.length
    });
    
    // Normalized import state
    const [normalizedProgress, setNormalizedProgress] = useState<INormalizedProgress | null>(null);
    const [normalizedStats, setNormalizedStats] = useState<INormalizedStats | null>(null);
    const [isNormalizedImportActive, setIsNormalizedImportActive] = useState(false);
    
    // Legacy template import state
    const [templateProgress, setTemplateProgress] = useState<Record<string, IProgressUpdate>>({});
    
    // Import results
    const [importStats, setImportStats] = useState<any>(null);
    
    // Notification dialog state
    const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
    const [notificationDialogProps, setNotificationDialogProps] = useState<any>(null);
    
    // Last event for raw access
    const [lastImportEvent, setLastImportEvent] = useState<any>(null);
    
    // Track processed events using event index to avoid duplicates and missing events
    // This is more reliable than using event keys since we process all new events from array
    const lastProcessedEventIndexRef = useRef<number>(-1);
    // Legacy key tracking for deduplication within same event batch
    const lastProcessedEventRef = useRef<string | null>(null);

    const closeNotificationDialog = useCallback(() => {
        setNotificationDialogOpen(false);
        setNotificationDialogProps(null);
    }, []);

    const clearProgress = useCallback(() => {
        setNormalizedProgress(null);
        setNormalizedStats(null);
        setIsNormalizedImportActive(false);
        setTemplateProgress({});
        setImportStats(null);
        // Reset the processed index when clearing
        lastProcessedEventIndexRef.current = events?.length || 0;
    }, [events?.length]);

    // Helper function to process a single event
    const processImportEvent = useCallback((event: any) => {
        if (!event) return;

        // Create a stable event key - use event's own identifiers, never Date.now()
        // The key should be based on immutable properties of the event
        // Check multiple possible locations for the event type based on notification structure:
        // - event.type (direct)
        // - event.data?.type (from notification data)
        // - event.notificationPayload?.type (from payload root)
        // - event.notificationPayload?.stdClass?.type (from payload stdClass)
        // - event.notificationPayload?.notificationPayload?.type (nested payload)
        const eventType = event.type || 
                          event.data?.type || 
                          event.notificationPayload?.type ||
                          event.notificationPayload?.stdClass?.type ||
                          event.notificationPayload?.notificationPayload?.type;
        
        // Get data from multiple possible locations in the notification structure
        const eventData = event.data || {};
        const payloadData = event.notificationPayload?.notificationPayload || {};
        
        // Try multiple timestamp locations
        const eventTimestamp = eventData.timestamp || 
                               eventData.completed_at || 
                               eventData.progress?.timestamp ||
                               payloadData.timestamp ||
                               payloadData.completed_at ||
                               event.timestamp;
        
        // Create key from type + timestamp + unique content indicator
        // Use progress percent for progress events, or status for completed events
        const uniqueIndicator = eventData.progress?.percent || 
                                eventData.status || 
                                payloadData.progress?.percent ||
                                payloadData.status ||
                                '';
        const currentEventKey = `${eventType}-${eventTimestamp || ''}-${uniqueIndicator}`;
        
        // Debug: log the key being generated
        console.log('[ProductImportContext] Event key check:', {
            eventType,
            eventTimestamp,
            uniqueIndicator,
            currentEventKey,
            lastProcessedKey: lastProcessedEventRef.current,
            willSkip: lastProcessedEventRef.current === currentEventKey
        });
        
        // Skip if we've already processed this exact event
        if (lastProcessedEventRef.current === currentEventKey) {
            console.log('[ProductImportContext] Skipping duplicate event');
            return;
        }

        // Check if this is an import-related notification
        // Handle multiple possible locations for class name
        const notificationClass = event.notificationPayload?.class || 
                                  event.notificationPayload?.stdClass?.class;

        console.log('[ProductImportContext] Received event:', {
            type: event.type,
            dataType: event.data?.type,
            payloadType: event.notificationPayload?.type,
            stdClassType: event.notificationPayload?.stdClass?.type,
            payloadClass: notificationClass,
            eventType,
            data: event.data
        });

        // Handle type-based notifications (unified approach for both template and normalized)
        if (eventType) {
            // Get notification data from multiple possible locations
            const notificationData = event.data || 
                                     event.notificationPayload?.notificationPayload ||
                                     event.notificationPayload?.stdClass?.notificationPayload ||
                                     {};

            switch (eventType) {
                case 'import.started':
                    console.log('[ProductImportContext] Import started');
                    setIsNormalizedImportActive(true);
                    setNormalizedProgress(null);
                    setNormalizedStats(null);
                    setLastImportEvent(event);
                    lastProcessedEventRef.current = currentEventKey;
                    notify(translate('resource.import.instances.notifications.started'), { type: 'info' });
                    break;

                case 'import.progress':
                    console.log('[ProductImportContext] Import progress:', notificationData.progress);
                    setIsNormalizedImportActive(true);
                    
                    if (notificationData.progress) {
                        setNormalizedProgress(notificationData.progress);
                    }
                    if (notificationData.stats) {
                        setNormalizedStats(notificationData.stats);
                    }
                    
                    setLastImportEvent(event);
                    lastProcessedEventRef.current = currentEventKey;
                    break;

                case 'import.completed':
                    console.log('✅✅✅ [ProductImportContext] Import COMPLETED! ✅✅✅', {
                        notificationData,
                        hasStats: !!notificationData.stats,
                        currentKey: currentEventKey,
                        settingIsNormalizedImportActive: false
                    });
                    setIsNormalizedImportActive(false);
                    
                    // Set final progress
                    setNormalizedProgress(prev => ({
                        ...prev,
                        percent: 100,
                        current_sku: 'completed',
                        timestamp: new Date().toISOString()
                    } as INormalizedProgress));
                    
                    // Set final stats
                    if (notificationData.stats) {
                        setNormalizedStats(notificationData.stats);
                    }
                    
                    setImportStats(notificationData);
                    setLastImportEvent(event);
                    lastProcessedEventRef.current = currentEventKey;
                    
                    // Show completion notification
                    notify(translate('resource.import.instances.notifications.completed'), { type: 'success' });
                    
                    // Refresh the list/record
                    setTimeout(() => refresh(), 1500);
                    break;

                case 'import.failed':
                    console.log('[ProductImportContext] Import failed:', notificationData);
                    setIsNormalizedImportActive(false);
                    setLastImportEvent(event);
                    lastProcessedEventRef.current = currentEventKey;
                    
                    const errorMessage = notificationData.error || 
                        event.notificationPayload?.message || 
                        translate('resource.import.instances.notifications.failed');
                    
                    notify(errorMessage, { type: 'error' });
                    
                    // Refresh to show error state
                    setTimeout(() => refresh(), 1000);
                    break;

                case 'import.already_completed':
                    console.log('[ProductImportContext] Import already completed');
                    setIsNormalizedImportActive(false);
                    setNormalizedProgress(null);
                    setLastImportEvent(event);
                    lastProcessedEventRef.current = currentEventKey;
                    
                    const modeLabel = notificationData.mode === 'preview' 
                        ? translate('resource.import.instances.tabs.preview') 
                        : translate('resource.import.instances.tabs.import');
                    
                    notify(
                        translate('resource.import.instances.notifications.already_completed', { mode: modeLabel }), 
                        { type: 'info' }
                    );
                    break;

                default:
                    // Not an import event we care about
                    return;
            }
        }

        // Fallback: Handle legacy class-based notifications for template imports
        if (notificationClass && !eventType) {
            switch (notificationClass) {
                case 'ValidateProductImportNotification':
                case 'ProductImportNotification':
                case 'ProductImportProgressNotification':
                case 'ProductImportErrorNotification':
                    console.log('[ProductImportContext] Legacy template notification:', notificationClass);
                    setLastImportEvent(event);
                    lastProcessedEventRef.current = currentEventKey;
                    
                    // For legacy, let the component handle the details
                    // Just refresh on completion/error
                    if (notificationClass === 'ProductImportNotification') {
                        setTimeout(() => refresh(), 1500);
                    }
                    break;
            }
        }
    }, [notify, translate, refresh]);

    // Process all new events from the events array
    // This ensures we don't miss any events that arrive in rapid succession
    useEffect(() => {
        if (!events || events.length === 0) return;
        
        // Process any new events since last check
        const startIndex = lastProcessedEventIndexRef.current + 1;
        
        if (startIndex >= events.length) return; // No new events
        
        console.log('[ProductImportContext] Processing events from index', startIndex, 'to', events.length - 1);
        
        for (let i = startIndex; i < events.length; i++) {
            processImportEvent(events[i]);
        }
        
        // Update the index to mark all current events as processed
        lastProcessedEventIndexRef.current = events.length - 1;
    }, [events, processImportEvent]);

    const contextValue: IProductImportContextValue = {
        normalizedProgress,
        normalizedStats,
        isNormalizedImportActive,
        templateProgress,
        importStats,
        notificationDialogOpen,
        notificationDialogProps,
        closeNotificationDialog,
        lastImportEvent,
        clearProgress,
    };

    return (
        <ProductImportStateContext.Provider value={contextValue}>
            {children}
        </ProductImportStateContext.Provider>
    );
};

// ============ Main Context Component ============

/**
 * ProductImportContext
 * 
 * Context wrapper for the Product Import resource.
 * Only wraps with the NotificationListener in 'view' mode to handle WebSocket events
 * for import progress tracking. Other modes (create, edit, list) just pass children through.
 * 
 * Signature matches IDashAutoAdminResourceConfig.contextComponent
 */
const ProductImportContext = ({
    resourceConfig,
    mode,
    children
}: {
    resourceConfig: IDashAutoAdminResourceConfig;
    mode?: 'list' | 'create' | 'edit' | 'view';
    children?: React.ReactNode;
}): React.ReactElement => {
    /*console.log('🟢🟢🟢 [ProductImportContext] MAIN COMPONENT RENDERING 🟢🟢🟢', { 
        mode, 
        resourceConfigModel: resourceConfig?.model,
        hasChildren: !!children 
    });*/

    // Only wrap with notification listener in 'view' mode
    // This is where we need WebSocket events for import progress tracking
    if (mode === 'view') {
        return (
            <ProductImportNotificationListener>
                {children}
            </ProductImportNotificationListener>
        );
    }

    // For other modes (create, edit, list), just pass children through
    return <>{children}</>;
};

export default ProductImportContext;


