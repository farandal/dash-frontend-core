import { IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useEditContext, useRefresh, useTranslate } from "react-admin";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { useParams } from 'react-router-dom';
import { Add as AddIcon, Remove as RemoveIcon, Delete as DeleteIcon, Note as NoteIcon } from '@mui/icons-material'
import { CardContent, ListItem, List, IconButton, Typography, Box, Card, TextField, CircularProgress, LinearProgress, InputAdornment, Avatar, Chip } from "@mui/material";
import { ITab } from "../interfaces/ITab";
import ProductModifiers from './ProductModifiers';
import { useTabCache } from '../hooks/useProductsCache';
import { saveAs } from 'file-saver';
import { useTabActions } from '../hooks/useTabActions';
import TabActionButtons from './TabActionsButtons';
import dataProvider from 'dash-admin/src/providers/dataProvider';
import { toast } from 'react-toastify';
import { useAxios } from 'dash-axios-hook';
import React from 'react';
import { ImagePlaceHolder } from "kt-utils";
import { priceFormatter } from "dash-utils";
import VoiceTabAgent from "../voice/VoiceTabAgent";
import OrderSummary from "../tab2/components/OrderSummary";

const placeholder = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="

// ============================================================================
// INTERFACES
// ============================================================================

interface ProductItem {
    product_id: string;
    product: any;
    quantity: number;
    unit_price: string;
    note: string;
    modifiers: any[];
}

interface OrderSummaryProps {
    totalAmount: number;
    enableServiceFee?: boolean;
}

interface ProductListItemProps {
    product: ProductItem;
    index: number;
    onQuantityChange: (index: number, increment: boolean) => void;
    onRemoveProduct: (index: number) => void;
    onNoteChange: (index: number, note: string) => void;
    onModifierChange: (index: number, updatedModifiers: any[]) => void;
    showImage?: boolean;
}

interface OrderProductsListProps {
    products: ProductItem[];
    onQuantityChange: (index: number, increment: boolean) => void;
    onRemoveProduct: (index: number) => void;
    onNoteChange: (index: number, note: string) => void;
    onModifierChange: (index: number, updatedModifiers: any[]) => void;
    showImage?: boolean;
}

interface VoiceAction {
    action: 'add' | 'remove' | 'modify_quantity' | 'add_note';
    product_names: string[];
    quantity?: number;
    note?: string;
    confidence: number;
    resolved_products?: Array<{
        id: string;
        name: string;
        sku: string;
        price: string;
        product_data: any;
    }>;
    resolution_status?: 'found' | 'not_found' | 'multiple';
    suggested_modifiers?: Array<{
        product_id: string;
        modifier_group_id: string;
        modifier_option_id: string;
        modifier_group_name?: string;
        modifier_option_name?: string;
        detection_reason: string;
        confidence: number;
        matched_keywords?: string[];
        detection_type: string;
    }>;
    auto_added?: boolean;
    auto_added_reason?: string;
    ai_analysis?: string;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const calculateOrderTotal = (products: ProductItem[]): number => {
    if (!products || !Array.isArray(products) || !products.length) {
        return 0;
    }

    return products.reduce((acc, item) => {
        console.log("Calculating item price:", item);
        const price = parseFloat(item?.unit_price || "0");
        console.log(`Item ${item.product_id} price: ${price}, quantity: ${item.quantity}`);
        let itemTotal = price * (item.quantity || 0);

        // Add modifier price adjustments
        if (item.modifiers && Array.isArray(item.modifiers)) {
            const modifierAdjustments = item.modifiers.reduce((modAcc: number, mod: any) => {
                return modAcc + parseFloat(mod.price_adjustment || "0");
            }, 0);
            itemTotal += modifierAdjustments * (item.quantity || 0);
        }

        console.log(`Item total: ${itemTotal}`);
        return acc + itemTotal;
    }, 0);
};

const createNewProduct = (product: any): ProductItem => {
    const modifiers = product.modifier_groups?.flatMap((group: any) => {
        return group.options?.filter((option: any) => option.is_default)?.map((option: any) => {
            return ({
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
            })
        }) || []
    }).filter(Boolean) || [];

    return {
        product_id: product.id,
        product: product,
        quantity: 1,
        unit_price: String(product.price || "0"),
        note: "",
        modifiers: modifiers || []
    };
};

const applyModifierSuggestions = (product: ProductItem, suggestedModifiers: any[]): ProductItem => {
    if (!suggestedModifiers || suggestedModifiers.length === 0) {
        return product;
    }

    const enhancedProduct = { ...product };
    const newModifiers = [...(product.modifiers || [])];

    console.log('Applying modifier suggestions:', {
        product: product.product?.name,
        currentModifiers: newModifiers.length,
        suggestions: suggestedModifiers.length
    });

    suggestedModifiers.forEach(suggestion => {
        // Check if this product matches the suggestion
        if (suggestion.product_id !== product.product_id) {
            return;
        }

        // Find the modifier group in the product
        const modifierGroup = product.product?.modifier_groups?.find(
            group => group.id === suggestion.modifier_group_id
        );

        if (!modifierGroup) {
            console.warn('Modifier group not found:', suggestion.modifier_group_id);
            return;
        }

        // Find the specific option
        const modifierOption = modifierGroup.options?.find(
            option => option.id === suggestion.modifier_option_id
        );

        if (!modifierOption) {
            console.warn('Modifier option not found:', suggestion.modifier_option_id);
            return;
        }

        // Check if we already have a modifier for this group
        const existingModifierIndex = newModifiers.findIndex(
            mod => mod.modifier_group_id === suggestion.modifier_group_id
        );

        const newModifier = {
            modifier_option_id: modifierOption.id,
            modifier_group_id: modifierGroup.id,
            price_adjustment: modifierOption.price_adjustment || 0,
            modifier_option: {
                id: modifierOption.id,
                name: modifierOption.name,
                price_adjustment: modifierOption.price_adjustment || 0,
                modifierGroup: {
                    id: modifierGroup.id,
                    name: modifierGroup.name,
                    type: modifierGroup.type
                }
            },
            // Add AI suggestion metadata
            ai_suggested: true,
            detection_reason: suggestion.detection_reason,
            confidence: suggestion.confidence,
            matched_keywords: suggestion.matched_keywords || []
        };

        if (existingModifierIndex >= 0) {
            // Replace existing modifier for this group
            newModifiers[existingModifierIndex] = newModifier;
            console.log('Replaced existing modifier:', {
                group: modifierGroup.name,
                old: newModifiers[existingModifierIndex]?.modifier_option?.name,
                new: modifierOption.name,
                reason: suggestion.detection_reason
            });
        } else {
            // Add new modifier
            newModifiers.push(newModifier);
            console.log('Added new modifier:', {
                group: modifierGroup.name,
                option: modifierOption.name,
                reason: suggestion.detection_reason,
                confidence: suggestion.confidence
            });
        }
    });

    enhancedProduct.modifiers = newModifiers;
    return enhancedProduct;
};

// ============================================================================
// SHARED COMPONENTS
// ============================================================================

{/*const OrderSummary: React.FC<OrderSummaryProps> = ({ totalAmount }) => (
    <Box sx={{ mt: 2, textAlign: 'right' }}>
        <Typography variant="body1">Subtotal: {formatCurrency(totalAmount)}</Typography>
        <Typography variant="body1">Servicio sugerido (10%): ${formatCurrency((totalAmount * 0.1))}</Typography>
        <Typography variant="h6">Total: ${formatCurrency((totalAmount * 1.1))}</Typography>
    </Box>
);*/}

const ProductListItem: React.FC<ProductListItemProps> = ({
    product,
    index,
    onQuantityChange,
    onRemoveProduct,
    onNoteChange,
    onModifierChange,
    showImage = true
}) => (
    <ListItem key={`${product.product_id}-${index}`} sx={{ p: 0, mb: 1 }}>
        <Card className="dash-tab-edit-item" sx={{ width: '100%', m: 0 }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', m: 0, p: 0.5, '&:last-child': { pb: 0.5 } }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    {/* Image block */}
                    {showImage &&
                        <Avatar sx={{ width: 128, height: 128, border: '5px solid black' }}>
                            <ImagePlaceHolder
                                loading={<CircularProgress />}
                                placeHolder={placeholder}
                                src={product.product.gallery?.primary_image_url || product.product?.image_url || '' }
                            />
                        </Avatar>
                    }

                    {/* Content column */}
                    <Box sx={{ flex: 1 }}>
                        {/* name block */}
                        <Typography variant="body1">
                            <b>{product.product?.name}</b>
                        </Typography>

                        {/* note block */}
                        <Box sx={{ width: '100%', mt: 1 }}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Agregar nota (opcional)"
                                variant="outlined"
                                value={product.note || ''}
                                onChange={(e) => onNoteChange(index, e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <NoteIcon fontSize="small" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Box>

                        {/* modifiers block */}
                        {product.product?.modifier_groups && product.product.modifier_groups.length > 0 && (
                            <ProductModifiers
                                product={product}
                                productIndex={index}
                                modifiers={product.modifiers || []}
                                onModifierChange={(updatedModifiers) => onModifierChange(index, updatedModifiers)}
                            />
                        )}

                        {/* quantity and price row */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <IconButton onClick={() => onQuantityChange(index, false)}>
                                    <RemoveIcon />
                                </IconButton>
                                <Typography>{product.quantity}</Typography>
                                <IconButton onClick={() => onQuantityChange(index, true)}>
                                    <AddIcon />
                                </IconButton>
                                <IconButton onClick={() => onRemoveProduct(index)}>
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                            <Typography variant="h6">
                                ${priceFormatter(parseFloat(product.unit_price || "0") * product.quantity, 'CLP')}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    </ListItem>
);

const OrderProductsList: React.FC<OrderProductsListProps> = ({
    products,
    onQuantityChange,
    onRemoveProduct,
    onNoteChange,
    onModifierChange,
    showImage = true
}) => {
    if (products.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">No hay productos en la orden</Typography>
                <Typography variant="body2" color="text.secondary">Agrega productos para comenzar</Typography>
            </Box>
        );
    }

    return (
        <List>
            {products.map((product, index) => (
                <ProductListItem
                    key={`${product.product_id}-${index}`}
                    product={product}
                    index={index}
                    onQuantityChange={onQuantityChange}
                    onRemoveProduct={onRemoveProduct}
                    onNoteChange={onNoteChange}
                    onModifierChange={onModifierChange}
                    showImage={showImage}
                />
            ))}
        </List>
    );
};

// ============================================================================
// CUSTOM HOOK FOR ORDER MANAGEMENT
// ============================================================================

const useOrderManagement = () => {
    const { setValue, getValues, watch } = useFormContext();
    const [totalAmount, setTotalAmount] = useState(0);
    const [localProducts, setLocalProducts] = useState<ProductItem[]>([]);

    // Memoize the update function to prevent unnecessary re-renders
    const updateProducts = useCallback((newProducts: ProductItem[], options?: any) => {
        if (!options) {
            options = {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true
            }
        }
        console.log('Updating products:', newProducts, 'with options:', options);
        setValue("products", newProducts, options);
    }, [setValue]);

    // Memoize handlers to prevent re-creation on every render
    const handleNoteChange = useCallback((index: number, note: string) => {
        setLocalProducts(prevProducts => {
            const newProducts = [...prevProducts];
            newProducts[index] = { ...newProducts[index], note };
            updateProducts(newProducts, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
            return newProducts;
        });
    }, [updateProducts]);

    const calculateTotal = useCallback((products: ProductItem[]) => {
        const total = calculateOrderTotal(products);
        console.log(`Final total: ${total}`);
        setTotalAmount(total);
    }, []);

    const handleModifierChange = useCallback((index: number, updatedModifiers: any[]) => {
        setLocalProducts(prevProducts => {
            const newProducts = [...prevProducts];
            newProducts[index] = { ...newProducts[index], modifiers: updatedModifiers };
            updateProducts(newProducts, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
            return newProducts;
        });
    }, [updateProducts]);

    const handleQuantityChange = useCallback((index: number, increment: boolean) => {
        setLocalProducts(prevProducts => {
            const newProducts = [...prevProducts];
            const currentQuantity = newProducts[index].quantity;
            if (increment) {
                newProducts[index] = { ...newProducts[index], quantity: currentQuantity + 1 };
            } else if (currentQuantity > 1) {
                newProducts[index] = { ...newProducts[index], quantity: currentQuantity - 1 };
            }
            updateProducts(newProducts, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
            return newProducts;
        });
    }, [updateProducts]);

    const removeProduct = useCallback((index: number) => {
        setLocalProducts(prevProducts => {
            const newProducts = [...prevProducts];
            newProducts.splice(index, 1);
            updateProducts(newProducts, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
            return newProducts;
        });
    }, [updateProducts]);

    const addProduct = useCallback((product: any) => {
        const newProduct = createNewProduct(product);
        setLocalProducts(prevProducts => {
            const newProducts = [...prevProducts, newProduct];
            updateProducts(newProducts, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
            return newProducts;
        });
    }, [updateProducts]);

    // Watch for form changes with debouncing to prevent infinite loops
    useEffect(() => {
        const subscription = watch((value, { name, type }) => {
            if (name === 'products' && type !== 'change') {
                if (value.products && Array.isArray(value.products)) {
                    // Only update if the products actually changed
                    const currentProductsString = JSON.stringify(localProducts);
                    const newProductsString = JSON.stringify(value.products);
                    if (currentProductsString !== newProductsString) {
                        setLocalProducts(value.products);
                        calculateTotal(value.products);
                    }
                }
            }
        });
        return () => subscription.unsubscribe();
    }, [watch, localProducts, calculateTotal]);

    useEffect(()=> {
        console.log("DEPRECATED COMPONENT");
        debugger;

    },[])

    // Calculate total when localProducts changes
    useEffect(() => {
        calculateTotal(localProducts);
    }, [localProducts, calculateTotal]);

    return {
        localProducts,
        setLocalProducts,
        totalAmount,
        updateProducts,
        handleNoteChange,
        handleModifierChange,
        handleQuantityChange,
        removeProduct,
        addProduct,
        calculateTotal
    };
};

// ============================================================================
// VOICE ACTION HANDLERS HOOK
// ============================================================================

const useVoiceActionHandlers = (
    localProducts: ProductItem[],
    setLocalProducts: React.Dispatch<React.SetStateAction<ProductItem[]>>,
    updateProducts: (products: ProductItem[], options?: any) => void,
    getValues: () => any,
    handleNoteChange: (index: number, note: string) => void,
    handleQuantityChange: (index: number, increment: boolean) => void,
    removeProduct: (index: number) => void,
    addProduct?: (product: any) => void
) => {
    // Enhanced handleAddProductAction with comprehensive modifier support
    const handleAddProductAction = useCallback(async (action: VoiceAction): Promise<{
        success: boolean, message?: string, error?: string
    }> => {
        try {
            console.log('🎯 Processing add product action:', action);

            if (!action.resolved_products || action.resolved_products.length === 0) {
                console.warn('❌ No resolved products found:', action);
                return {
                    success: false,
                    error: `No se encontraron productos para: ${action.product_names.join(', ')}`
                };
            }

            // Use the first resolved product (highest confidence)
            const selectedProduct = action.resolved_products[0];
            console.log('✅ Selected product:', selectedProduct);

            // Create new product item using the existing utility function
            let newProduct = createNewProduct({
                ...selectedProduct.product_data,
                id: selectedProduct.id,
                name: selectedProduct.name,
                price: selectedProduct.price
            });

            console.log('🆕 Created new product:', newProduct);

            // Apply AI-suggested modifiers if available
            if (action.suggested_modifiers && action.suggested_modifiers.length > 0) {
              
                newProduct = applyModifierSuggestions(newProduct, action.suggested_modifiers);
                console.log('Applied AI-suggested modifiers:', {
                    product: selectedProduct.name,
                    modifiers_applied: action.suggested_modifiers.length,
                    final_modifiers: newProduct.modifiers?.length || 0,
                    suggestions: action.suggested_modifiers.map(m => ({
                        group: m.modifier_group_name,
                        option: m.modifier_option_name,
                        reason: m.detection_reason,
                        confidence: m.confidence
                    }))
                });
            }

            // Set the requested quantity
            newProduct.quantity = action.quantity || 1;

            // Add note if provided
            if (action.note) {
                newProduct.note = action.note;
            }

            console.log('🔄 Final product to add:', newProduct);

            // Add to local products - FIXED: Use functional update pattern
            setLocalProducts(prevProducts => {
                console.log('📝 Current products before add:', prevProducts.length);
                const newProducts = [...prevProducts, newProduct];
                console.log('📝 New products after add:', newProducts.length);

                // Update form with new products
                updateProducts(newProducts, {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true
                });

                return newProducts;
            });

            // Create a comprehensive message
            let message = `${action.quantity || 1}x ${selectedProduct.name}`;

            // Add modifier information to message
            if (action.suggested_modifiers && action.suggested_modifiers.length > 0) {
                const modifierDescriptions = action.suggested_modifiers.map(m => {
                    const keywords = m.matched_keywords?.length > 0 ? ` (${m.matched_keywords.join(', ')})` : '';
                    return `${m.modifier_option_name || 'Modificador'}${keywords}`;
                });
                message += ` con: ${modifierDescriptions.join(', ')}`;
            }

            // Add auto-added indicator
            if (action.auto_added) {
                message = `[Auto] ${message}`;
            }

            // Add AI analysis if available
            if (action.ai_analysis) {
                console.log('AI Analysis for this action:', action.ai_analysis);
            }

            console.log('✅ Enhanced product added successfully:', {
                message,
                modifiers_count: newProduct.modifiers?.length || 0,
                ai_enhanced: !!(action.suggested_modifiers?.length),
                auto_added: action.auto_added || false
            });

            return { success: true, message };

        } catch (error) {
            console.error('❌ Error adding enhanced product:', error);
            return { success: false, error: 'Error al agregar producto con modificadores' };
        }
    }, [setLocalProducts, updateProducts]);

    const handleRemoveProductAction = useCallback(async (action: VoiceAction): Promise<{
        success: boolean, message?: string, error?: string
    }> => {
        try {
            console.log('🗑️ Processing remove product action:', action);

            const productNamesToRemove = action.product_names.map(name => name.toLowerCase());
            let removedCount = 0;
            const removedProducts: string[] = [];

            // For Edit component - direct manipulation
            setLocalProducts(prevProducts => {
                console.log('📝 Current products before remove:', prevProducts.length);
                const newProducts = prevProducts.filter(product => {
                    const productName = product.product?.name?.toLowerCase() || '';
                    const shouldRemove = productNamesToRemove.some(nameToRemove =>
                        productName.includes(nameToRemove) || nameToRemove.includes(productName)
                    );

                    if (shouldRemove) {
                        removedCount++;
                        removedProducts.push(product.product?.name || 'Producto');
                        return false;
                    }
                    return true;
                });

                console.log('📝 New products after remove:', newProducts.length);
                updateProducts(newProducts, {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true
                });

                return newProducts;
            });

            if (removedCount > 0) {
                const message = `Eliminado: ${removedProducts.join(', ')}`;
                console.log('✅ Products removed successfully:', message);
                return { success: true, message };
            } else {
                return {
                    success: false,
                    error: `No se encontraron productos para eliminar: ${action.product_names.join(', ')}`
                };
            }

        } catch (error) {
            console.error('❌ Error removing product:', error);
            return { success: false, error: 'Error al eliminar producto' };
        }
    }, [setLocalProducts, updateProducts]);

    const handleModifyQuantityAction = useCallback(async (action: VoiceAction): Promise<{
        success: boolean, message?: string, error?: string
    }> => {
        try {
            console.log('🔢 Processing modify quantity action:', action);

            const productNamesToModify = action.product_names.map(name => name.toLowerCase());
            let modifiedCount = 0;
            const modifiedProducts: string[] = [];

            // For Edit component
            setLocalProducts(prevProducts => {
                console.log('📝 Current products before quantity change:', prevProducts.length);
                const newProducts = [...prevProducts];
                let hasChanges = false;

                newProducts.forEach((product, index) => {
                    const productName = product.product?.name?.toLowerCase() || '';
                    const shouldModify = productNamesToModify.some(nameToModify =>
                        productName.includes(nameToModify) || nameToModify.includes(productName)
                    );

                    if (shouldModify) {
                        const newQuantity = action.quantity || 1;
                        if (newQuantity > 0) {
                            newProducts[index] = { ...product, quantity: newQuantity };
                            modifiedCount++;
                            modifiedProducts.push(`${product.product?.name} (${newQuantity})`);
                            hasChanges = true;
                        }
                    }
                });

                if (hasChanges) {
                    console.log('📝 Products after quantity change:', newProducts.length);
                    updateProducts(newProducts, {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true
                    });
                }

                return newProducts;
            });

            if (modifiedCount > 0) {
                const message = `Cantidad modificada: ${modifiedProducts.join(', ')}`;
                console.log('✅ Quantities modified successfully:', message);
                return { success: true, message };
            } else {
                return {
                    success: false,
                    error: `No se encontraron productos para modificar: ${action.product_names.join(', ')}`
                };
            }

        } catch (error) {
            console.error('❌ Error modifying quantity:', error);
            return { success: false, error: 'Error al modificar cantidad' };
        }
    }, [setLocalProducts, updateProducts]);

    const handleAddNoteAction = useCallback(async (action: VoiceAction): Promise<{
        success: boolean, message?: string, error?: string
    }> => {
        try {
            console.log('📝 Processing add note action:', action);

            const productNamesToNote = action.product_names.map(name => name.toLowerCase());
            let notedCount = 0;
            const notedProducts: string[] = [];

            // For Edit component
            setLocalProducts(prevProducts => {
                console.log('📝 Current products before note add:', prevProducts.length);
                const newProducts = [...prevProducts];
                let hasChanges = false;

                newProducts.forEach((product, index) => {
                    const productName = product.product?.name?.toLowerCase() || '';
                    const shouldAddNote = productNamesToNote.some(nameToNote =>
                        productName.includes(nameToNote) || nameToNote.includes(productName)
                    );

                    if (shouldAddNote && action.note) {
                        const existingNote = product.note || '';
                        const newNote = existingNote
                            ? `${existingNote}. ${action.note}`
                            : action.note;

                        newProducts[index] = { ...product, note: newNote };
                        notedCount++;
                        notedProducts.push(product.product?.name || 'Producto');
                        hasChanges = true;
                    }
                });

                if (hasChanges) {
                    console.log('📝 Products after note add:', newProducts.length);
                    updateProducts(newProducts, {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true
                    });
                }

                return newProducts;
            });

            if (notedCount > 0) {
                const message = `Nota agregada a: ${notedProducts.join(', ')} - "${action.note}"`;
                console.log('✅ Notes added successfully:', message);
                return { success: true, message };
            } else {
                return {
                    success: false,
                    error: `No se encontraron productos para agregar nota: ${action.product_names.join(', ')}`
                };
            }

        } catch (error) {
            console.error('❌ Error adding note:', error);
            return { success: false, error: 'Error al agregar nota' };
        }
    }, [setLocalProducts, updateProducts]);

    const processVoiceAction = useCallback(async (action: VoiceAction): Promise<{
        success: boolean, message?: string, error?: string
    }> => {
        console.log('🎬 Processing voice action:', action);

        switch (action.action) {
            case 'add':
                return await handleAddProductAction(action);
            case 'remove':
                return await handleRemoveProductAction(action);
            case 'modify_quantity':
                return await handleModifyQuantityAction(action);
            case 'add_note':
                return await handleAddNoteAction(action);
            default:
                console.warn('❓ Unknown action type:', action.action);
                return { success: false, error: `Acción desconocida: ${action.action}` };
        }
    }, [handleAddProductAction, handleRemoveProductAction, handleModifyQuantityAction, handleAddNoteAction]);

    return {
        processVoiceAction,
        handleAddProductAction,
        handleRemoveProductAction,
        handleModifyQuantityAction,
        handleAddNoteAction
    };
};

// ============================================================================
// SHARED VOICE PROCESSING HOOK
// ============================================================================

const useVoiceProcessing = (
    localProducts: ProductItem[],
    setLocalProducts: React.Dispatch<React.SetStateAction<ProductItem[]>>,
    updateProducts: (products: ProductItem[], options?: any) => void,
    getValues: () => any,
    handleNoteChange: (index: number, note: string) => void,
    handleQuantityChange: (index: number, increment: boolean) => void,
    removeProduct: (index: number) => void,
    addProduct?: (product: any) => void
) => {
    const [isProcessingVoiceActions, setIsProcessingVoiceActions] = useState(false);

    const { processVoiceAction } = useVoiceActionHandlers(
        localProducts,
        setLocalProducts,
        updateProducts,
        getValues,
        handleNoteChange,
        handleQuantityChange,
        removeProduct,
        addProduct
    );

    const showMessage = useCallback((info: string) => {
        toast.info(<>{info}</>, {
            position: 'top-center',
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: false,
            draggable: false,
        });
    }, []);

    const showError = useCallback((msg: string) => {
        toast.error(<>{msg}</>, {
            position: 'top-center',
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: false,
            draggable: false,
        });
    }, []);

    // Enhanced voice actions handler with better feedback
    const handleVoiceActions = useCallback(async (actions: VoiceAction[]) => {
        setIsProcessingVoiceActions(true);
        try {
            let successCount = 0;
            let errorCount = 0;
            const results: string[] = [];
            const autoAddedProducts: string[] = [];
            const modifierApplications: string[] = [];

            console.log('Processing enhanced voice actions:', {
                total_actions: actions.length,
                actions_with_modifiers: actions.filter(a => a.suggested_modifiers?.length > 0).length,
                auto_added_actions: actions.filter(a => a.auto_added).length
            });

            for (const action of actions) {
                try {
                    const result = await processVoiceAction(action);
                    if (result.success) {
                        successCount++;
                        if (result.message) {
                            results.push(result.message);
                        }

                        // Track different types of enhancements
                        if (action.auto_added) {
                            autoAddedProducts.push(result.message || 'Producto auto-agregado');
                        }

                        if (action.suggested_modifiers?.length > 0) {
                            modifierApplications.push(`${action.product_names[0]}: ${action.suggested_modifiers.length} modificador(es)`);
                        }
                    } else {
                        errorCount++;
                        console.error('Enhanced voice action failed:', result.error);
                    }
                } catch (error) {
                    console.error('Error processing enhanced voice action:', error);
                    errorCount++;
                }
            }

            if (successCount > 0) {
                let message = results.length > 0
                    ? results.join('. ')
                    : `${successCount} acción(es) aplicada(s) exitosamente!`;

                // Add enhancement details
                const enhancements = [];
                if (modifierApplications.length > 0) {
                    enhancements.push(`🎯 Modificadores aplicados: ${modifierApplications.join(', ')}`);
                }
                if (autoAddedProducts.length > 0) {
                    enhancements.push(`➕ Auto-agregados: ${autoAddedProducts.join(', ')}`);
                }

                if (enhancements.length > 0) {
                    message += `\n\n${enhancements.join('\n')}`;
                }

                showMessage(message);
            }

            if (errorCount > 0) {
                showError(`${errorCount} acción(es) fallaron al aplicarse`);
            }

        } catch (error) {
            console.error('Error processing enhanced voice actions:', error);
            showError('Error procesando comandos de voz mejorados');
        } finally {
            setIsProcessingVoiceActions(false);
        }
    }, [showMessage, showError, processVoiceAction]);

    const handleVoiceError = useCallback((error: string) => {
        showError(error);
    }, [showError]);

    return {
        isProcessingVoiceActions,
        handleVoiceActions,
        handleVoiceError,
        showMessage,
        showError
    };
};

// ============================================================================
// EDIT ORDER COMPONENT
// ============================================================================

export interface IOrderComponent extends IDashAutoAdminCustomFieldComponent {
    enableServiceFee?: boolean
}

const EditOrder: React.FC<IOrderComponent> = (props) => {
    const { method, attribute, resourceConfig, enableServiceFee = true } = props;
    const { record: tab, isPending } = useEditContext<ITab>();
    const { control } = useFormContext();
    
    /*const { remove } = useFieldArray({
        control,
        name: "products"
    });*/

    const axios = useAxios();
    const { id: tabId } = useParams();
    const { getCachedTab } = useTabCache();

    const cachedTab = useMemo(() => {
        return tabId ? getCachedTab(tabId) : null;
    }, [tabId, getCachedTab]);

    const isUsingCache = !!cachedTab && isPending;

    const {
        localProducts,
        setLocalProducts,
        totalAmount,
        updateProducts,
        handleNoteChange,
        handleModifierChange,
        handleQuantityChange,
        calculateTotal,
        removeProduct
    } = useOrderManagement();

    // Remove product from react-hook-form
    /*const removeProduct = useCallback((index: number) => {
        remove(index);
    }, [remove]);*/

    const { getValues } = useFormContext();

    const {
        isProcessingVoiceActions,
        handleVoiceActions,
        handleVoiceError,
        showMessage,
        showError
    } = useVoiceProcessing(
        localProducts,
        setLocalProducts,
        updateProducts,
        getValues,
        handleNoteChange,
        handleQuantityChange,
        removeProduct
    );

    // Process tab data
    const processTabData = useCallback((tabData: ITab) => {
        console.log("Processing tab data:", tabData);
        if (tabData?.order?.items) {
            const _products = tabData.order.items.map(item => {
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
                    modifiers: processedModifiers.length ? processedModifiers : defaultModifiers
                };
            });

            console.log("Setting products:", _products);
            updateProducts(_products || [], {});
            setLocalProducts(_products);
            calculateTotal(_products);
        }
    }, [updateProducts, setLocalProducts, calculateTotal]);

    // Use cached data immediately if available
    useEffect(() => {
        if (cachedTab && !localProducts.length) {
            console.log("🚀 Using cached tab data:", cachedTab);
            processTabData(cachedTab);
        }
    }, [cachedTab, localProducts.length/* ,processTabData*/]);

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

    const refresh = useRefresh();
    const translate = useTranslate();

    // Tab action functions
    const downloadTab = useCallback(async (tabId: number) => {
        try {
            const { data: file } = await axios.get(`/tab/tab/${tabId}/download?regenerate=true`, {
                responseType: 'blob',
            });
            saveAs(file, `tab_${tabId}.pdf`);
            showMessage(translate('tab.download.success', { id: tabId }));
        } catch (error: any) {
            showError(translate('tab.download.error', { id: tabId, error: error?.message || translate('common.unknown_error') }));
        }
    }, [axios, translate, showMessage, showError]);

    const printTab = useCallback(async (tabId: number) => {
        try {
            const { data: file } = await axios.get(`/tab/tab/${tabId}/print?regenerate=true`);
            showMessage(translate('tab.print.success', { id: tabId }));
        } catch (error: any) {
            showError(translate('tab.print.error', { id: tabId, error: error?.message || translate('common.unknown_error') }));
        }
    }, [axios, translate, showMessage, showError]);

    const updatePayment = useCallback(async (tabId: number, paymentData: any) => {
        try {
            await dataProvider.update(`/tab/tab/${tabId}/payment`, {
                id: tabId,
                data: paymentData,
                previousData: undefined
            });
            showMessage(translate('tab.payment_update.success', { id: tabId }));
            refresh();
        } catch (error: any) {
            showError(translate('tab.payment_update.error', { id: tabId, error: error?.response?.data?.message || error?.message || translate('common.unknown_error') }));
        }
    }, [refresh, translate, showMessage, showError]);

    if (!localProducts.length && isPending) {
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
            {/* Voice Tab Agent - Horizontal Layout with Auto-Apply */}
            <><VoiceTabAgent
                tabId={tabId}
                onActionsDetected={handleVoiceActions}
                onError={handleVoiceError}
                disabled={isPending || isProcessingVoiceActions}
                autoApply={true}
                layout="horizontal"
                showExamples={false}
            /></>

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

                    {/* Reusable Tab Action Buttons */}
                    {/*<Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <TabActionButtons
                            tab={tab}
                            resourceConfig={resourceConfig}
                            onPrint={(id: number) => printTab(id)}
                            onDownload={(id: number) => downloadTab(id)}
                            size="large"
                            showView={false}
                            showEdit={false}
                            showPayment={false}
                        />
                    </Box>*/}

                    <OrderProductsList
                        products={localProducts}
                        onQuantityChange={handleQuantityChange}
                        onRemoveProduct={removeProduct}
                        onNoteChange={handleNoteChange}
                        onModifierChange={handleModifierChange}
                    />

                    <OrderSummary enableServiceFee={enableServiceFee} />
                </Box>
            </Box>
        </Box>
    );
};

// ============================================================================
// CREATE ORDER COMPONENT
// ============================================================================


export const CreateOrder: React.FC<IOrderComponent> = (props) => {
    const { method, attribute, resourceConfig, enableServiceFee = true } = props;
    const { getValues } = useFormContext();
    

    const {
        localProducts,
        setLocalProducts,
        totalAmount,
        updateProducts,
        handleNoteChange,
        handleModifierChange,
        handleQuantityChange,
        removeProduct,
        addProduct
    } = useOrderManagement();

    //const [localProducts, setLocalProducts] = useState<ProductItem[]>([]);


    const {
        isProcessingVoiceActions,
        handleVoiceActions,
        handleVoiceError,
        showMessage,
        showError
    } = useVoiceProcessing(
        localProducts,
        setLocalProducts,
        updateProducts,
        getValues,
        handleNoteChange,
        handleQuantityChange,
        removeProduct,
        addProduct
    );

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 0, m: 0 }}>
            {/* Voice Tab Agent - Horizontal Layout with Auto-Apply */}
            <><VoiceTabAgent
                tabId={null}
                onActionsDetected={handleVoiceActions}
                onError={handleVoiceError}
                disabled={isProcessingVoiceActions}
                autoApply={true}
                layout="horizontal"
                showExamples={false}
                //debug={process.env.NODE_ENV === 'development'}
            /></>

            <Box sx={{ display: 'flex', gap: 2, p: 0, m: 0 }}>
                <Box sx={{ flex: 1, p: 0, m: 0 }}>
                    {/* Processing Indicator */}
                    {isProcessingVoiceActions && (
                        <Box sx={{ mb: 2, p: 1, bgcolor: 'info.light', borderRadius: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CircularProgress size={16} />
                                <Typography variant="body2">Aplicando comandos de voz mejorados...</Typography>
                            </Box>
                        </Box>
                    )}

                    <OrderProductsList
                        products={localProducts}
                        onQuantityChange={handleQuantityChange}
                        onRemoveProduct={removeProduct}
                        onNoteChange={handleNoteChange}
                        onModifierChange={handleModifierChange}
                    />

                    <OrderSummary  enableServiceFee={enableServiceFee}  />
                </Box>
            </Box>
        </Box>
    );
};



// ============================================================================
// MAIN COMPONENT EXPORT
// ============================================================================

const OrderProductsField: React.FC<IDashAutoAdminCustomFieldComponent> = (props) => {
    const { method } = props;

    console.log('🎯 OrderProductsField render:', { method });

    switch (method) {
        case 'edit':
            return <EditOrder {...props} />;
        case 'create':
            return <CreateOrder {...props} />;
        default:
            return (
                <Box sx={{ p: 2 }}>
                    <Typography color="error">
                        Unsupported method: {method}
                    </Typography>
                </Box>
            );
    }
};

export default OrderProductsField;
