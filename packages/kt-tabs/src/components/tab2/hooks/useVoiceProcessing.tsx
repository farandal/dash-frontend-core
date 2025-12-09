import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { ProductItem, VoiceAction } from '../types';
import { useVoiceActionHandlers } from './useVoiceActionHandlers';

export const useVoiceProcessing = (
    localProducts: ProductItem[],
    setLocalProducts: React.Dispatch<React.SetStateAction<ProductItem[]>>,
    updateProducts: (products: ProductItem[], options?: any) => void
) => {
    const [isProcessingVoiceActions, setIsProcessingVoiceActions] = useState(false);

    const { processVoiceAction } = useVoiceActionHandlers(
        localProducts,
        setLocalProducts,
        updateProducts
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


export default useVoiceProcessing;