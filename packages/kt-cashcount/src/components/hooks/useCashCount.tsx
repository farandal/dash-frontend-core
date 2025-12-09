import { useDataProvider, useNotify } from 'react-admin';
import { useState } from 'react';

export const useCashCount = () => {
    const dataProvider = useDataProvider();
    const notify = useNotify();
    const [loading, setLoading] = useState(false);
    
    const updateFinalValues = async (
        cashCountId: number, 
        finalTotals: any, 
        posBreakdowns?: any, 
        notes?: string
    ) => {
        setLoading(true);
        try {
            const response = await dataProvider.update('tab/cashcount', {
                id: cashCountId,
                data: {
                    final_totals: finalTotals,
                    pos_breakdowns: posBreakdowns,
                    notes: notes
                },
                previousData: null,
                meta: { action: 'updateFinalValues' }
            });
            
            notify('Cash count updated successfully', { type: 'success' });
            return response.data;
        } catch (error) {
            notify('Error updating cash count', { type: 'error' });
            throw error;
        } finally {
            setLoading(false);
        }
    };
    
    const closeCashCount = async (cashCountId: number) => {
        setLoading(true);
        try {
            const response = await dataProvider.update('tab/cashcount', {
                id: cashCountId,
                data: {},
                previousData: null,
                meta: { action: 'close' }
            });
            
            notify('Cash count closed successfully', { type: 'success' });
            return response.data;
        } catch (error) {
            notify('Error closing cash count', { type: 'error' });
            throw error;
        } finally {
            setLoading(false);
        }
    };
    
    const regeneratePreview = async (cashCountId: number) => {
        setLoading(true);
        try {
            const response = await dataProvider.update('tab/cashcount', {
                id: cashCountId,
                data: {},
                previousData: null,
                meta: { action: 'regeneratePreview' }
            });
            
            notify('Preview data regenerated successfully', { type: 'success' });
            return response.data;
        } catch (error) {
            notify('Error regenerating preview', { type: 'error' });
            throw error;
        } finally {
            setLoading(false);
        }
    };
    
    return {
        updateFinalValues,
        closeCashCount,
        regeneratePreview,
        loading
    };
};
