import { useCallback, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslate, useDataProvider, useRefresh } from 'react-admin';
import { toast } from 'react-toastify';
import { saveAs } from 'file-saver';
import { useAxios } from 'dash-axios-hook';
import DASHAuthenticationService from 'dash-admin/src/contexts/auth/DASHAuthenticationService';
import { useAuthContext } from 'dash-admin/src/contexts/auth/AuthContext';
import {AuthPersistenceService} from 'dash-auth';
import { ITab } from '../../tab/interfaces/ITab';
import { calculateServiceFee, getDefaultServiceFeeFromAuth } from '../utils';

// Helper to check if we're on a native Capacitor platform
const isNativePlatform = (): boolean => {
    return !!(window as any)?.Capacitor?.isNativePlatform?.();
};

// Get Capacitor Filesystem plugin
const getFilesystem = () => {
    return (window as any)?.Capacitor?.Plugins?.Filesystem;
};

// Get Capacitor Share plugin
const getShare = () => {
    return (window as any)?.Capacitor?.Plugins?.Share;
};

interface PaymentMethod {
    id: number;
    name: string;
    value: string;
    point_of_sale_id: number;
    active: boolean;
    is_default?: boolean;
    connection_params?: {
        deferred?: boolean;
        [key: string]: any;
    };
}

export const useTabActions = (onTabClosed?: (tabId: number) => void) => {
    const axios = useAxios();
    const translate = useTranslate();
    const dataProvider = useDataProvider();
    const refresh = useRefresh();
    const { auth, authenticated } = useAuthContext();

    // State for statuses
    const [availableClosingStatuses, setAvailableClosingStatuses] = useState<any[]>([]);
    const [defaultServiceFeePercentage, setDefaultServiceFeePercentage] = useState(10);

    // Load payment methods from the backend (GET /api/tab/tab/payment-methods).
    // Cached via React Query: this rarely changes and was being re-fetched on every
    // mount/remount of this hook, so cache it for 30 minutes instead of refetching live.
    const {
        data: paymentMethodsData,
        isLoading: loadingPaymentMethods,
        isError: hasPaymentMethodsError,
    } = useQuery({
        queryKey: ['tab-pos-payment-methods'],
        queryFn: async () => {
            const { data } = await axios.get('/tab/tab/payment-methods');
            return (data?.payment_methods ?? []) as PaymentMethod[];
        },
        enabled: !!authenticated,
        staleTime: 30 * 60 * 1000, // 30 minutes
        gcTime: 30 * 60 * 1000,
    });

    const paymentMethods = paymentMethodsData ?? [];
    const paymentMethodsError = hasPaymentMethodsError
        ? translate('tab.payment.error_loading_methods')
        : (!loadingPaymentMethods && paymentMethods.length === 0)
            ? translate('tab.payment.no_active_methods')
            : null;

    // Helper functions
    const getPointOfSales = useCallback(() => {
 
        try {
            /*if (auth?.systemValues?.point_of_sales) {
                return auth.systemValues.point_of_sales;
            }*/
         
            const point_of_sales = AuthPersistenceService.getSystemValue('point_of_sales');
            if (point_of_sales) {
                return point_of_sales;
            }
            
            return null;

        } catch (error) {
            console.error('❌ Error getting point of sales:', error);
            return null;
        }
    }, [auth]);

    const getDefaultPaymentMethod = useCallback((pointOfSales: any[]) => {
        if (!pointOfSales || !Array.isArray(pointOfSales)) {
            return null;
        }

        const defaultMethod = pointOfSales.find(pos => pos.active && pos.is_default === true);
        if (defaultMethod) {
            return defaultMethod;
        }

        const firstActiveMethod = pointOfSales.find(pos => pos.active);
        return firstActiveMethod || null;
    }, []);

    const getPaymentMethodByValue = useCallback((value: string) => {
        return paymentMethods.find(method => method.value === value || method.name === value);
    }, [paymentMethods]);

    const getPaymentMethodById = useCallback((id: number) => {
        return paymentMethods.find(method => method.id === id || method.point_of_sale_id === id);
    }, [paymentMethods]);

    const isPaymentMethodDeferred = useCallback((paymentMethod: PaymentMethod) => {
        return paymentMethod.connection_params?.deferred === true;
    }, []);

    // Load statuses
    useEffect(() => {
        const loadStatuses = async () => {
               setAvailableClosingStatuses([]);
        };
        
        loadStatuses();
    }, []);

    // Get default service fee
    useEffect(() => {
        const defaultServiceFee = getDefaultServiceFeeFromAuth();
        setDefaultServiceFeePercentage(defaultServiceFee);
    }, []);

    const showMessage = useCallback((message: string) => {
        toast.success(message, {
            position: 'top-center',
            autoClose: 1000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: false,
            draggable: false,
        });
    }, []);

    const showError = useCallback((message: string) => {
        toast.error(message, {
            position: 'top-center',
            autoClose: 1000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: false,
            draggable: false,
        });
    }, []);

    // Action functions
    const downloadTab = useCallback(async (tabId: number) => {
        try {
            // For native mobile platforms, use Capacitor Filesystem
            if (isNativePlatform()) {
                const Filesystem = getFilesystem();
                const Share = getShare();
                
                // Get the PDF as base64
                const { data: file } = await axios.get(`/tab/tab/${tabId}/download?regenerate=true`, {
                    responseType: 'blob',
                });
                
                // Convert blob to base64
                const reader = new FileReader();
                const base64Promise = new Promise<string>((resolve, reject) => {
                    reader.onloadend = () => {
                        const base64data = reader.result as string;
                        // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
                        const base64 = base64data.split(',')[1];
                        resolve(base64);
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
                
                const base64 = await base64Promise;
                const fileName = `tab_${tabId}_${Date.now()}.pdf`;
                
                if (Filesystem) {
                    // Save to device Downloads/Documents directory
                    const result = await Filesystem.writeFile({
                        path: fileName,
                        data: base64,
                        directory: 'DOCUMENTS', // or 'EXTERNAL' for Downloads on Android
                        recursive: true
                    });
                    
                    console.log('📄 PDF saved to:', result.uri);
                    
                    // Try to share/open the file
                    if (Share) {
                        try {
                            await Share.share({
                                title: `Tab ${tabId}`,
                                text: `Tab ${tabId} PDF`,
                                url: result.uri,
                                dialogTitle: 'Abrir o compartir PDF'
                            });
                        } catch (shareError) {
                            // Share was cancelled or failed, but file is saved
                            console.log('Share cancelled or failed:', shareError);
                        }
                    }
                    
                    showMessage(translate('tab.download.success', { id: tabId }));
                } else {
                    // Fallback: try to open in browser
                    const url = URL.createObjectURL(file);
                    window.open(url, '_blank');
                    showMessage(translate('tab.download.success', { id: tabId }));
                }
            } else {
                // Web browser - use file-saver 
                const { data: file } = await axios.get(`/tab/tab/${tabId}/download?regenerate=true`, {
                    responseType: 'blob',
                });
                saveAs(file, `tab_${tabId}.pdf`);
                showMessage(translate('tab.download.success', { id: tabId }));
            }
        } catch (error: any) {
            console.error('Download error:', error);
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

    // Simple close tab function - just changes status to CLOSED
    const closeTab = useCallback(async (tabId: number) => {
      
        try {
            await dataProvider.update(`tab/tab`, {
                id: tabId,
                data: { 
                    status: 'CLOSED'
                },
                previousData: undefined
            });
            
            showMessage(translate('tab.close.success', { id: tabId }));
            onTabClosed?.(tabId);
        } catch (error: any) {
            showError(translate('tab.close.error', {
                id: tabId,
                error: error?.response?.data?.message || error?.message || translate('common.unknown_error')
            }));
        }
    }, [dataProvider, translate, onTabClosed, showMessage, showError]);


    // Replace the simple closeTab function with a more flexible one
const closeTabWithStatus = useCallback(async (tabId: number, status: 'CLOSED' | 'CANCELLED') => {
   
    try {
        await dataProvider.update(`tab/tab`, {
            id: tabId,
            data: { 
                status: status
            },
            previousData: undefined
        });
        
        showMessage(translate('tab.close.success', { 
            id: tabId, 
            status: translate(`tab.status.${status.toLowerCase()}`) 
        }));
        onTabClosed?.(tabId);
    } catch (error: any) {
        showError(translate('tab.close.error', {
            id: tabId,
            error: error?.response?.data?.message || error?.message || translate('common.unknown_error')
        }));
    }
}, [dataProvider, translate, onTabClosed, showMessage, showError]);


    const updatePayment = useCallback(async (tabId: number, paymentData: any, closingStatus: string = 'CLOSED') => {
        try {
            const selectedMethod = getPaymentMethodByValue(paymentData.payment_method) || 
                                 getPaymentMethodById(paymentData.payment_method_id);
            
            if (!selectedMethod) {
                throw new Error('Invalid payment method selected');
            }

            const isDeferred = isPaymentMethodDeferred(selectedMethod);
            
            const finalPaymentData = {
                ...paymentData,
                payment_method: selectedMethod.name,
                payment_method_id: selectedMethod.point_of_sale_id,
                is_deferred: isDeferred
            };
            
            await dataProvider.update(`tab/tab`, {
                id: tabId,
                data: { 
                    // Don't change status when just updating payment
                    is_paid: true,
                    payment_method: finalPaymentData.payment_method,
                    payment_method_id: finalPaymentData.payment_method_id,
                    service_fee: paymentData.service_fee
                },
                previousData: undefined
            });
            
            showMessage(translate('tab.payment_update.success', { id: tabId }));
            
            
            /*if (closingStatus === 'CLOSED' || closingStatus === 'CANCELLED') {
                onTabClosed?.(tabId);
            } else {*/
                // Just refresh the data to show updated payment info
                refresh();
            //}
        } catch (error: any) {
            showError(translate('tab.payment_update.error', {
                id: tabId,
                error: error?.response?.data?.message || error?.message || translate('common.unknown_error')
            }));
        }
    }, [dataProvider, translate, refresh, getPaymentMethodByValue, getPaymentMethodById, isPaymentMethodDeferred, onTabClosed, showMessage, showError]);

    const closeTabWithPayment = useCallback(async (tabId: number, closingStatus: string, paymentData?: any) => {
      
        try {
            let finalPaymentData = paymentData;
            if (paymentData) {
                const selectedMethod = getPaymentMethodByValue(paymentData.payment_method) ||
                                     getPaymentMethodById(paymentData.payment_method_id);
                
                if (selectedMethod) {
                    const isDeferred = isPaymentMethodDeferred(selectedMethod);
                    finalPaymentData = {
                        ...paymentData,
                        payment_method: selectedMethod.name,
                        payment_method_id: selectedMethod.point_of_sale_id,
                        is_deferred: isDeferred
                    };
                }
            }

            await dataProvider.update(`tab/tab`, {
                id: tabId,
                data: {
                    status: closingStatus, // This one DOES change the status
                    is_paid: true,
                    ...(finalPaymentData ? {
                        payment_method: finalPaymentData.payment_method,
                        payment_method_id: finalPaymentData.payment_method_id,
                        service_fee: finalPaymentData.service_fee
                    } : {})
                },
                previousData: undefined
            });

            showMessage(translate('tab.close.success', { 
                id: tabId, 
                status: translate(`tab.status.${closingStatus.toLowerCase()}`) 
            }));

            onTabClosed?.(tabId);
        } catch (error: any) {
            showError(translate('tab.close.error', {
                id: tabId,
                error: error?.response?.data?.message || error?.message || translate('common.unknown_error')
            }));
        }
    }, [dataProvider, translate, getPaymentMethodByValue, getPaymentMethodById, isPaymentMethodDeferred, onTabClosed, showMessage, showError]);

    return {
        // State
        paymentMethods,
        loadingPaymentMethods,
        paymentMethodsError,
        availableClosingStatuses,
        defaultServiceFeePercentage,
        
        // Helper functions
        getPointOfSales,
        getDefaultPaymentMethod,
        getPaymentMethodByValue,
        getPaymentMethodById,
        isPaymentMethodDeferred,
        
        // Action functions
        downloadTab,
        printTab,
        closeTab, // Simple close function - just changes status to CLOSED
        closeTabWithStatus,
        updatePayment,
        closeTabWithPayment,
        showMessage,
        showError
    };
};

export default useTabActions;
