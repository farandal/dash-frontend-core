import { 
    Box, 
    FormGroup, 
    FormControlLabel, 
    Checkbox, 
    Typography, 
    Paper, 
    Chip, 
    LinearProgress, 
    Avatar,
    Drawer,
    IconButton,
    Card,
    CardMedia,
    Divider,
    Button,
    CardContent,
    CardActions,
    Portal
} from "@mui/material";
import { useState, useEffect, useCallback, PropsWithChildren } from "react";
import { useGetList, useRecordContext, useTranslate, GetListResult, useDataProvider } from 'react-admin';
import { useTabManager } from '../contexts/TabManagerContext';
import CloseIcon from '@mui/icons-material/Close';
import { Add as AddIcon, ShoppingCart as ShoppingCartIcon, SupportAgent as AssistanceIcon } from '@mui/icons-material';
import { formatPrice, getProductImage, getPrimaryPrice, getProductCurrency } from '../helpers/product';

// Swiper components and styles
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
import DASHModal from "dash-modal";
import { useAxios } from "dash-axios-hook";
import { dashStorage } from 'dash-utils';
// Flag to use mock data or real backend data
const USE_MOCK_DATA = false;

// Store Item Interface based on API response structure
interface Product {
    id: number;
    tenant_id: number;
    sku: string;
    name: string;
    description: string;
    category_id: number;
    brand_id: number;
    is_pack: boolean;
    is_enabled: boolean;
    featured: boolean;
    mall_listed: boolean;
    infinite_stock: boolean;
    prices: Array<{
        id: number;
        price: string;
        product_id: number;
        pricelist_id: number;
        pricelist: {
            id: number;
            tenant_id: number;
            currency_id: number;
            name: string;
            is_primary: boolean;
            is_internal: boolean;
            currency: {
                id: number;
                code: string;
                symbol: string;
                format: string;
            }
        }
    }>;
    gallery: {
        id: number;
        title: string;
        tenant_id: number;
        images: Array<{
            id: number;
            url: string;
        }>;
        primary_image_url: string;
        images_count: number;
        has_images: boolean;
    };
    modifier_groups: Array<{
        id: number;
        tenant_id: number;
        name: string;
        type: string;
        is_required: boolean;
        min_selections: number;
        max_selections: number | null;
    }>;
}

interface StoreItem {
    id: number;
    name: string;
    public_id: string;
    public_name: string | null;
    address: string | null;
    banner_url: string;
    contact_email: string | null;
    contact_name: string | null;
    contact_phone: string | null;
    currencies: Array<{
        id: number;
        code: string;
        symbol: string;
        format: string;
    }>;
    currency_ids: number[];
    currency_primary_id: number;
    horizontal_logo_url: string;
    long_description: string;
    mobile: string | null;
    phone: string | null;
    settings: {
        assistance_available: boolean;
        store_available: boolean;
        [key: string]: any;
    };
    short_description: string | null;
    squared_logo_url: string;
    products: Product[]; // Added products attribute
    systemMarketplaces: Array<{
        id: number;
        class: string;
        name: string;
        [key: string]: any;
    }>;
    systemPointOfSales: Array<{
        id: number;
        class: string;
        [key: string]: any;
    }>;
}


// Mock Store List with 30 stores for testing horizontal scroll
const MOCK_STORES_LIST: StoreItem[] = Array.from({ length: 30 }, (_, index) => ({
    id: index + 1,
    name: `Store ${index + 1}`,
    public_id: `${77000000 + index}-${index % 10}`,
    public_name: index % 3 === 0 ? `Public Store ${index + 1}` : null,
    address: index % 4 === 0 ? `Address ${index + 1}, Street ${index}` : null,
    banner_url: `https://picsum.photos/800/400?random=${index + 1}`,
    contact_email: index % 5 === 0 ? `contact${index + 1}@store.com` : null,
    contact_name: index % 6 === 0 ? `Contact Person ${index + 1}` : null,
    contact_phone: index % 7 === 0 ? `+1-555-${1000 + index}` : null,
    currencies: [{
        id: 5,
        code: "USD",
        symbol: "$",
        format: ","
    }],
    currency_ids: [5],
    currency_primary_id: 5,
    horizontal_logo_url: `https://picsum.photos/400/120?random=${index + 100}`,
    long_description: `This is a detailed description for Store ${index + 1}. We offer excellent products and services with a focus on quality and customer satisfaction. Our store has been serving the community for years.`,
    mobile: index % 8 === 0 ? `+1-555-${2000 + index}` : null,
    phone: index % 9 === 0 ? `+1-555-${3000 + index}` : null,
    settings: {
        internal_stock_copy_strategy: index % 2 === 0,
        auto_republish_errored_products: index % 3 === 0,
    },
    short_description: `Store ${index + 1} - Quality products`,
    squared_logo_url: `https://picsum.photos/200/200?random=${index + 200}`,
    systemMarketplaces: [{
        id: 3,
        class: "Domain\\App\\Services\\ECommerce\\Marketplaces\\Dash\\DashService",
        name: "Dash",
    }],
    systemPointOfSales: [{
        id: 2,
        class: "Domain\\App\\Services\\ECommerce\\PointsOfSales\\Manual\\ManualPosServiceProvider",
    }],
    products: []
}));

export interface IOrderProductsMallFilters extends PropsWithChildren {
    storesPath: string;
}

const FEATURED_PRODUCTS_COUNT = 3;

const OrderProductsMallFilters: React.FC<IOrderProductsMallFilters> = (props) => {

    const {storesPath, children } = props;
    const translate = useTranslate();
    const { searchFilters, setSearchFilters, clearMainCache, isLoading, handleProductClick } = useTabManager();
   
    const record = useRecordContext();
    const debug = true; //process.env.NODE_ENV !== 'production';
   
     // First, get the first page to know total count
     const { data: storesListBackend, total, isLoading: loadingStores, error } = useGetList<StoreItem, GetListResult>(
       storesPath,
        {
          pagination: { page: 1, perPage: 100 },
           ...!debug ? { meta: {
            cache: true
           }
          } : {}
        },
        /* @ts-ignore */
        /*{
            ...!debug ? { 
                cacheTime: 10800000 
            } : {}
        }*/
        
      );

    const [simpleCloseDialogOpen, setSimpleCloseDialogOpen] = useState(false);

    // Use mock data or backend data based on flag
    const storesList = USE_MOCK_DATA ? MOCK_STORES_LIST : storesListBackend;
    
    // Local state for selected tenants and drawer
    const [selectedTenants, setSelectedTenants] = useState<number[]>([]);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedStore, setSelectedStore] = useState<StoreItem | null>(null);
    
    // Initialize with all active tenants selected
    useEffect(() => {
        if(!storesList) { return }
     
        const preSelectedTenantIds = []; //storesList.filter(tenant => tenant.preSelected).map(tenant => tenant.id);
        //setSelectedTenants(activeTenantIds);
        
        // Set initial search filters
        setSearchFilters({
            ...searchFilters,
            ...preSelectedTenantIds && preSelectedTenantIds.length > 0 ? { tenant_ids: preSelectedTenantIds } : {tenant_ids:[]}
        });

    }, [storesList]); // Only run on mount

    // Handle tenant selection change
    const handleTenantChange = useCallback((tenantId: number, checked: boolean) => {
      
        setSelectedTenants(prev => {
            const newSelected = checked 
                ? [...prev, tenantId]
                : prev.filter(id => id !== tenantId);
            
                clearMainCache();
            // Update search filters in context
            setSearchFilters({
                ...searchFilters,
                 ...newSelected && newSelected.length > 0 ? { tenant_ids: newSelected } : { tenant_ids:[] }
            });
            
            return newSelected;
        });
    }, [searchFilters, setSearchFilters]);

    // Handle select all / deselect all
    const handleSelectAll = useCallback(() => {
        const activeTenantIds = storesList.map(tenant => tenant.id);//.filter(tenant => tenant.active).map(tenant => tenant.id);
        const allSelected = activeTenantIds.every(id => selectedTenants.includes(id));
        
        const newSelected = allSelected ? [] : activeTenantIds;
   
        setSelectedTenants(newSelected);
        
        setSearchFilters({
            ...searchFilters,
            tenant_ids: newSelected
        });
    }, [selectedTenants, searchFilters, setSearchFilters]);

    // Handle store avatar click
    const handleStoreClick = useCallback((store: StoreItem) => {
        setSelectedStore(store);
        setDrawerOpen(true);
    }, []);

    // Handle drawer close
    const handleDrawerClose = useCallback(() => {
        setDrawerOpen(false);
        setSelectedStore(null);
    }, []);
   
    // Get featured products for selected store
    /*const { data: featuredProducts, isLoading: loadingProducts } = useGetList(
        'public/mall/products',
        {
            pagination: { page: 1, perPage: FEATURED_PRODUCTS_COUNT },
            filter: selectedStore ? { tenant_ids: [selectedStore.id] } : {},
        },
        {
            enabled: !!selectedStore,
            // @ts-ignore 
            cacheTime: 10800000 // 3 hours in milliseconds
        }
    );*/
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
    useEffect(()=> {
        if(loadingStores && !storesListBackend) { return }
        
        console.log('storesListBackend:',selectedStore, storesListBackend);
        const store_id = selectedStore ? selectedStore.id : null;
        const featuredProducts = storesListBackend.find(store => store.id === store_id)?.products || [];
       
        setFeaturedProducts(featuredProducts);
    },[storesListBackend,selectedStore]);

    // Handle adding product to tab
    const handleAddProductToTab = (product: any) => {
          
        
            handleProductClick(product);
       
    };

    const dataProvider = useDataProvider();
    const axios = useAxios();
    const [assistanceLoading, setAssistanceLoading] = useState(false);
    const [assistanceModalOpen, setAssistanceModalOpen] = useState(false);
    const [assistanceModalVariant, setAssistanceModalVariant] = useState<'info' | 'danger'>('info');
    const [assistanceModalMessage, setAssistanceModalMessage] = useState('');

    // Handle assistance request
    const handleRequestAssistance = useCallback(async (retry: boolean = false) => {
        if (!selectedStore) return;
        
        setAssistanceLoading(true);
        
        try {
            // Extract customer data from localStorage
            const orderData = dashStorage.getItem('orderData');
            const { name, tableNumber } = orderData ? JSON.parse(orderData) : { name: null, tableNumber: null };
                
            if (!name || !tableNumber) {
                window.dispatchEvent(new CustomEvent('enter-public-order-data', {
                    detail: {
                        onConfirm: () => handleRequestAssistance(false)
                    }
                }));
                return;
            }

            /*if (!retry) {
                window.dispatchEvent(new MessageEvent('DASHGlobalErrorIgnore'));
            }*/

            // @deprecated - removed currentAppPath logic, use mall-session-hash instead
            const session_hash = dashStorage.getItem('mall-session-hash');
            
            const {data} = await axios.post(
                `${storesPath}/${selectedStore.id}/assistance`,
                {
                    session_hash: session_hash,
                    customer_name: name,
                    table_number: tableNumber,
                    store_id: selectedStore.id,
                    timestamp: new Date().toISOString()
                }
            );
       
            // Success response - data.data contains the actual response data
            setAssistanceModalVariant('info');
            setAssistanceModalMessage(data.message || translate('tab.assistance.success_message'));
            setAssistanceModalOpen(true);
            
        } catch (error: any) {
            if (error?.status === 429) {
                return;
            }
            if (error?.status === 422 && !retry) {
                // Only show the data entry modal on first 422 error, not on retry
                window.dispatchEvent(new CustomEvent('enter-public-order-data', {
                    detail: {
                        onConfirm: () => handleRequestAssistance(true) // Retry after data entry
                    }
                }));
            } else {
                // Show error for other status codes or retry failures
                setAssistanceModalVariant('danger');
                const errorMessage = error?.body?.message || 
                                error?.message || 
                                translate('tab.assistance.error_message');
                setAssistanceModalMessage(errorMessage);
                setAssistanceModalOpen(true);
            }
        } finally {
            setAssistanceLoading(false);
        }
    }, [selectedStore, storesPath, dataProvider, translate]);

    if(!USE_MOCK_DATA && loadingStores && !storesListBackend) {
        return <LinearProgress/>
       
    }

    if(!storesList) {
        return <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
            <Typography>No stores available</Typography>
        </Paper>
    }


    const activeTenants = storesList;//.filter(tenant => tenant.active);
    const allSelected = activeTenants.every(tenant => selectedTenants.includes(tenant.id));
    const someSelected = activeTenants.some(tenant => selectedTenants.includes(tenant.id));

    return (
        <>
            <Box sx={{  display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Header */}
                <Box sx={{ position: 'absolute', top:10, right:10 }}>
                    {/*selectedTenants.length > 0 && 
                    selectedTenants.map(tenantId => {
                                const tenant = storesList.find(t => t.id === tenantId);
                                return tenant ? (
                                    <Chip
                                        key={tenantId}
                                        label={tenant.name}
                                        size="small"
                                        color="primary"
                                        variant="filled"
                                        onDelete={() => handleTenantChange(tenantId, false)}
                                    />
                                ) : null;
                            })*/}
                   
                 
                        
                             
                    <Chip 
                        label={`(${selectedTenants.length} / ${activeTenants.length})`}
                        color={selectedTenants.length === 0 ? "error" : "primary"}
                        variant="filled"
                        size="small"
                        avatar={
                            <Checkbox
                                disabled={isLoading}
                                checked={allSelected}
                                indeterminate={someSelected && !allSelected}
                                onChange={handleSelectAll}
                                color="primary"
                                size="small"
                                sx={{ p: 0.5 }}
                            />
                        }
                    />

                </Box>

                {/* Tenant Selection */}
             
                   
                        {/* Select All option */}
                        
                        {/* Store avatars carousel with Swiper */}
                        <Box sx={{ mt: 1, mb: 1 }}>
                            <Swiper
                                modules={[FreeMode]}
                                spaceBetween={16}
                                slidesPerView="auto"
                                freeMode={true}
                                grabCursor={true}
                                style={{
                                    paddingLeft: '4px',
                                    paddingRight: '4px',
                                    paddingBottom: '8px'
                                }}
                            >
                                 <FormGroup>
                                {storesList.map((store: StoreItem) => {
                                    const isSelected = selectedTenants.includes(store.id);
                                    return (
                                        <SwiperSlide 
                                            key={store.id}
                                            style={{ 
                                                width: 'auto',
                                                display: 'flex',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <Box sx={{ 
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: 0.5,
                                                minWidth: 80,
                                                position: 'relative'
                                            }}>
                                                <Box sx={{ position: 'relative' }}>
                                                    <Avatar
                                                        src={store.squared_logo_url}
                                                        alt={store.name}
                                                        onClick={() => handleStoreClick(store)}
                                                        sx={{
                                                            width: 64,
                                                            height: 64,
                                                            cursor: 'pointer',
                                                            border: isSelected ? '3px solid #1976d2' : '3px solid transparent',
                                                            transition: 'border-color 0.2s ease-in-out',
                                                            '&:hover': {
                                                                opacity: 0.8
                                                            }
                                                        }}
                                                    />
                                                    <Checkbox
                                                    disabled={isLoading}
                                                        checked={isSelected}
                                                        onChange={(e) => handleTenantChange(store.id, e.target.checked)}
                                                        size="small"
                                                        sx={{
                                                            position: 'absolute',
                                                            bottom: -8,
                                                            right: -8,
                                                            backgroundColor: 'white',
                                                            borderRadius: '50%',
                                                            padding: '2px',
                                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                                            '& .MuiSvgIcon-root': {
                                                                fontSize: '16px'
                                                            }
                                                        }}
                                                    />
                                                </Box>
                                                <Typography 
                                                    variant="caption" 
                                                    color="text.primary"
                                                    align="center"
                                                    sx={{ 
                                                        maxWidth: 80,
                                                        fontSize: '0.7rem',
                                                        lineHeight: 1.2,
                                                        wordBreak: 'break-word'
                                                    }}
                                                >
                                                    {store.name}
                                                </Typography>
                                            </Box>
                                        </SwiperSlide>
                                    );
                                })}
                                 </FormGroup>
                            </Swiper>

                        </Box>
                

                {/* Debug info (only in development) */}
                {/*process.env.NODE_ENV === 'development' && (
                    <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                        <Typography variant="caption" component="div">
                            <strong>Debug - Search Filters:</strong><br />
                            tenant_ids: [{selectedTenants.join(', ')}]
                        </Typography>
                    </Box>
                )*/}
            </Box>

            { storesListBackend && !loadingStores && children}


    <Portal><DASHModal
            variant={assistanceModalVariant}
            title={translate('tab.modal.assistance_dialog.title')}
            content={
                <Box>
                    <Typography sx={{ mb: 3 }}>
                        {assistanceModalMessage || translate('tab.modal.assistance_dialog.message')}
                    </Typography>
                </Box>
            }
            sx={{zIndex:100000}}
            open={assistanceModalOpen}
            showCloseButton={true}
            showCancelButton={false}
            showConfirmButton={false} // We handle buttons in content
            //cancelText={translate('common.cancel')}
            onClose={() => setAssistanceModalOpen(false)}
            //onCancel={() => setSimpleCloseDialogOpen(false)}
        /></Portal>

            {/* Store Details Drawer */}
            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={handleDrawerClose}
                sx={{
                    '& .MuiDrawer-paper': {
                        width: 400,
                        maxWidth: '90vw'
                    }
                }}
            >
                {selectedStore && (
                    <Box sx={{ p: 2 }}>
                        {/* Drawer Header */}
                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            mb: 2
                        }}>
                            <Typography variant="h6">
                                {selectedStore.name}
                            </Typography>
                            <IconButton onClick={handleDrawerClose} size="small">
                                <CloseIcon />
                            </IconButton>
                        </Box>

                        {/* Horizontal Logo */}
                        <Card sx={{ mb: 2 }}>
                            <CardMedia
                                component="img"
                                height="120"
                                image={selectedStore.horizontal_logo_url}
                                alt={selectedStore.name}
                                sx={{ 
                                    objectFit: 'contain',
                                    backgroundColor: 'grey.100'
                                }}
                            />
                        </Card>

                        <Divider sx={{ mb: 2 }} />

                        {/* Store Information */}
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {selectedStore.short_description}
                            </Typography>
                        </Box>

                        {/* Long Description */}
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.primary">
                                {selectedStore.long_description}
                            </Typography>
                        </Box>

                        <Divider sx={{ mb: 2 }} />
                        
                      
                        {/* Assistance Request Button */}
                        {selectedStore.settings?.assistance_available ? (
                            <Box sx={{ mb: 3 }}>
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    startIcon={<AssistanceIcon />}
                                    onClick={() => handleRequestAssistance(false)}
                                    disabled={assistanceLoading}
                                    fullWidth
                                    sx={{ 
                                        mb: 2,
                                        py: 1.5,
                                        borderColor: 'warning.main',
                                        color: 'warning.main',
                                        '&:hover': {
                                            borderColor: 'warning.dark',
                                            backgroundColor: 'warning.light',
                                            color: 'warning.dark'
                                        }
                                    }}
                                >
                                    {assistanceLoading 
                                        ? translate('tab.assistance.requesting') 
                                        : translate('tab.assistance.request_help')
                                    }
                                </Button>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
                                    {translate('tab.assistance.help_description')}
                                </Typography>
                            </Box>
                        ) : (
                            <Box sx={{ mb: 3 }}>
                                <Paper sx={{ p: 2, textAlign: 'center', }}>
                                    <Typography variant="body2" color="text.secondary">
                                        {translate('tab.assistance.not_available')}
                                    </Typography>
                                </Paper>
                            </Box>
                        )}

                        {/* Featured Products Section */}
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <ShoppingCartIcon />
                                {translate('tab.store.featured_products')}
                            </Typography>

                            {featuredProducts && featuredProducts.length > 0 ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {featuredProducts.slice(0, FEATURED_PRODUCTS_COUNT).map((product: any) => (
                                        <Card key={product.id} variant="outlined" sx={{ p: 1 }}>
                                            <Box sx={{ display: 'flex', gap: 2 }}>
                                                {/* Product Image */}
                                                <Avatar
                                                    src={getProductImage(product)}
                                                    alt={product.name}
                                                    sx={{ 
                                                        width: 60, 
                                                        height: 60,
                                                        borderRadius: 1
                                                    }}
                                                >
                                                    <ShoppingCartIcon />
                                                </Avatar>

                                                {/* Product Details */}
                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                    <Typography 
                                                        variant="subtitle2" 
                                                        sx={{ 
                                                            fontWeight: 'bold',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap'
                                                        }}
                                                    >
                                                        {product.name}
                                                    </Typography>
                                                    
                                                    <Typography 
                                                        variant="caption" 
                                                        color="text.secondary"
                                                        sx={{ 
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden',
                                                            lineHeight: 1.2,
                                                            mb: 1
                                                        }}
                                                    >
                                                        {product.description || product.short_description || translate('tab.product.no_description')}
                                                    </Typography>

                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Typography 
                                                            variant="subtitle2" 
                                                            color="primary"
                                                            sx={{ fontWeight: 'bold' }}
                                                        >
                                                            {formatPrice(
                                                                getPrimaryPrice(product),
                                                                getProductCurrency(product)
                                                            )}
                                                        </Typography>

                                                        <Button
                                                            size="small"
                                                            variant="contained"
                                                            startIcon={<AddIcon />}
                                                            onClick={() => handleAddProductToTab(product)}
                                                            sx={{ 
                                                                minWidth: 'auto',
                                                                px: 1,
                                                                fontSize: '0.75rem'
                                                            }}
                                                        >
                                                            {translate('tab.product.add')}
                                                        </Button>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </Card>
                                    ))}
                                </Box>
                            ) : (
                                <Paper sx={{ p: 2, textAlign: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        {translate('tab.store.no_products')}
                                    </Typography>
                                </Paper>
                            )}
                        </Box>

                        <Divider sx={{ mb: 2 }} />

                        {/* Additional Store Info */}
                        {/*<Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                Store ID
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {selectedStore.public_id}
                            </Typography>
                        </Box>*/}
                        
                    </Box>
                )}
            </Drawer>
        </>
    );
};

export default OrderProductsMallFilters;