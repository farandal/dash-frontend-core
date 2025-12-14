import React, { useEffect } from 'react';
import { CircularProgress, Box } from '@mui/material';
import { useGetOne } from 'react-admin';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
// Direct import from local kt-tabs (avoid barrel exports for tree-shaking)
//import type { ITab } from '../../kt-tabs/components/interfaces/ITab';
import { useMallClientTabsContext } from './MallClientTabsContext';
import StoreProgressBars from './StoreProgressBars';

const placeholder = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="

/**
 * Safely parse a price value that can come in various formats:
 * - Number: 13990 or 13990.00
 * - String: "13990" or "13990.00"
 * - Null/undefined
 * 
 * Returns a number that can be used for display and calculations.
 */
const parsePrice = (price: any): number => {
    if (price === null || price === undefined) {
        return 0;
    }
    
    // If it's already a number, return it
    if (typeof price === 'number') {
        return price;
    }
    
    // If it's a string, parse it
    if (typeof price === 'string') {
        // Remove any currency symbols, commas, spaces
        const cleaned = price.replace(/[^0-9.-]/g, '');
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? 0 : parsed;
    }
    
    return 0;
};

/**
 * Calculate the total price for an order item.
 * Handles multiple scenarios:
 * 1. total_price exists - use it directly
 * 2. total exists - use it
 * 3. unit_price * quantity - calculate it
 * 4. price * quantity - fallback
 */
const calculateItemTotal = (item: any): number => {
    // Try total_price first (some backends send this)
    if (item.total_price !== undefined && item.total_price !== null) {
        return parsePrice(item.total_price);
    }
    
    // Try total (another common field name)
    if (item.total !== undefined && item.total !== null) {
        return parsePrice(item.total);
    }
    
    // Calculate from unit_price * quantity
    const quantity = item.quantity || 1;
    
    if (item.unit_price !== undefined && item.unit_price !== null) {
        return parsePrice(item.unit_price) * quantity;
    }
    
    // Fallback to price field
    if (item.price !== undefined && item.price !== null) {
        return parsePrice(item.price) * quantity;
    }
    
    // Try product.price as last resort
    if (item.product?.price !== undefined && item.product?.price !== null) {
        return parsePrice(item.product.price) * quantity;
    }
    
    return 0;
};

/**
 * Format a price for display.
 * Handles the case where prices might be in cents (large numbers without decimals)
 * or already in the correct format.
 */
const formatPrice = (price: number): string => {
    // If the price is 0, show $0.00
    if (price === 0) {
        return '$0.00';
    }
    
    // Format with locale-aware thousand separators
    // For Chilean pesos or similar currencies without decimals, we might want whole numbers
    // For now, let's show 2 decimal places
    return '$' + price.toLocaleString('es-CL', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
};

const OrderProductsView: React.FC<IDashAutoAdminCustomFieldComponent> = ({ record, resourceConfig }) => {
    //const tab: ITab = record as ITab;
    const tab: any = record as any;

    // Use MallClientTabsContext for WebSocket events
    // This context subscribes to the WebSocket channel and provides lastEvent
    const { lastEvent } = useMallClientTabsContext();

    // Use the resource model from config, which will be mapped by the data provider
    const { data: tabData, refetch } = useGetOne(resourceConfig?.model || 'tab', { id: tab.id });

    // Refetch when notification arrives for this tab
    useEffect(() => {
        if (!lastEvent) return;

        const eventData = lastEvent?.data || lastEvent;
        const notificationPayload = (lastEvent as any)?.notificationPayload;

        // Check if this notification is for this tab
        const masterTabId = eventData?.master_tab_id || notificationPayload?.notificationPayload?.master_tab_id;
        const tenantTabId = eventData?.tenant_tab_id || notificationPayload?.notificationPayload?.tenant_tab_id;

        if (masterTabId === tab.id || tenantTabId === tab.id) {
            refetch();
        }

        // Also refetch on any mall order status update
        const isMallOrderUpdate =
            (lastEvent as any)?.type === "mall_order_status_update" ||
            lastEvent?.event === "mall_order_status_update" ||
            eventData?.type === "mall_order_status_update" ||
            eventData?.event === "mall_order_status_update";

        if (isMallOrderUpdate) {
            refetch();
        }
    }, [lastEvent, tab.id, refetch]);

    if (!tabData) {
        return <CircularProgress />;
    }

    return (
        <div style={{ backgroundColor: 'transparent' }} className="kt-mall-order-products-view">
            <StoreProgressBars masterTabId={tabData.id} record={tabData} />

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                    {tabData?.order?.items?.map((item) => {
                        const itemTotal = calculateItemTotal(item);
                        const unitPrice = parsePrice(item.unit_price || item.price || item.product?.price);
                        
                        return (
                            <tr key={item.id}>
                                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <img
                                            src={item.product?.image_url || placeholder}
                                            alt={item.product_name}
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                objectFit: 'cover',
                                                borderRadius: '4px',
                                                marginRight: '12px'
                                            }}
                                        />
                                        <div>
                                            <div style={{ fontWeight: 'bold' }}>{item.product_name}</div>
                                            <div style={{ fontSize: '0.9em', color: '#666' }}>
                                                {item.quantity > 1 
                                                    ? `${item.quantity} x ${formatPrice(unitPrice)}`
                                                    : `Cantidad: ${item.quantity}`
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '8px', borderBottom: '1px solid #eee', textAlign: 'right' }}>
                                    <div style={{ fontWeight: 'bold' }}>
                                        {formatPrice(itemTotal)}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default OrderProductsView;