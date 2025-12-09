import React, { createContext, useContext, useState, useMemo, useCallback, ReactNode } from 'react';
import { useDataProvider, useNotify } from 'react-admin';
import { IKioskProduct, IKioskCartItem, IKioskCategory, IKioskSession, IKioskConfirmation } from '../interfaces/IKiosk';
import { formatCurrency } from 'kt-ecommerce';

interface KioskContextType {
    // Session
    session: IKioskSession | null;
    isLoadingSession: boolean;
    
    // Categories
    categories: IKioskCategory[];
    activeCategory: string | number;
    setActiveCategory: (categoryId: string | number) => void;
    isLoadingCategories: boolean;
    
    // Products
    products: IKioskProduct[];
    allProducts: IKioskProduct[];
    isLoadingProducts: boolean;
    currentPage: number;
    totalPages: number;
    setCurrentPage: (page: number) => void;
    ITEMS_PER_PAGE: number;
    
    // Cart
    cartItems: IKioskCartItem[];
    addToCart: (product: IKioskProduct, modifiers: Record<number, number[]>, note?: string) => void;
    removeFromCart: (uniqueId: string) => void;
    updateQuantity: (uniqueId: string, quantity: number) => void;
    clearCart: () => void;
    cartTotal: number;
    cartItemCount: number;
    
    // Modifier Modal
    selectedProduct: IKioskProduct | null;
    isModifierModalOpen: boolean;
    openModifierModal: (product: IKioskProduct) => void;
    closeModifierModal: () => void;
    
    // Order Flow
    deliveryMethod: 'counter' | 'table' | 'delivery';
    setDeliveryMethod: (method: 'counter' | 'table' | 'delivery') => void;
    tableNumber: string;
    setTableNumber: (value: string) => void;
    customerName: string;
    setCustomerName: (value: string) => void;
    orderNote: string;
    setOrderNote: (value: string) => void;
    
    // Order Submission
    submitOrder: () => Promise<IKioskConfirmation | null>;
    isSubmitting: boolean;
    confirmation: IKioskConfirmation | null;
    resetOrder: () => void;
    
    // View State
    currentView: 'menu' | 'cart' | 'confirmation';
    setCurrentView: (view: 'menu' | 'cart' | 'confirmation') => void;
    
    // Currency
    formatPrice: (amount: number | string | undefined | null) => string;
}

const KioskContext = createContext<KioskContextType | null>(null);

interface KioskProviderProps {
    children: ReactNode;
}

const ITEMS_PER_PAGE = 6; // 2 rows × 3 columns

export const KioskProvider: React.FC<KioskProviderProps> = ({ children }) => {
    const dataProvider = useDataProvider();
    const notify = useNotify();
    
    // Session State
    const [session, setSession] = useState<IKioskSession | null>(null);
    const [isLoadingSession, setIsLoadingSession] = useState(true);
    
    // Categories State
    const [categories, setCategories] = useState<IKioskCategory[]>([]);
    const [activeCategory, setActiveCategory] = useState<string | number>('popular');
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    
    // Products State
    const [allProducts, setAllProducts] = useState<IKioskProduct[]>([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    
    // Cart State
    const [cartItems, setCartItems] = useState<IKioskCartItem[]>([]);
    
    // Modifier Modal State
    const [selectedProduct, setSelectedProduct] = useState<IKioskProduct | null>(null);
    const [isModifierModalOpen, setIsModifierModalOpen] = useState(false);
    
    // Order State
    const [deliveryMethod, setDeliveryMethod] = useState<'counter' | 'table' | 'delivery'>('counter');
    const [tableNumber, setTableNumber] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [orderNote, setOrderNote] = useState('');
    
    // Submission State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmation, setConfirmation] = useState<IKioskConfirmation | null>(null);
    
    // View State
    const [currentView, setCurrentView] = useState<'menu' | 'cart' | 'confirmation'>('menu');

    // Load session on mount - use default session since kiosk endpoint not available
    React.useEffect(() => {
        const loadSession = async () => {
            try {
                // Set default session configuration
                setSession({
                    tenant: { id: 0, name: 'Kiosk', logo: null },
                    pricelist: null,
                    currency: { id: 1, code: 'CLP', symbol: '$' },
                    delivery_methods: [
                        { id: 'counter', name: 'Counter Pickup' },
                        { id: 'table', name: 'Table Service' },
                    ],
                });
            } catch (error) {
                console.error('Error loading kiosk session:', error);
            } finally {
                setIsLoadingSession(false);
            }
        };
        
        loadSession();
    }, []);

    // Load categories on mount using standard dataProvider
    React.useEffect(() => {
        const loadCategories = async () => {
            try {
                const response = await dataProvider.getList('ecommerce/category', {
                    pagination: { page: 1, perPage: 50 },
                    sort: { field: 'name', order: 'ASC' },
                    filter: {},
                });
                
                const mappedCategories: IKioskCategory[] = [
                    { id: 'popular', name: 'Popular', icon: '🔥', position: -1 },
                    ...response.data.map((cat: any) => ({
                        id: cat.id,
                        name: cat.name,
                        icon: cat.icon || '🍽️',
                        image: cat.image_url,
                        position: cat.tree_index || 0,
                    })),
                ];
                setCategories(mappedCategories);
            } catch (error) {
                console.error('Error loading categories:', error);
                setCategories([{ id: 'popular', name: 'All Products', icon: '🔥', position: -1 }]);
            } finally {
                setIsLoadingCategories(false);
            }
        };
        
        loadCategories();
    }, [dataProvider]);

    // Load products when category changes using standard dataProvider
    React.useEffect(() => {
        const loadProducts = async () => {
            setIsLoadingProducts(true);
            setCurrentPage(1);
            
            try {
                // Build filter for products API
                // Note: ProductsFilter expects camelCase field names (categoryId, not category_id)
                const filter: any = {
                    isEnabled: true,
                    load_modifier_groups: true,
                    load_gallery: true,
                    load_prices: true,
                    load_categories: true,
                };
                
                // Filter by category (use categoryId for ProductsFilter)
                if (activeCategory !== 'popular') {
                    filter.categoryId = activeCategory;
                }
                
                const response = await dataProvider.getList('ecommerce/product', {
                    pagination: { page: 1, perPage: 100 },
                    sort: { field: 'name', order: 'ASC' },
                    filter,
                });
                
                // Debug: Log first few products to see actual API response structure
                if (response.data.length > 0) {
                    // Find first product WITH an image to debug
                    const productWithImage = response.data.find((p: any) => 
                        p.gallery?.primary_image_url || p.gallery?.images?.length
                    );
                    const firstProd = response.data[0];
                    
                    console.log('🖼️ First product (may not have image):', {
                        id: firstProd.id,
                        name: firstProd.name,
                        gallery_id: firstProd.gallery_id,
                        gallery: firstProd.gallery,
                        'gallery.primary_image_url': firstProd.gallery?.primary_image_url,
                        'gallery.images': firstProd.gallery?.images,
                        'gallery.images[0]?.url': firstProd.gallery?.images?.[0]?.url,
                    });
                    
                    if (productWithImage && productWithImage.id !== firstProd.id) {
                        console.log('🖼️ First product WITH image:', {
                            id: productWithImage.id,
                            name: productWithImage.name,
                            gallery_id: productWithImage.gallery_id,
                            'gallery.primary_image_url': productWithImage.gallery?.primary_image_url,
                            'gallery.images': productWithImage.gallery?.images,
                            'gallery.images[0]?.url': productWithImage.gallery?.images?.[0]?.url,
                            resolved_image: productWithImage.gallery?.primary_image_url 
                                || productWithImage.gallery?.images?.[0]?.url 
                                || 'NO_IMAGE_FOUND',
                        });
                    }
                    
                    // Also log a summary of all products with/without images
                    const productsWithImages = response.data.filter((p: any) => 
                        p.gallery?.primary_image_url || p.gallery?.images?.length || p.primary_product_image_url || p.images?.length
                    ).length;
                    console.log(`📊 Products with images: ${productsWithImages}/${response.data.length}`);
                }
                
                const mappedProducts: IKioskProduct[] = response.data.map((prod: any) => {
                    // Parse price safely - API may return string or number
                    const rawPrice = prod.prices?.[0]?.price;
                    const price = typeof rawPrice === 'string' ? parseFloat(rawPrice) : (rawPrice ?? 0);
                    
                    // Get product image - check multiple sources:
                    // 1. gallery.primary_image_url (from GalleryResource)
                    // 2. gallery.images[0].url (fallback from gallery)
                    // 3. primary_product_image_url (product's own images via Spatie Media Library)
                    // 4. images[0].url (product's own images array)
                    const productImage = prod.gallery?.primary_image_url 
                        || prod.gallery?.images?.[0]?.url 
                        || prod.primary_product_image_url 
                        || prod.images?.[0]?.url
                        || null;
                    
                    return {
                        id: prod.id,
                        name: prod.name,
                        description: prod.description,
                        sku: prod.sku,
                        price: isNaN(price) ? 0 : price,
                        image: productImage,
                        category_id: prod.categories?.[0]?.id || prod.category_id,
                        has_modifiers: prod.modifier_groups?.length > 0,
                        modifiers: prod.modifier_groups?.map((group: any) => {
                            // Backend returns 'SINGLE' or 'MULTIPLE' (uppercase)
                            // Frontend expects 'single' or 'multiple' (lowercase)
                            const groupType = (group.type || 'SINGLE').toLowerCase() as 'single' | 'multiple';
                            
                            return {
                                id: group.id,
                                name: group.name,
                                type: groupType,
                                required: group.is_required || false,
                                min_selections: group.min_selections || 0,
                                max_selections: group.max_selections,
                                options: group.options?.map((opt: any) => ({
                                    id: opt.id,
                                    name: opt.name,
                                    // Backend returns price_adjustment as string
                                    price: parseFloat(opt.price_adjustment || '0') || 0,
                                })) || [],
                            };
                        }) || [],
                    };
                });
                
                // Debug: Log mapped products with images
                const mappedWithImages = mappedProducts.filter(p => p.image);
                console.log(`✅ Mapped products: ${mappedProducts.length} total, ${mappedWithImages.length} with images`);
                if (mappedWithImages.length > 0) {
                    console.log('✅ First mapped product with image:', {
                        id: mappedWithImages[0].id,
                        name: mappedWithImages[0].name,
                        image: mappedWithImages[0].image,
                    });
                }
                
                setAllProducts(mappedProducts);
            } catch (error) {
                console.error('Error loading products:', error);
                setAllProducts([]);
            } finally {
                setIsLoadingProducts(false);
            }
        };
        
        loadProducts();
    }, [dataProvider, activeCategory]);

    // Filter products by current page
    const products = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return allProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [allProducts, currentPage]);

    const totalPages = useMemo(() => {
        return Math.ceil(allProducts.length / ITEMS_PER_PAGE);
    }, [allProducts]);

    // Cart calculations
    const cartTotal = useMemo(() => {
        return cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    }, [cartItems]);

    const cartItemCount = useMemo(() => {
        return cartItems.reduce((sum, item) => sum + item.quantity, 0);
    }, [cartItems]);

    // Format price - use proper currency formatting like tabResource
    const formatPrice = useCallback((amount: number | string | undefined | null) => {
        const numericAmount = typeof amount === 'string' ? parseFloat(amount) : (amount ?? 0);
        const safeAmount = isNaN(numericAmount) ? 0 : numericAmount;
        
        // Use the currency from session if available
        const currency = session?.currency ? {
            code: session.currency.code || '',
            symbol: session.currency.symbol || '$',
            format: session.currency.format || '0,0.00'
        } : undefined;
        
        return formatCurrency(safeAmount, currency);
    }, [session]);

    // Cart actions
    const addToCart = useCallback((product: IKioskProduct, modifiers: Record<number, number[]>, note?: string) => {
        let modifierCost = 0;
        
        if (product.modifiers) {
            product.modifiers.forEach(group => {
                const selectedOptions = modifiers[group.id] || [];
                selectedOptions.forEach(optId => {
                    const option = group.options.find(o => o.id === optId);
                    if (option) modifierCost += option.price;
                });
            });
        }
        
        const newItem: IKioskCartItem = {
            uniqueId: `${product.id}_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            product,
            quantity: 1,
            selectedModifiers: modifiers,
            note,
            totalPrice: product.price + modifierCost,
        };
        
        setCartItems(prev => [...prev, newItem]);
        notify('Added to order', { type: 'success', autoHideDuration: 1500 });
    }, [notify]);

    const removeFromCart = useCallback((uniqueId: string) => {
        setCartItems(prev => prev.filter(item => item.uniqueId !== uniqueId));
    }, []);

    const updateQuantity = useCallback((uniqueId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(uniqueId);
            return;
        }
        
        setCartItems(prev => prev.map(item => {
            if (item.uniqueId === uniqueId) {
                // Recalculate total price based on new quantity
                const basePrice = item.product.price;
                let modifierCost = 0;
                
                if (item.product.modifiers) {
                    item.product.modifiers.forEach(group => {
                        const selectedOptions = item.selectedModifiers[group.id] || [];
                        selectedOptions.forEach(optId => {
                            const option = group.options.find(o => o.id === optId);
                            if (option) modifierCost += option.price;
                        });
                    });
                }
                
                return {
                    ...item,
                    quantity,
                    totalPrice: (basePrice + modifierCost) * quantity,
                };
            }
            return item;
        }));
    }, [removeFromCart]);

    const clearCart = useCallback(() => {
        setCartItems([]);
    }, []);

    // Modifier modal actions
    const openModifierModal = useCallback((product: IKioskProduct) => {
        setSelectedProduct(product);
        setIsModifierModalOpen(true);
    }, []);

    const closeModifierModal = useCallback(() => {
        setSelectedProduct(null);
        setIsModifierModalOpen(false);
    }, []);

    // Submit order using standard dataProvider
    const submitOrder = useCallback(async (): Promise<IKioskConfirmation | null> => {
        if (cartItems.length === 0) {
            notify('Cart is empty', { type: 'warning' });
            return null;
        }
        
        setIsSubmitting(true);
        
        try {
            // Use the tab API to create an order
            const response = await dataProvider.create('tab/tab', {
                data: {
                    delivery_method: deliveryMethod,
                    note: orderNote,
                    products: cartItems.map(item => ({
                        product_id: item.product.id,
                        quantity: item.quantity,
                        unit_price: item.product.price,
                        modifiers: Object.values(item.selectedModifiers)
                            .flat()
                            .map(optId => ({ modifier_option_id: optId })),
                        note: item.note,
                    })),
                },
            });
            
            const conf: IKioskConfirmation = {
                id: response.data.id,
                ticket_number: String(response.data.id).padStart(3, '0'),
                total: cartTotal,
                status: 'CONFIRMED',
            };
            setConfirmation(conf);
            setCurrentView('confirmation');
            return conf;
        } catch (error) {
            console.error('Error submitting order:', error);
            notify('Failed to submit order. Please try again.', { type: 'error' });
            return null;
        } finally {
            setIsSubmitting(false);
        }
    }, [cartItems, deliveryMethod, orderNote, dataProvider, notify, cartTotal]);

    // Reset for new order
    const resetOrder = useCallback(() => {
        setCartItems([]);
        setDeliveryMethod('counter');
        setTableNumber('');
        setCustomerName('');
        setOrderNote('');
        setConfirmation(null);
        setCurrentView('menu');
        setCurrentPage(1);
    }, []);

    const contextValue: KioskContextType = {
        // Session
        session,
        isLoadingSession,
        
        // Categories
        categories,
        activeCategory,
        setActiveCategory,
        isLoadingCategories,
        
        // Products
        products,
        allProducts,
        isLoadingProducts,
        currentPage,
        totalPages,
        setCurrentPage,
        ITEMS_PER_PAGE,
        
        // Cart
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartItemCount,
        
        // Modifier Modal
        selectedProduct,
        isModifierModalOpen,
        openModifierModal,
        closeModifierModal,
        
        // Order Flow
        deliveryMethod,
        setDeliveryMethod,
        tableNumber,
        setTableNumber,
        customerName,
        setCustomerName,
        orderNote,
        setOrderNote,
        
        // Order Submission
        submitOrder,
        isSubmitting,
        confirmation,
        resetOrder,
        
        // View State
        currentView,
        setCurrentView,
        
        // Currency
        formatPrice,
    };

    return (
        <KioskContext.Provider value={contextValue}>
            {children}
        </KioskContext.Provider>
    );
};

export const useKiosk = (): KioskContextType => {
    const context = useContext(KioskContext);
    if (!context) {
        throw new Error('useKiosk must be used within a KioskProvider');
    }
    return context;
};

export default KioskContext;
