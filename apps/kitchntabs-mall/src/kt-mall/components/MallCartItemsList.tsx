import React, { useState, useContext, useEffect } from 'react';
import { useTranslate } from 'react-admin';
import { 
    Box, 
    Typography, 
    IconButton,
    List,
    Avatar,
    Tooltip,
    Card,
    CardContent,
    Collapse,
    TextField,
    Select,
    MenuItem,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import MallOrderCreateContext, { IMallCartItem, IMallCurrency, IMallProduct } from '../contexts/MallOrderCreateContext';

const placeholder = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
import { IStore } from '../interfaces/IStore';

/**
 * Try to use context, but don't throw if not available
 * This allows components to work both with and without the provider
 */
const useMallOrderCreateOptional = () => {
    const context = useContext(MallOrderCreateContext);
    return context; // Returns null if not inside provider
};

/**
 * Default format price function when context is not available
 */
const defaultFormatPrice = (amount: number | string | undefined | null, currency?: IMallCurrency): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : (amount || 0);
    if (isNaN(numAmount)) return '$0';
    const symbol = currency?.symbol || '$';
    return `${symbol}${numAmount.toLocaleString()}`;
};

/**
 * Inline ProductModifiers component for cart items
 * Follows V1 ProductModifiers pattern with Select dropdowns
 * Can work with or without MallOrderCreateProvider
 */
interface InlineModifiersProps {
    item: IMallCartItem;
    onModifierChange: (modifiers: Record<number, number[]>) => void;
    // Optional props to override context
    formatPriceFn?: (amount: number | string | undefined | null, currency?: IMallCurrency) => string;
    currency?: IMallCurrency;
}

export const InlineModifiers: React.FC<InlineModifiersProps> = ({ 
    item, 
    onModifierChange,
    formatPriceFn,
    currency: currencyProp,
}) => {
    const context = useMallOrderCreateOptional();
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    
    // Use props if provided, otherwise fall back to context, then defaults
    const formatPrice = formatPriceFn || context?.formatPrice || defaultFormatPrice;
    const getProductCurrency = context?.getProductCurrency;
    
    const modifierGroups = item.product.modifier_groups || [];
    const currency = currencyProp || (getProductCurrency ? getProductCurrency(item.product) : undefined);

    if (modifierGroups.length === 0) return null;

    const handleGroupChange = (groupId: number, value: number | number[], isMultiple: boolean) => {
        const newModifiers = { ...item.selectedModifiers };
        
        if (isMultiple) {
            newModifiers[groupId] = value as number[];
        } else {
            // For single select, value 0 means "no selection"
            newModifiers[groupId] = (value && value !== 0) ? [value as number] : [];
        }
        
        onModifierChange(newModifiers);
    };

    return (
        <Box
            className="kt-mall-inline-modifiers"
            sx={{ display: 'flex', flexDirection: 'column', gap: isSmallScreen ? 1 : 1.5 }}
        >
            {modifierGroups.map((group) => {
                const selectedOptions = item.selectedModifiers[group.id] || [];
                const isMultiple = group.type === 'MULTIPLE';
                
                // For SINGLE, get single value (number or empty string); for MULTIPLE, get array
                // MUI Select needs consistent types - use 0 for "no selection" in single mode
                const value = isMultiple 
                    ? selectedOptions 
                    : (selectedOptions.length > 0 ? selectedOptions[0] : 0);

                return (
                    <Box key={group.id}>
                        <Typography 
                            variant="caption" 
                            fontWeight={600} 
                            color="text.secondary"
                            sx={{ display: 'block', mb: 0.5 }}
                        >
                            {group.name}{group.is_required ? ' *' : ''}
                        </Typography>
                        <Select
                            fullWidth
                            size={isSmallScreen ? "small" : "medium"}
                            multiple={isMultiple}
                            value={value}
                            onChange={(e) => handleGroupChange(group.id, e.target.value as any, isMultiple)}
                            displayEmpty
                            sx={{ 
                                fontSize: isSmallScreen ? '0.8rem' : '0.85rem',
                                '& .MuiSelect-select': { py: isSmallScreen ? 0.5 : 0.75 }
                            }}
                        >
                            {!group.is_required && !isMultiple && (
                                <MenuItem value={0}>
                                    <em>None</em>
                                </MenuItem>
                            )}
                            {group.options?.map((option) => {
                                const priceAdj = parseFloat(option.price_adjustment) || 0;
                                return (
                                    <MenuItem key={option.id} value={option.id}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                            <span>{option.name}</span>
                                            {priceAdj !== 0 && (
                                                <Typography
                                                    component="span"
                                                    variant="caption"
                                                    color={priceAdj > 0 ? 'success.main' : 'error.main'}
                                                    fontWeight={600}
                                                    sx={{ ml: 1 }}
                                                >
                                                    {priceAdj > 0 ? '+' : ''}{formatPrice(priceAdj, currency)}
                                                </Typography>
                                            )}
                                        </Box>
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    </Box>
                );
            })}
        </Box>
    );
};

/**
 * Cart item component with inline editing (V1 OrderProductsList pattern)
 * Can work with or without MallOrderCreateProvider
 */
interface CartItemProps {
    item: IMallCartItem;
    storeName?: string;
    isExpanded: boolean;
    onToggleExpand: () => void;
    // Optional props to override context - required when not using context
    onUpdateQuantity?: (uniqueId: string, quantity: number) => void;
    onRemoveFromCart?: (uniqueId: string) => void;
    onUpdateCartItem?: (uniqueId: string, modifiers: Record<number, number[]>, note?: string) => void;
    formatPriceFn?: (amount: number | string | undefined | null, currency?: IMallCurrency) => string;
    currency?: IMallCurrency;
}

export const CartItem: React.FC<CartItemProps> = ({ 
    item, 
    storeName, 
    isExpanded, 
    onToggleExpand,
    onUpdateQuantity,
    onRemoveFromCart,
    onUpdateCartItem,
    formatPriceFn,
    currency: currencyProp,
}) => {
    const translate = useTranslate();
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const context = useMallOrderCreateOptional();
    
    // Use props if provided, otherwise fall back to context
    const updateQuantity = onUpdateQuantity || context?.updateQuantity;
    const removeFromCart = onRemoveFromCart || context?.removeFromCart;
    const updateCartItem = onUpdateCartItem || context?.updateCartItem;
    const formatPrice = formatPriceFn || context?.formatPrice || defaultFormatPrice;
    const getProductCurrency = context?.getProductCurrency;
    
    const currency = currencyProp || (getProductCurrency ? getProductCurrency(item.product) : undefined);

    const [localNote, setLocalNote] = useState(item.note || '');
    
    // Sync local note state when item.note changes (e.g., from external updates)
    useEffect(() => {
        setLocalNote(item.note || '');
    }, [item.note]);

    // Get image URL from various possible locations (comprehensive fallback chain)
    const gallery = item.product.gallery as any;
    const imageUrl = (item.product as any).image_url ||
                     (item.product as any).primary_image_url ||
                     gallery?.primary_image_url || 
                     gallery?.images?.[0]?.url ||
                     gallery?.images?.[0]?.original_url ||
                     (item.product as any).thumbnail_url ||
                     (item.product as any).image ||
                     null;

    // Get store/tenant name from stores list or fallback
    const getStoreName = () => {
        if (storeName) return storeName;
        if ((item as IMallCartItem).product.tenant?.name) return (item as IMallCartItem).product.tenant.name;
        return null;
    };
    const tenantName = getStoreName();

    // Format modifiers for display
    const modifierDetails = Object.entries(item.selectedModifiers || {})
        .map(([groupId, optionIds]) => {
            const group = item.product.modifier_groups?.find(g => g.id === Number(groupId));
            if (!group) return null;
            
            return optionIds.map(optionId => {
                const option = group.options?.find(o => o.id === optionId);
                if (!option) return null;
                const price = parseFloat(option.price_adjustment) || 0;
                return { name: option.name, price };
            }).filter(Boolean);
        })
        .filter(Boolean)
        .flat();

    // Check if product has modifiers
    const hasModifiers = (item.product.modifier_groups?.length || 0) > 0;

    // Handle modifier change
    const handleModifierChange = (newModifiers: Record<number, number[]>) => {
        if (updateCartItem) {
            updateCartItem(item.uniqueId, newModifiers, localNote || undefined);
        }
    };

    // Handle note change (on blur)
    const handleNoteBlur = () => {
        if (localNote !== item.note && updateCartItem) {
            updateCartItem(item.uniqueId, item.selectedModifiers, localNote || undefined);
        }
    };

    return (
        <Card
            className="kt-mall-cart-item"
            sx={{ 
                m: isSmallScreen ? 0.25 : 1,
                border: '1px solid',
                borderColor: 'divider',
            }}
        >
            <CardContent sx={{ 
                p: isSmallScreen ? 0.75 : 2, 
                '&:last-child': { pb: isSmallScreen ? 0.75 : 2 } 
            }}>
                {/* Compact layout: image + name + controls in one row on small screens */}
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: isSmallScreen ? 0.75 : 2 
                }}>
                    {/* Product Image */}
                    {imageUrl ? (
                        <Box
                            component="img"
                            src={imageUrl}
                            alt={item.product.name}
                            sx={{ 
                                width: isSmallScreen ? 36 : 80, 
                                height: isSmallScreen ? 36 : 80, 
                                objectFit: 'cover',
                                borderRadius: 0.5,
                                flexShrink: 0,
                                //backgroundColor: 'grey.200',
                            }}
                            onError={(e: any) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling && (e.target.nextSibling.style.display = 'flex');
                            }}
                        />
                    ) : null}
                    {/* Fallback avatar when no image or image fails */}
                    <Avatar
                        variant="rounded"
                        sx={{ 
                            width: isSmallScreen ? 36 : 80, 
                            height: isSmallScreen ? 36 : 80, 
                            flexShrink: 0,
                            //backgroundColor: 'grey.200',
                            display: imageUrl ? 'none' : 'flex',
                        }}
                    >
                        <RestaurantIcon sx={{ color: 'grey.400', fontSize: isSmallScreen ? 20 : 40 }} />
                    </Avatar>

                    {/* Content Column */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        {/* Product name */}
                        <Typography 
                            variant={isSmallScreen ? "body2" : "subtitle1"} 
                            sx={{ 
                                fontWeight: 'bold',
                                fontSize: isSmallScreen ? '0.8rem' : undefined,
                                lineHeight: isSmallScreen ? 1.2 : 1.5,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {item.product.name}
                        </Typography>
                        
                        {/* Tenant/Store name */}
                        {tenantName && (
                            <Typography 
                                variant="caption" 
                                color="text.secondary"
                                sx={{ 
                                    display: 'block',
                                    fontSize: isSmallScreen ? '0.65rem' : '0.75rem',
                                    lineHeight: 1.2,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {tenantName}
                            </Typography>
                        )}
                        
                        {/* Quantity and Price Controls - inline on small screens */}
                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            mt: isSmallScreen ? 0.25 : 0.5
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                                <IconButton 
                                    onClick={() => updateQuantity && updateQuantity(item.uniqueId, item.quantity - 1)}
                                    disabled={!updateQuantity || item.quantity <= 1}
                                    size="small"
                                    sx={{ p: isSmallScreen ? 0.25 : 0.5 }}
                                >
                                    <RemoveIcon fontSize={isSmallScreen ? "small" : "medium"} />
                                </IconButton>
                                <Typography 
                                    variant="body2" 
                                    sx={{ 
                                        minWidth: isSmallScreen ? 20 : 30, 
                                        textAlign: 'center',
                                        fontSize: isSmallScreen ? '0.8rem' : '1rem',
                                        fontWeight: 600
                                    }}
                                >
                                    {item.quantity}
                                </Typography>
                                <IconButton 
                                    onClick={() => updateQuantity && updateQuantity(item.uniqueId, item.quantity + 1)}
                                    disabled={!updateQuantity}
                                    size="small"
                                    sx={{ p: isSmallScreen ? 0.25 : 0.5 }}
                                >
                                    <AddIcon fontSize={isSmallScreen ? "small" : "medium"} />
                                </IconButton>
                            </Box>
                            <Typography 
                                variant="body2" 
                                color="primary" 
                                fontWeight={700}
                                sx={{ fontSize: isSmallScreen ? '0.8rem' : '1rem' }}
                            >
                                {formatPrice(item.lineTotal, currency)}
                            </Typography>
                        </Box>

                        {/* Collapsed view: show modifier summary */}
                        {!isExpanded && modifierDetails.length > 0 && (
                            <Typography 
                                variant="caption" 
                                color="text.secondary" 
                                sx={{ 
                                    display: 'block',
                                    fontSize: isSmallScreen ? '0.65rem' : '0.75rem',
                                    lineHeight: 1.2
                                }}
                            >
                                {modifierDetails.map(m => m?.name).join(', ')}
                            </Typography>
                        )}
                        {!isExpanded && item.note && (
                            <Typography 
                                variant="caption" 
                                color="text.secondary" 
                                sx={{ 
                                    display: 'block', 
                                    fontStyle: 'italic',
                                    fontSize: isSmallScreen ? '0.65rem' : '0.75rem',
                                    lineHeight: 1.2
                                }}
                            >
                                {item.note}
                            </Typography>
                        )}
                    </Box>

                    {/* Action buttons - expand/delete */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                        <IconButton
                            size="small"
                            onClick={onToggleExpand}
                            sx={{ p: isSmallScreen ? 0.25 : 0.5 }}
                        >
                            {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                        </IconButton>
                        {/* TODO: Remove from cart only when order is in confirmed state */}
                        {/*removeFromCart && (
                            <IconButton
                                size="small"
                                onClick={() => removeFromCart(item.uniqueId)}
                                color="error"
                                sx={{ p: isSmallScreen ? 0.25 : 0.5 }}
                            >
                                <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                        )*/}
                    </Box>
                </Box>

                {/* Expandable Content: Inline editing */}
                <Collapse in={isExpanded}>
                    <Box sx={{ mt: isSmallScreen ? 1 : 2, pl: isSmallScreen ? 5 : 12 }}>
                                {/* Note Section */}
                                <TextField
                                    fullWidth
                                    size={isSmallScreen ? "small" : "medium"}
                                    placeholder={translate('mall.special_instructions_placeholder')}
                                    label={translate('mall.special_instructions')}
                                    value={localNote}
                                    onChange={(e) => setLocalNote(e.target.value)}
                                    onBlur={handleNoteBlur}
                                    multiline
                                    rows={isSmallScreen ? 2 : 3}
                                    sx={{ mb: isSmallScreen ? 1.5 : 2 }}
                                />

                                {/* Modifiers Section - Inline Select dropdowns */}
                                {hasModifiers && (
                                    <Box>
                                        <Typography 
                                            variant="body2" 
                                            color="text.secondary" 
                                            fontWeight={600}
                                            sx={{ mb: isSmallScreen ? 0.5 : 1 }}
                                        >
                                            {translate('mall.modifiers')}
                                        </Typography>
                                        <InlineModifiers
                                            item={item}
                                            onModifierChange={handleModifierChange}
                                        />
                                    </Box>
                                )}
                            </Box>
                        </Collapse>
            </CardContent>
        </Card>
    );
};

/**
 * MallCartItemsList - Reusable cart items list component
 * Can be used in drawer (with context) or directly in edit forms (with props)
 * 
 * Usage patterns:
 * 1. Inside MallOrderCreateProvider (drawer): <MallCartItemsList /> - uses context
 * 2. Outside provider (edit mode): <MallCartItemsList items={items} stores={stores} ... /> - uses props
 */
interface MallCartItemsListProps {
    showStoreHeaders?: boolean;
    showEmptyState?: boolean;
    showClearButton?: boolean;
    // Optional props to use instead of context (for edit mode)
    items?: IMallCartItem[];
    stores?: IStore[];
    onClearCart?: () => void;
    onUpdateQuantity?: (uniqueId: string, quantity: number) => void;
    onRemoveFromCart?: (uniqueId: string) => void;
    onUpdateCartItem?: (uniqueId: string, modifiers: Record<number, number[]>, note?: string) => void;
    formatPriceFn?: (amount: number | string | undefined | null, currency?: IMallCurrency) => string;
}

export const MallCartItemsList: React.FC<MallCartItemsListProps> = ({ 
    showStoreHeaders = true,
    showEmptyState = true,
    showClearButton = false,
    // Props for standalone usage (edit mode)
    items: itemsProp,
    stores: storesProp,
    onClearCart,
    onUpdateQuantity,
    onRemoveFromCart,
    onUpdateCartItem,
    formatPriceFn,
}) => {
    const translate = useTranslate();
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const context = useMallOrderCreateOptional();
    
    // Use props if provided, otherwise fall back to context
    const cartItems = itemsProp ?? context?.cartItems ?? [];
    const stores = storesProp ?? context?.stores ?? [];
    const clearCart = onClearCart ?? context?.clearCart;

    // Expanded state for inline editing (V1 pattern)
    const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({});

    const toggleItemExpansion = (uniqueId: string) => {
        setExpandedItems(prev => ({
            ...prev,
            [uniqueId]: !prev[uniqueId],
        }));
    };

    // Get store name from tenant ID
    const getStoreName = (tenantId: number) => {
        const store = stores.find(s => s.id === tenantId);
        return store?.name || `Store ${tenantId}`;
    };

    if (cartItems.length === 0 && showEmptyState) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 200,
                    p: 4,
                    color: 'text.secondary',
                }}
            >
                <Typography variant="h1" sx={{ mb: 2, opacity: 0.3 }}>🛒</Typography>
                <Typography variant="h6">{translate('mall.cart_empty')}</Typography>
                <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                    {translate('mall.add_products_to_continue')}
                </Typography>
            </Box>
        );
    }

    if (cartItems.length === 0) {
        return null;
    }

    return (
        <Box className="kt-mall-cart-items-list">
            {/* Items in flat list */}
            <List disablePadding>
                {cartItems.map((item) => (
                    <CartItem 
                        key={item.uniqueId}
                        item={item} 
                        storeName={item.product.tenant?.name} 
                        isExpanded={!!expandedItems[item.uniqueId]}
                        onToggleExpand={() => toggleItemExpansion(item.uniqueId)}
                        onUpdateQuantity={onUpdateQuantity}
                        onRemoveFromCart={onRemoveFromCart}
                        onUpdateCartItem={onUpdateCartItem}
                        formatPriceFn={formatPriceFn}
                    />
                ))}
            </List>

            {/* Clear cart button */}
            {showClearButton && clearCart && (
                <Box sx={{ p: isSmallScreen ? 1.5 : 2, pt: 0 }}>
                    <button
                        onClick={clearCart}
                        style={{
                            width: '100%',
                            padding: isSmallScreen ? '6px 12px' : '8px 16px',
                            border: '1px solid #d32f2f',
                            borderRadius: '8px',
                            backgroundColor: 'transparent',
                            color: '#d32f2f',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            fontSize: isSmallScreen ? '0.875rem' : '1rem',
                        }}
                    >
                        <DeleteOutlineIcon fontSize={isSmallScreen ? "small" : "medium"} />
                        {translate('mall.clear_cart')}
                    </button>
                </Box>
            )}
        </Box>
    );
};

export default MallCartItemsList;
