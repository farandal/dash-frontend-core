import React, { useEffect, useMemo, useCallback } from 'react';
import { Box, Typography, LinearProgress, Chip, CircularProgress } from '@mui/material';
import { useEditContext } from 'react-admin';
import { useParams } from 'react-router-dom';

import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import { OrderProductsList, OrderSummary } from '.';
import DiscountSection from './components/DiscountSection';
import { ITab } from '../interfaces/ITab';
import { useTabCache } from './hooks/useProductsCache';
import { useTabManager } from '../contexts/TabManagerContext';
import TabAgentToolbar from '../Tab/TabAgentToolbar';

export interface IEditOrderComponent extends IDashAutoAdminCustomFieldComponent {
    productsResource?: string;
    enableVoiceOrders?: boolean;
    enableImageOrders?: boolean;
    persistState?: boolean;
    enableServiceFee?: boolean;
}

const EditOrder: React.FC<IEditOrderComponent> = ({
    method, 
    attribute, 
    resourceConfig,
    productsResource = null,
    enableVoiceOrders = false,
    enableImageOrders = false,
    persistState = false,
    enableServiceFee = true
}) => {
    const { record: tab, isPending } = useEditContext<ITab>();
    const { id: tabId } = useParams();
    const { getCachedTab } = useTabCache();

    // Use the TabManager context for voice processing
    const {
        orderProducts,
        handleOrderQuantityChange,
        handleOrderNoteChange,
        handleOrderModifierChange,
        removeOrderProduct,
        updateOrderProducts,
        calculateOrderTotal,
        isProcessingVoiceActions,
        showMessage
    } = useTabManager();

    const cachedTab = useMemo(() => {
        return tabId ? getCachedTab(tabId) : null;
    }, [tabId, getCachedTab]);

    const isUsingCache = !!cachedTab && isPending;

    // Process tab data
    const processTabData = useCallback((tabData: ITab) => {
        console.log("Processing tab data:", tabData);
        if (tabData?.order?.items) {
            const processedProducts = tabData.order.items.map(item => {
                console.log("Processing item:", item);
                const unitPrice = item.unit_price ? String(item.unit_price) : "0";
                console.log(`Item ${item.product_id} unit price: ${unitPrice}`);

                const processedModifiers = item.modifiers && item.modifiers.length
                    ? item.modifiers.map(mod => {
                        const modifierGroup = item.product?.modifier_groups?.find(group => {
                            if (!group?.options) {
                                console.warn(`Modifier group options not found for group: ${group?.id}`);
                                return false;
                            }
                            return group.options.some(option => option.id === mod.modifier_option_id);
                        }) || {};

                        return {
                            id: mod.id,
                            modifier_option_id: mod.modifier_option_id,
                            modifier_group_id: modifierGroup?.id || mod.modifier_option?.modifier_group?.id,
                            price_adjustment: mod.price_adjustment,
                            modifier_option: {
                                id: mod.modifier_option?.id || mod.modifier_option_id,
                                name: mod.modifier_option?.name,
                                price_adjustment: mod.price_adjustment,
                                modifierGroup: {
                                    id: modifierGroup?.id || mod.modifier_option?.modifier_group?.id,
                                    name: modifierGroup?.name || mod.modifier_option?.modifier_group?.name,
                                    type: modifierGroup?.type || mod.modifier_option?.modifier_group?.type
                                }
                            }
                        };
                    })
                    : [];

                const defaultModifiers = !processedModifiers.length
                    ? item.product?.modifier_groups?.flatMap(group =>
                        group.options.filter(option => option.is_default).map(option => ({
                            modifier_option_id: option.id,
                            modifier_group_id: group.id,
                            price_adjustment: option.price_adjustment,
                            modifier_option: {
                                id: option.id,
                                name: option.name,
                                price_adjustment: option.price_adjustment,
                                modifierGroup: {
                                    id: group.id,
                                    name: group.name,
                                    type: group.type
                                }
                            }
                        }))
                    ) || []
                    : [];

                return {
                    ...item,
                    unit_price: unitPrice,
                    modifiers: processedModifiers.length ? processedModifiers : defaultModifiers,
                    line_id: item.line_id || `line_${item.id}_${Date.now()}`
                };
            });

            console.log("Setting products:", processedProducts);
            updateOrderProducts(processedProducts || []);
            calculateOrderTotal(processedProducts);
        }
    }, [updateOrderProducts, calculateOrderTotal]);

    // Use cached data immediately if available
    useEffect(() => {
        if (cachedTab && tab?.order?.items?.length === 0) {
            console.log("🚀 Using cached tab data:", cachedTab);
            processTabData(cachedTab);
        }
    }, [cachedTab, tab, processTabData]);

    // Use API data when it arrives
    useEffect(() => {
        /*debugger;*/
        if (tab && !isPending) {
            console.log("📡 API tab data loaded:", tab);
            if (!cachedTab || JSON.stringify(tab.order?.items) !== JSON.stringify(cachedTab.order?.items)) {
                processTabData(tab);
            }
        }
    }, [tab, isPending/*, cachedTab, processTabData*/]);

    if (orderProducts.length === 0 && isPending) {
        return (
            <Box>
                {isUsingCache && (
                    <Box sx={{ mb: 2 }}>
                        <Chip
                            label="🚀 Loading from cache..."
                            color="success"
                            size="small"
                        />
                    </Box>
                )}
                <LinearProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 0, m: 0 }}>
            {/* AI Agent Toolbar - Compact single row */}
            {(enableVoiceOrders || enableImageOrders) && (
                <TabAgentToolbar 
                    record={tab}
                    config={{
                        enableVoice: enableVoiceOrders,
                        enableImage: enableImageOrders,
                        autoApply: true,
                        compact: true,
                        showStatus: true,
                    }}
                />
            )}

            <Box sx={{ display: 'flex', gap: 2, p: 0, m: 0 }}>
                <Box sx={{ flex: 1, p: 0, m: 0 }}>
                    {/* Show cache status */}
                    {isUsingCache && (
                        <Box sx={{ mb: 2 }}>
                            <Chip
                                label="📦 Loaded from cache - API data loading..."
                                color="success"
                                size="small"
                            />
                        </Box>
                    )}

                    {/* Processing Indicator */}
                    {isProcessingVoiceActions && (
                        <Box sx={{ mb: 2, p: 1, bgcolor: 'info.light', borderRadius: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CircularProgress size={16} />
                                <Typography variant="body2">Aplicando comandos de voz...</Typography>
                            </Box>
                        </Box>
                    )}

                    {/* Simplified OrderProductsList - only passing UI customization props */}
                    <OrderProductsList 
                        disabled={isProcessingVoiceActions}
                    />

                    {/* Discount Section */}
                    <DiscountSection method="edit" />

                    {/* Order Summary */}
                    <OrderSummary enableServiceFee={enableServiceFee} />
                </Box>
            </Box>
        </Box>
    );
};

export default EditOrder;
      