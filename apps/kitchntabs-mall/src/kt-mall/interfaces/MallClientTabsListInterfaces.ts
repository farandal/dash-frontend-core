// Interfaces for MallClientTabsList component

export interface IOrderStatusUpdateNotification {
    event: string;
    status: string;
    tenant_id?: number;
    tenant_name?: string;
    mall_session_hash?: string;
    master_tab_id?: string;
    tenant_tab_id?: string;
    products?: any[];
    timestamp?: string;
    type: string;
}

export interface StoreProgressBarsProps {
    masterTabId: string;
    record?: any; // API record with progress data
}