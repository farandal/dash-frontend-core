import { useCallback } from 'react';
import { ProductItem, VoiceAction } from '../types';
import { createNewProduct, applyModifierSuggestions } from '../utils';

interface VoiceActionResult {
    success: boolean;
    message?: string;
    error?: string;
}

export const useVoiceActionHandlers = (
    localProducts: ProductItem[],
    setLocalProducts: React.Dispatch<React.SetStateAction<ProductItem[]>>,
    updateProducts: (products: ProductItem[], options?: any) => void
) => {
    // Enhanced handleAddProductAction with comprehensive modifier support
    const handleAddProductAction = useCallback(async (action: VoiceAction): Promise<VoiceActionResult> => {
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

            // Add to local products using functional update pattern
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

    const handleRemoveProductAction = useCallback(async (action: VoiceAction): Promise<VoiceActionResult> => {
        try {
            console.log('🗑️ Processing remove product action:', action);

            const productNamesToRemove = action.product_names.map(name => name.toLowerCase());
            let removedCount = 0;
            const removedProducts: string[] = [];

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

    const handleModifyQuantityAction = useCallback(async (action: VoiceAction): Promise<VoiceActionResult> => {
        try {
            console.log('🔢 Processing modify quantity action:', action);

            const productNamesToModify = action.product_names.map(name => name.toLowerCase());
            let modifiedCount = 0;
            const modifiedProducts: string[] = [];

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

    const handleAddNoteAction = useCallback(async (action: VoiceAction): Promise<VoiceActionResult> => {
        try {
            //console.log('📝 Processing add note action:', action);

            const productNamesToNote = action.product_names.map(name => name.toLowerCase());
            let notedCount = 0;
            const notedProducts: string[] = [];

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

    const processVoiceAction = useCallback(async (action: VoiceAction): Promise<VoiceActionResult> => {
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
