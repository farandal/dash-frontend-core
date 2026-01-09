import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, PropsWithChildren, useRef } from 'react';
import { useDataProvider, useNotify, useTranslate } from 'react-admin';
import { useFormContext } from 'react-hook-form';
import { useAxios } from 'dash-axios-hook';
import { dashStorage } from 'dash-utils';
import { useMediaQuery, useTheme } from '@mui/material';
import { useSelfServiceEcho } from './SelfServiceEchoContext';

// Interfaces adapted from Mall
export interface ISelfServiceCurrency {
    id?: number;
    code: string;
    symbol: string;
    format?: string;
    decimals?: number;
}

export interface ISelfServiceProduct {
    id: number;
    tenant_id: string;
    sku: string;
    name: string;
    description: string | null;
    category_id: number;
    is_enabled: boolean;
    featured: boolean;
    infinite_stock: boolean;
    prices: Array<{
        id: number;
        price: string;
        pricelist: {
            currency: {
                code: string;
                symbol: string;
                format: string;
            }
        }
    }>;
    gallery?: {
        primary_image_url: string;
    };
    modifier_groups?: Array<{
        id: number;
        name: string;
        type: string;
        is_required: boolean;
        min_selections: number;
        max_selections: number | null;
        options?: Array<{
            id: number;
            modifier_group_id: number;
            name: string;
            price_adjustment: string;
            is_default: boolean;
        }>;
    }>;
    primary_image?: string;
}

export interface ISelfServiceCartItem {
    uniqueId: string;
    product: ISelfServiceProduct;
    quantity: number;
    selectedModifiers: Record<number, number[]>;
    note?: string;
    lineTotal: number;
}

interface SelfServiceOrderCreateContextValue {
    // Products
    products: ISelfServiceProduct[];
    allProducts: ISelfServiceProduct[];
    isLoadingProducts: boolean;
    
    // Search
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    
    // Cart
    cartItems: ISelfServiceCartItem[];
    addToCart: (product: ISelfServiceProduct, modifiers?: Record<number, number[]>, note?: string) => void;
    removeFromCart: (uniqueId: string) => void;
    updateQuantity: (uniqueId: string, quantity: number) => void;
    clearCart: () => void;
    cartTotal: number;
    cartItemCount: number;
    
    // Drawer
    isCartDrawerOpen: boolean;
    setIsCartDrawerOpen: (open: boolean) => void;
    
    // Modifiers
    selectedProductForModifier: ISelfServiceProduct | null;
    editingCartItem: ISelfServiceCartItem | null; // Cart item being edited
    isModifierModalOpen: boolean;
    openModifierModal: (product: ISelfServiceProduct) => void;
    editCartItem: (cartItem: ISelfServiceCartItem) => void; // Open modal in edit mode
    updateCartItem: (uniqueId: string, modifiers: Record<number, number[]>, note?: string) => void;
    closeModifierModal: () => void;
    
    // Utils
    formatPrice: (amount: number | string) => string;
    
    // Order
    isSubmittingOrder: boolean;
    submitOrder: (customerName?: string, tableNumber?: string) => Promise<any>;
    
    // Data
    tenantData: any;
    refreshProducts: () => void;
}

const SelfServiceOrderCreateContext = createContext<SelfServiceOrderCreateContextValue | null>(null);

export const useSelfServiceOrderCreate = () => {
    const context = useContext(SelfServiceOrderCreateContext);
    if (!context) {
        throw new Error('useSelfServiceOrderCreate must be used within a SelfServiceOrderCreateProvider');
    }
    return context;
};

export const SelfServiceOrderCreateProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const { sessionHash } = useSelfServiceEcho();
    const axios = useAxios();
    const notify = useNotify();
    const translate = useTranslate();
    
    // State
    const [allProducts, setAllProducts] = useState<ISelfServiceProduct[]>([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);
    const [tenantData, setTenantData] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [cartItems, setCartItems] = useState<ISelfServiceCartItem[]>([]);
    const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
    const [selectedProductForModifier, setSelectedProductForModifier] = useState<ISelfServiceProduct | null>(null);
    const [editingCartItem, setEditingCartItem] = useState<ISelfServiceCartItem | null>(null);
    const [isModifierModalOpen, setIsModifierModalOpen] = useState(false);
    const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

    // Get session hash from storage
    const storedSessionHash = useMemo(() => dashStorage.getItem('selfservice-session-hash'), []);
    const effectiveHash = sessionHash || storedSessionHash;
    
    const fetchProducts = useCallback(async () => {
            if (!effectiveHash) {
                console.warn('No session hash found for fetching products');
                return;
            }
            
            setIsLoadingProducts(true);
            try {
                // Use new route: /public/selfservice/{hash}/products
                const response = await axios.get(`/public/selfservice/${effectiveHash}/products`);
                
                const products = response.data.data || response.data || [];
                setAllProducts(products);
                
                // Attempt to get tenant data if included
                if (response.data?.tenant) {
                    setTenantData(response.data.tenant);
                }
            } catch (error) {
                console.error('Error fetching products:', error);
                notify('Failed to load products', { type: 'error' });
            } finally {
                setIsLoadingProducts(false);
            }
    }, [axios, effectiveHash, notify]);

    const hasFetched = useRef(false);

    // Fetch products
    useEffect(() => {
        if (!hasFetched.current && effectiveHash) {
            hasFetched.current = true;
            fetchProducts();
        }
    }, [fetchProducts, effectiveHash]);

    const refreshProducts = useCallback(() => {
        fetchProducts();
    }, [fetchProducts]);
    
    // Filter products
    const products = useMemo(() => {
        if (!searchQuery.trim()) return allProducts;
        const query = searchQuery.toLowerCase();
        return allProducts.filter(p => 
            p.name.toLowerCase().includes(query) ||
            p.description?.toLowerCase().includes(query) ||
            p.sku?.toLowerCase().includes(query)
        );
    }, [allProducts, searchQuery]);

    // Cart Logic
    const addToCart = useCallback((product: ISelfServiceProduct, modifiers: Record<number, number[]> = {}, note?: string) => {
        const uniqueId = `${product.id}-${Date.now()}`;
        
        // Calculate price with modifiers
        let price = parseFloat(product.prices[0]?.price || '0');
        // Add modifier prices... (simplified for now)
        if (modifiers && product.modifier_groups) {
            for (const group of product.modifier_groups) {
                const selectedOptionIds = modifiers[group.id] || [];
                for (const optionId of selectedOptionIds) {
                    const option = group.options?.find(o => o.id === optionId);
                    if (option) {
                        price += parseFloat(option.price_adjustment || '0');
                    }
                }
            }
        }
        
        const newItem: ISelfServiceCartItem = {
            uniqueId,
            product,
            quantity: 1,
            selectedModifiers: modifiers,
            note,
            lineTotal: price
        };
        
        setCartItems(prev => [...prev, newItem]);
        setIsCartDrawerOpen(true);
        notify('Item added to cart', { type: 'success' });
    }, [notify]);

    const removeFromCart = useCallback((uniqueId: string) => {
        setCartItems(prev => prev.filter(item => item.uniqueId !== uniqueId));
    }, []);

    const updateQuantity = useCallback((uniqueId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(uniqueId);
            return;
        }
        setCartItems(prev => prev.map(item => 
            item.uniqueId === uniqueId ? { ...item, quantity } : item
        ));
    }, [removeFromCart]);

    const clearCart = useCallback(() => {
        setCartItems([]);
    }, []);

    const cartTotal = useMemo(() => {
        return cartItems.reduce((sum, item) => sum + (item.lineTotal * item.quantity), 0);
    }, [cartItems]);

    // Format Price Helper
    const formatPrice = useCallback((amount: number | string) => {
        const val = typeof amount === 'string' ? parseFloat(amount) : amount;
        return `$${val.toFixed(2)}`; // TODO: Use currency from product/tenant
    }, []);

    // Modifiers Modal
    const openModifierModal = useCallback((product: ISelfServiceProduct) => {
        setSelectedProductForModifier(product);
        setIsModifierModalOpen(true);
    }, []);

    const closeModifierModal = useCallback(() => {
        setIsModifierModalOpen(false);
        setSelectedProductForModifier(null);
        setEditingCartItem(null); // Clear editing state
    }, []);

    // Edit existing cart item
    const editCartItem = useCallback((cartItem: ISelfServiceCartItem) => {
        setSelectedProductForModifier(cartItem.product);
        setEditingCartItem(cartItem);
        setIsModifierModalOpen(true);
    }, []);

    // Update cart item modifiers/note
    const updateCartItem = useCallback((uniqueId: string, modifiers: Record<number, number[]>, note?: string) => {
        setCartItems(prev => prev.map(item => {
            if (item.uniqueId !== uniqueId) return item;
            
            // Recalculate line total with new modifiers
            let price = parseFloat(item.product.prices?.[0]?.price || '0');
            if (item.product.modifier_groups) {
                for (const group of item.product.modifier_groups) {
                    const selectedOptionIds = modifiers[group.id] || [];
                    for (const optionId of selectedOptionIds) {
                        const option = group.options?.find(o => o.id === optionId);
                        if (option) {
                            price += parseFloat(option.price_adjustment || '0');
                        }
                    }
                }
            }
            
            return {
                ...item,
                selectedModifiers: modifiers,
                note,
                lineTotal: price
            };
        }));
        notify('Item updated', { type: 'success' });
    }, [notify]);

    // Submit Order
    const submitOrder = useCallback(async (customerName?: string, tableNumber?: string) => {
        if (!sessionHash || cartItems.length === 0) {
            throw new Error('Cannot submit empty order or no session');
        }
        
        setIsSubmittingOrder(true);
        
        try {
            // Transform cart items to API format
            const orderProducts = cartItems.map(item => ({
                product_id: item.product.id,
                quantity: item.quantity,
                unit_price: item.lineTotal.toFixed(2),
                note: item.note,
                modifiers: Object.entries(item.selectedModifiers).flatMap(([groupId, optionIds]) =>
                    optionIds.map(optionId => ({
                        modifier_group_id: parseInt(groupId),
                        modifier_option_id: optionId,
                    }))
                ),
            }));
            
            const orderData = {
                selfservice_session: sessionHash,
                customer_name: customerName || 'Guest',
                table_number: tableNumber || '',
                products: orderProducts,
            };
            
            console.log('📤 SelfServiceOrderCreateContext: Submitting order:', orderData);
            
            // Post to /public/selfservice/{sessionHash}/tab
            const response = await axios.post(`/public/selfservice/${sessionHash}/tab`, orderData);
            
            console.log('✅ SelfServiceOrderCreateContext: Order submitted:', response.data);
            
            // Clear cart after successful order
            setCartItems([]);
            
            notify(translate('kiosk.order_submitted', { defaultValue: 'Order submitted successfully!' }), { type: 'success' });
            
            return response.data;
            
        } catch (err: any) {
            console.error('❌ SelfServiceOrderCreateContext: Order submission failed:', err);
            notify(err.message || 'Failed to submit order', { type: 'error' });
            throw err;
        } finally {
            setIsSubmittingOrder(false);
        }
    }, [sessionHash, cartItems, axios, notify, translate]);

    const value = {
        products,
        allProducts,
        isLoadingProducts,
        searchQuery,
        setSearchQuery,
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartItemCount: cartItems.length,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        selectedProductForModifier,
        editingCartItem,
        isModifierModalOpen,
        openModifierModal,
        editCartItem,
        updateCartItem,
        closeModifierModal,
        formatPrice,
        tenantData,
        refreshProducts,
        isSubmittingOrder,
        submitOrder
    };

    return (
        <SelfServiceOrderCreateContext.Provider value={value}>
            {children}
        </SelfServiceOrderCreateContext.Provider>
    );
};
