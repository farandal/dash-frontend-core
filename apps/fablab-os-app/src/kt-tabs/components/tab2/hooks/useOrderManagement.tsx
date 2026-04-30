import { useState, useEffect, useCallback, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { ProductItem, OrderManagementHookReturn } from '../types';
import { calculateOrderTotal, createNewProduct, generateLineId } from '../utils';
import useFormPersistence from 'dash-admin/src/hooks/useFormPersistance';

interface UseOrderManagementOptions {
    persistState?: boolean;
    autoRestore?: boolean;
}

export const useOrderManagement = (options: UseOrderManagementOptions = {}): OrderManagementHookReturn => {
    const { persistState = false, autoRestore = true } = options;
    const { setValue, watch, getValues } = useFormContext();
    const [totalAmount, setTotalAmount] = useState(0);
    const [localProducts, setLocalProducts] = useState<ProductItem[]>([]);
    const restorationAttempted = useRef(false);
    const isInitialized = useRef(false);

    // Use form persistence hook
    const { restoreFormData, clearPersistedData, saveFormData } = useFormPersistence({
        persistState,
        excludeFields: ['id', 'date_created', 'date_updated'],
        debounceMs: 1000
    });

    // Initialize and restore data
    useEffect(() => {
        if (!persistState || !autoRestore || restorationAttempted.current) {
            return;
        }

        // Add a small delay to ensure form context is ready
        const timer = setTimeout(() => {
            try {
                const restored = restoreFormData();
                restorationAttempted.current = true;
                
                if (restored) {
                    console.log('🔄 Form state restored from persistence');
                    
                    // Get the restored products from form values
                    const formValues = getValues();
                    if (formValues.products && Array.isArray(formValues.products)) {
                        setLocalProducts(formValues.products);
                        calculateTotal(formValues.products);
                    }
                } else {
                    console.log('📝 No persisted state found, starting fresh');
                }
                
                isInitialized.current = true;
            } catch (error) {
                console.error('Error restoring form data:', error);
                restorationAttempted.current = true;
                isInitialized.current = true;
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [persistState, autoRestore, restoreFormData, getValues]);

    // Memoize the update function to prevent unnecessary re-renders
    const updateProducts = useCallback((newProducts: ProductItem[], options?: any) => {
        const defaultOptions = {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true
        };
        
        const finalOptions = options || defaultOptions;
        console.log('Updating products:', newProducts.length, 'items');
        
        setValue("products", newProducts, finalOptions);
        
        // Save immediately if persistence is enabled
        if (persistState && isInitialized.current) {
            // Use a longer timeout to ensure the form state is updated
            setTimeout(() => {
                try {
                    saveFormData();
                    console.log('💾 Form data auto-saved');
                } catch (error) {
                    console.error('Error saving form data:', error);
                }
            }, 200);
        }
    }, [setValue, persistState, saveFormData]);

    // Calculate total with memoization
    const calculateTotal = useCallback((products: ProductItem[]) => {
        const total = calculateOrderTotal(products);
        console.log(`💰 Order total calculated: ${total}`);
        setTotalAmount(total);
    }, []);

    // Enhanced handlers with better error handling
    const handleNoteChange = useCallback((index: number, note: string) => {
        setLocalProducts(prevProducts => {
            if (index < 0 || index >= prevProducts.length) {
                console.warn('Invalid product index for note change:', index);
                return prevProducts;
            }
            
            const newProducts = [...prevProducts];
            newProducts[index] = { ...newProducts[index], note };
            updateProducts(newProducts);
            return newProducts;
        });
    }, [updateProducts]);

    const handleModifierChange = useCallback((index: number, updatedModifiers: any[]) => {
        setLocalProducts(prevProducts => {
            if (index < 0 || index >= prevProducts.length) {
                console.warn('Invalid product index for modifier change:', index);
                return prevProducts;
            }
            
            const newProducts = [...prevProducts];
            newProducts[index] = { ...newProducts[index], modifiers: updatedModifiers };
            updateProducts(newProducts);
            return newProducts;
        });
    }, [updateProducts]);

    const handleQuantityChange = useCallback((index: number, increment: boolean) => {
        setLocalProducts(prevProducts => {
            // Debug log to help identify the issue
            console.log('Quantity change:', { index, productsLength: prevProducts.length, products: prevProducts });
            
            if (index < 0 || index >= prevProducts.length) {
                console.warn('Invalid product index for quantity change:', index);
                return prevProducts;
            }
            
            const newProducts = [...prevProducts];
            const currentQuantity = newProducts[index].quantity || 1; // Ensure we have a valid quantity
            
            if (increment) {
                newProducts[index] = { 
                    ...newProducts[index], 
                    quantity: parseInt(String(currentQuantity)) + 1 
                };
            } else if (currentQuantity > 1) {
                newProducts[index] = { 
                    ...newProducts[index], 
                    quantity: parseInt(String(currentQuantity)) - 1 
                };
            }
            
            // Ensure we're updating the form state
            updateProducts(newProducts, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true
            });
            
            return newProducts;
        });
    }, [updateProducts]);

    const removeProduct = useCallback((index: number) => {
        setLocalProducts(prevProducts => {
            if (index < 0 || index >= prevProducts.length) {
                console.warn('Invalid product index for removal:', index);
                return prevProducts;
            }
            
            const newProducts = [...prevProducts];
            newProducts.splice(index, 1);
            updateProducts(newProducts);
            return newProducts;
        });
    }, [updateProducts]);

    const addProduct = useCallback((product: any) => {
        const newProduct = createNewProduct(product);
        newProduct.line_id = generateLineId();
        
        setLocalProducts(prevProducts => {
            const newProducts = [...prevProducts, newProduct];
            updateProducts(newProducts);
            return newProducts;
        });
    }, [updateProducts]);

    // Watch for form changes with better synchronization
    useEffect(() => {
        if (!isInitialized.current) return;

        const subscription = watch((value, { name, type }) => {
            if (name === 'products' && value.products && Array.isArray(value.products)) {
                console.log('Form products updated:', value.products);
                setLocalProducts(value.products);
                calculateTotal(value.products);
            }
        });

        return () => subscription.unsubscribe();
    }, [watch, calculateTotal]);

    // Calculate total when localProducts changes
    useEffect(() => {
        if (localProducts.length > 0 || isInitialized.current) {
            calculateTotal(localProducts);
        }
    }, [localProducts, calculateTotal]);

    // Enhanced clear function
    const handleClearPersistedData = useCallback(() => {
        try {
            clearPersistedData();
            setLocalProducts([]);
            setValue('products', [], { shouldDirty: true, shouldTouch: true });
            console.log('🗑️ Persisted data cleared');
        } catch (error) {
            console.error('Error clearing persisted data:', error);
        }
    }, [clearPersistedData, setValue]);

    // Enhanced manual save
    const handleSaveFormData = useCallback(() => {
        try {
            saveFormData();
            console.log('💾 Form data manually saved');
        } catch (error) {
            console.error('Error manually saving form data:', error);
        }
    }, [saveFormData]);

    // Enhanced manual restore
    const handleRestoreFormData = useCallback(() => {
        try {
            const restored = restoreFormData();
            if (restored) {
                const formValues = getValues();
                if (formValues.products && Array.isArray(formValues.products)) {
                    setLocalProducts(formValues.products);
                    calculateTotal(formValues.products);
                }
                console.log('🔄 Form data manually restored');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error manually restoring form data:', error);
            return false;
        }
    }, [restoreFormData, getValues, calculateTotal]);

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
        calculateTotal,
        clearPersistedData: handleClearPersistedData,
        saveFormData: handleSaveFormData,
        restoreFormData: handleRestoreFormData
    };
};
