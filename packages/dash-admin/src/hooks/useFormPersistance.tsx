import { useEffect, useCallback, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { useParams } from 'react-router-dom';

interface FormPersistenceOptions {
    persistState?: boolean;
    storageKey?: string;
    debounceMs?: number;
    excludeFields?: string[];
}

export const useFormPersistence = (options: FormPersistenceOptions = {}) => {
    const {
        persistState = false,
        storageKey,
        debounceMs = 1000,
        excludeFields = []
    } = options;

    const { watch, setValue, getValues } = useFormContext();
    const { id: tabId } = useParams();
    const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
    
    // Generate storage key
    const finalStorageKey = storageKey || `tab-form-${tabId}`;

    // Save form data to localStorage
    const saveFormData = useCallback((data: any) => {
        if (!persistState) return;
        
        try {
            // Filter out excluded fields
            const filteredData = { ...data };
            excludeFields.forEach(field => {
                delete filteredData[field];
            });

            const persistData = {
                formData: filteredData,
                timestamp: Date.now(),
                tabId
            };

            localStorage.setItem(finalStorageKey, JSON.stringify(persistData));
            console.log('📦 Form data persisted:', finalStorageKey);
        } catch (error) {
            console.error('Failed to persist form data:', error);
        }
    }, [persistState, finalStorageKey, excludeFields, tabId]);

    // Load form data from localStorage
    const loadFormData = useCallback(() => {
        if (!persistState) return null;

        try {
            const stored = localStorage.getItem(finalStorageKey);
            if (!stored) return null;

            const persistData = JSON.parse(stored);
            
            // Check if data is not too old (optional: 24 hours)
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours
            if (Date.now() - persistData.timestamp > maxAge) {
                localStorage.removeItem(finalStorageKey);
                return null;
            }

            console.log('📦 Form data loaded from storage:', finalStorageKey);
            return persistData.formData;
        } catch (error) {
            console.error('Failed to load form data:', error);
            return null;
        }
    }, [persistState, finalStorageKey]);

    // Restore form data
    const restoreFormData = useCallback(() => {
        const savedData = loadFormData();
        if (!savedData) return false;

        try {
            // Restore each field
            Object.keys(savedData).forEach(fieldName => {
                setValue(fieldName, savedData[fieldName], {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: false
                });
            });

            console.log('✅ Form data restored successfully');
            return true;
        } catch (error) {
            console.error('Failed to restore form data:', error);
            return false;
        }
    }, [loadFormData, setValue]);

    // Clear persisted data
    const clearPersistedData = useCallback(() => {
        try {
            localStorage.removeItem(finalStorageKey);
            console.log('🗑️ Persisted form data cleared:', finalStorageKey);
        } catch (error) {
            console.error('Failed to clear persisted data:', error);
        }
    }, [finalStorageKey]);

    // Watch for form changes and save with debouncing
    useEffect(() => {
        if (!persistState) return;

        const subscription = watch((data) => {
            // Clear existing timeout
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }

            // Set new timeout
            debounceRef.current = setTimeout(() => {
                saveFormData(data);
            }, debounceMs);
        });

        return () => {
            subscription.unsubscribe();
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [watch, persistState, saveFormData, debounceMs]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    return {
        restoreFormData,
        clearPersistedData,
        loadFormData,
        saveFormData: () => saveFormData(getValues())
    };
};

export default useFormPersistence;
