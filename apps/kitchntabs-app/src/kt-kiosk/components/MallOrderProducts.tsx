import { IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";
import { useRecordContext } from "react-admin";
import { Box, Typography } from "@mui/material";

// Direct imports from local kt-tabs (avoid barrel exports for tree-shaking)
import type { ITab } from "../../kt-tabs/components/interfaces/ITab";
import OrderProductsView from "../../kt-tabs/components/Tab/OrderProductsView";
import OrderProductsEditRefactored from "../../kt-tabs/components/Tab/OrderProductsEditRefactored";
import OrderProductsMallFilters from "../../kt-tabs/components/Tab/OrderProductsMallFilters";
import { PaginationMode } from "../../kt-tabs/components/contexts/TabManagerContext";

// Local components for better mall integration
import LocalOrderProductsView from "./OrderProductsView";

import { useEffect, useState, useCallback, useMemo } from "react";

import { MallCartItemsList } from "./MallCartItemsList";
import { IMallCartItem, IMallProduct, IMallCurrency } from "../contexts/MallOrderCreateContext";
import { useFormContext } from "react-hook-form";
import { IMallCurrency as ILocalCurrency } from "../utils/formatCurrency";
import { priceFormatter } from 'dash-utils';



const ListComponent: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute, resourceConfig }) => {
    const tab = useRecordContext<ITab>();

  
    return <>{tab.order?.items?.reduce((acc, item) => acc + (item.quantity || 0), 0) || 0}</>
}

const MallOrderProductsEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute, pagination, resourceConfig }) => {
    const tab: ITab = useRecordContext();

    return <Box sx={{ flex: 1, backgroundColor: 'transparent' }} className="kt-mall-order-products-edit-component">
                    <OrderProductsMallFilters storesPath="public/mall/stores"  >
                        <OrderProductsEditRefactored 
                            paginationMode={pagination || PaginationMode.INFINITE_SCROLL}
                            showPrice={true} 
                            productsResource="public/mall/products" 
                            attribute={attribute} 
                            method={method} 
                            resourceConfig={resourceConfig} 
                            record={tab} 
                        />
                    </OrderProductsMallFilters>
                </Box>
};

/**
 * MallOrderEditItems - Edit mode component with inline editing
 * Converts existing order items to cart format and provides handlers
 */
const MallOrderEditItems: React.FC<{ tab: ITab }> = ({ tab }) => {
    const form = useFormContext();
    
    // Convert order items to cart items format
    const convertOrderItemsToCartItems = useCallback((items: ITab['order']['items']): IMallCartItem[] => {
        if (!items) return [];
        
        return items.map((item, index) => {
            // Get prices from product or create default
            const productPrices = item.product?.prices?.map(p => ({
                id: p.id || 0,
                price: String(p.price),
                product_id: item.product_id,
                pricelist_id: p.pricelist_id || 0,
                pricelist: {
                    id: p.pricelist?.id || 0,
                    tenant_id: p.pricelist?.tenant_id || tab.tenant_id,
                    currency_id: p.pricelist?.currency_id || tab.order?.currency_id || 0,
                    name: p.pricelist?.name || 'Default',
                    is_primary: (p.pricelist as any)?.is_primary ?? true,
                    is_internal: (p.pricelist as any)?.is_internal ?? false,
                    currency: {
                        id: p.pricelist?.currency?.id || 0,
                        code: p.pricelist?.currency?.code || 'CLP',
                        symbol: p.pricelist?.currency?.symbol || '$',
                        format: (p.pricelist?.currency as any)?.format || ','
                    }
                }
            })) || [{
                id: 0,
                price: item.unit_price,
                product_id: item.product_id,
                pricelist_id: tab.order?.pricelist_id || 0,
                pricelist: {
                    id: tab.order?.pricelist_id || 0,
                    tenant_id: tab.tenant_id,
                    currency_id: tab.order?.currency_id || 0,
                    name: 'Default',
                    is_primary: true,
                    is_internal: false,
                    currency: {
                        id: tab.order?.currency_id || 0,
                        code: 'CLP',
                        symbol: '$',
                        format: ','
                    }
                }
            }];

            // Convert product to IMallProduct format
            const product: IMallProduct = {
                id: item.product_id,
                tenant_id: item.product?.tenant_id || tab.tenant_id,
                sku: item.product?.sku || '',
                name: item.product_name || item.product?.name || '',
                description: item.product?.description || '',
                category_id: item.product?.category_id || 0,
                brand_id: (item.product as any)?.brand_id || 0,
                is_pack: item.product?.is_pack || false,
                is_enabled: true,
                featured: false,
                mall_listed: true,
                infinite_stock: true,
                prices: productPrices,
                gallery: item.product?.gallery ? {
                    id: item.product.gallery.id || 0,
                    title: item.product.gallery.title || '',
                    tenant_id: item.product.gallery.tenant_id || tab.tenant_id,
                    images: (item.product.gallery.images || []).map(img => ({
                        id: img.id,
                        url: img.url || ''
                    })),
                    primary_image_url: (item.product.gallery as any).primary_image_url || item.product.gallery.images?.[0]?.url || '',
                    images_count: (item.product.gallery as any).images_count || item.product.gallery.images?.length || 0,
                    has_images: (item.product.gallery as any).has_images ?? (item.product.gallery.images?.length > 0),
                } : undefined,
                // Cast to any because TypeScript interface doesn't include options in modifier_groups
                modifier_groups: item.product?.modifier_groups?.map((mg: any) => ({
                    id: mg.id,
                    tenant_id: mg.tenant_id,
                    name: mg.name,
                    type: mg.type,
                    is_required: mg.is_required,
                    min_selections: mg.min_selections,
                    max_selections: mg.max_selections,
                    options: mg.options?.map((opt: any) => ({
                        id: opt.id,
                        name: opt.name,
                        price_adjustment: opt.price_adjustment
                    }))
                }))
            };

            // Convert modifiers to selectedModifiers format
            // Need to find the group ID by looking up the option in the product's modifier_groups
            const selectedModifiers: Record<number, number[]> = {};
            item.modifiers?.forEach(mod => {
                // First try to get groupId from modifier_option if available
                let groupId = (mod.modifier_option as any)?.modifier_group_id;
                
                // If not available, look up the option in the product's modifier_groups
                if (!groupId && item.product?.modifier_groups) {
                    for (const group of item.product.modifier_groups) {
                        // Cast to any because TypeScript interface doesn't include options
                        const groupWithOptions = group as any;
                        const foundOption = groupWithOptions.options?.find((opt: any) => opt.id === mod.modifier_option_id);
                        if (foundOption) {
                            groupId = group.id;
                            break;
                        }
                    }
                }
                
                if (groupId) {
                    if (!selectedModifiers[groupId]) {
                        selectedModifiers[groupId] = [];
                    }
                    selectedModifiers[groupId].push(mod.modifier_option_id);
                }
            });

            // Calculate line total
            const basePrice = parseFloat(item.unit_price) || 0;
            const modifiersTotal = item.modifiers?.reduce((sum, mod) => {
                return sum + (parseFloat(mod.price_adjustment) || 0);
            }, 0) || 0;
            const lineTotal = (basePrice + modifiersTotal) * item.quantity;

            return {
                uniqueId: `order-item-${item.id || index}`,
                product,
                quantity: item.quantity,
                selectedModifiers,
                note: item.note || undefined,
                lineTotal,
            };
        });
    }, [tab.tenant_id, tab.order?.pricelist_id, tab.order?.currency_id]);

    // State for cart items (initialized from order)
    const [cartItems, setCartItems] = useState<IMallCartItem[]>(() => 
        convertOrderItemsToCartItems(tab.order?.items || [])
    );

    // Get currency from first item or default
    const currency = useMemo((): IMallCurrency => {
        const firstItem = cartItems[0];
        if (firstItem?.product?.prices?.[0]?.pricelist?.currency) {
            return firstItem.product.prices[0].pricelist.currency;
        }
        return { id: 0, code: 'CLP', symbol: '$', format: ',', decimals: 0 };
    }, [cartItems]);

    // Format price function using centralized priceFormatter
    const formatPrice = useCallback((amount: number | string | undefined | null, curr?: IMallCurrency): string => {
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : (amount || 0);
        if (isNaN(numAmount)) return `${currency?.symbol || '$'}0`;
        const currencyCode = (curr || currency)?.code || 'CLP';
        return priceFormatter(numAmount, currencyCode);
    }, [currency]);

    // Get product price
    const getProductPrice = useCallback((product: IMallProduct): number => {
        if (!product.prices || product.prices.length === 0) return 0;
        const primaryPrice = product.prices.find(p => p.pricelist?.is_primary);
        if (primaryPrice) return parseFloat(primaryPrice.price) || 0;
        return parseFloat(product.prices[0].price) || 0;
    }, []);

    // Calculate line total for an item
    const calculateLineTotal = useCallback((item: IMallCartItem): number => {
        const basePrice = getProductPrice(item.product);
        const modifiersTotal = Object.entries(item.selectedModifiers).reduce((sum, [groupId, optionIds]) => {
            const group = item.product.modifier_groups?.find(g => g.id === Number(groupId));
            if (!group) return sum;
            return sum + optionIds.reduce((optSum, optId) => {
                const option = group.options?.find(o => o.id === optId);
                return optSum + (parseFloat(option?.price_adjustment || '0') || 0);
            }, 0);
        }, 0);
        return (basePrice + modifiersTotal) * item.quantity;
    }, [getProductPrice]);

    // Update form when cart changes
    const syncToForm = useCallback((items: IMallCartItem[]) => {
        if (!form) return;
        
        // Convert cart items back to API format for form submission
        const formItems = items.map(item => ({
            product_id: item.product.id,
            quantity: item.quantity,
            unit_price: getProductPrice(item.product).toString(),
            note: item.note || '',
            modifiers: Object.entries(item.selectedModifiers).flatMap(([groupId, optionIds]) => {
                const group = item.product.modifier_groups?.find(g => g.id === Number(groupId));
                return optionIds.map(optionId => {
                    const option = group?.options?.find(o => o.id === optionId);
                    return {
                        modifier_option_id: optionId,
                        modifier_group_id: Number(groupId),
                        price_adjustment: option?.price_adjustment || '0',
                    };
                });
            }),
        }));
        
        form.setValue('products', formItems, { shouldDirty: true });
    }, [form, getProductPrice]);

    // Handler: Update quantity
    const handleUpdateQuantity = useCallback((uniqueId: string, quantity: number) => {
        if (quantity < 1) return;
        setCartItems(prev => {
            const updated = prev.map(item => {
                if (item.uniqueId === uniqueId) {
                    const newItem = { ...item, quantity };
                    newItem.lineTotal = calculateLineTotal(newItem);
                    return newItem;
                }
                return item;
            });
            syncToForm(updated);
            return updated;
        });
    }, [calculateLineTotal, syncToForm]);

    // Handler: Remove item
    const handleRemoveFromCart = useCallback((uniqueId: string) => {
        setCartItems(prev => {
            const updated = prev.filter(item => item.uniqueId !== uniqueId);
            syncToForm(updated);
            return updated;
        });
    }, [syncToForm]);

    // Handler: Update cart item (modifiers and note)
    const handleUpdateCartItem = useCallback((uniqueId: string, modifiers: Record<number, number[]>, note?: string) => {
        setCartItems(prev => {
            const updated = prev.map(item => {
                if (item.uniqueId === uniqueId) {
                    const newItem = { 
                        ...item, 
                        selectedModifiers: modifiers,
                        note: note,
                    };
                    newItem.lineTotal = calculateLineTotal(newItem);
                    return newItem;
                }
                return item;
            });
            syncToForm(updated);
            return updated;
        });
    }, [calculateLineTotal, syncToForm]);

    // Get stores from items
    const stores = useMemo(() => {
        const storeMap = new Map<number, { id: number; name: string }>();
        cartItems.forEach(item => {
            const tenantId = item.product.tenant_id;
            if (!storeMap.has(tenantId)) {
                storeMap.set(tenantId, {
                    id: tenantId,
                    name: tab.tenant?.name || `Store ${tenantId}`,
                });
            }
        });
        return Array.from(storeMap.values());
    }, [cartItems, tab.tenant?.name]);

    return (
        <MallCartItemsList 
            items={cartItems}
            stores={stores as any}
            showStoreHeaders={true}
            showEmptyState={true}
            showClearButton={false}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveFromCart={handleRemoveFromCart}
            onUpdateCartItem={handleUpdateCartItem}
            formatPriceFn={formatPrice}
        />
    );
};

/**
 * MallOrderProducts - Custom field component for mall orders
 * Uses MallClientTabsContext (via child components) to get data without direct API calls
 */
const MallOrderProducts = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
    const tab: ITab = useRecordContext();

    switch (method) {
        case "edit":
            return (
                <Box sx={{ mt: 2, backgroundColor: 'transparent' }} className="kt-mall-order-products-edit">
                    {/* Progress and notifications now get data from MallClientTabsContext */}
                    {/*<MallSessionOrderProgress tabId={tab.id} />
                    <MallSessionOrderNotifications tabId={tab.id} />*/}
                    
                    {/* Cart items list with inline editing */}
                    <Box sx={{ mt: 2, backgroundColor: 'transparent' }} className="kt-mall-order-products-edit-items">
                        <MallOrderEditItems tab={tab} />
                    </Box>
                </Box>
            );
        case "create":
            return <MallOrderProductsEdit pagination={PaginationMode.INFINITE_SCROLL} method={method} attribute={attribute} resourceConfig={resourceConfig} />
        case "view":
            return <LocalOrderProductsView record={tab} resourceConfig={resourceConfig} attribute={undefined} method={"view"}  />
        case "list":
            return <div className="kt-mall-order-products-list"><ListComponent productsResource="public/mall/products" attribute={attribute} method={method} resourceConfig={resourceConfig} record={tab} /></div>
        default:
            return <></>;
    }
}

export default MallOrderProducts;