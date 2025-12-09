/**
 * Utility functions to calculate order progress from notifications
 */

export interface OrderStatus {
    status: string;
    progress: number;
    timestamp: string;
    tenant_id?: number;
}

export interface OrderStatusResult {
    overallStatus: string;
    tenantStatuses: Record<number, string>;
    progress: number;
    statusHistory: OrderStatus[];
}

/**
 * Calculate current order status from notifications
 */
export const calculateOrderStatus = (notifications: any[]): OrderStatusResult => {
    // Sort notifications by timestamp (newest first)
    const sortedNotifications = [...notifications].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Extract status updates
    const statusUpdates: OrderStatus[] = [];
    const tenantStatuses: Record<number, string> = {};

    // Find the latest overall status
    let overallStatus = 'CREATED';
    let latestStatusTime = new Date(0);

    sortedNotifications.forEach(notification => {
        if (notification.type === 'mall_order_status_update') {
            const status = notification.data.status;
            const timestamp = notification.created_at;
            const tenantId = notification.data.tenant_id;

            // Add to status history
            statusUpdates.push({
                status,
                progress: getProgressValue(status),
                timestamp,
                tenant_id: tenantId
            });

            // Update tenant status if available
            if (tenantId) {
                tenantStatuses[tenantId] = status;
            }
            // Update overall status if this is newer and not tenant-specific
            else if (new Date(timestamp) > latestStatusTime) {
                overallStatus = status;
                latestStatusTime = new Date(timestamp);
            }
        }
    });

    // Calculate overall progress
    const progress = getProgressValue(overallStatus);

    return {
        overallStatus,
        tenantStatuses,
        progress,
        statusHistory: statusUpdates
    };
};

/**
 * Convert status to progress percentage
 */
export const getProgressValue = (status: string): number => {
    switch (status.toUpperCase()) {
        case 'CREATED': return 10;
        case 'CONFIRMED': return 25;
        case 'IN_PREPARATION': return 50;
        case 'PREPARED': return 75;
        case 'DELIVERED':
        case 'SHIPPED':
        case 'PICKED_UP':
        case 'CLOSED': return 100;
        case 'CANCELLED': return 0;
        default: return 0;
    }
};

/**
 * Get color for status (MUI theme compatible)
 */
export const getStatusColor = (status: string): string => {
    switch (status.toUpperCase()) {
        case 'CREATED': return 'info.main';
        case 'CONFIRMED': return 'primary.main';
        case 'IN_PREPARATION': return 'warning.main';
        case 'PREPARED': return 'success.light';
        case 'DELIVERED': return 'success.main';
        case 'CANCELLED': return 'error.main';
        default: return 'grey.500';
    }
};
