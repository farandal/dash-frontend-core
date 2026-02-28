import React, { useCallback, useEffect, useState, memo, useMemo, useRef } from 'react';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import { useRecordContext, useRefresh, useUpdate, useListContext } from 'react-admin';
import { Switch, Box, Typography } from '@mui/material';
import { FormControlLabel } from '@mui/material';

const getNestedValue = (obj: any, path: string) => path.split('.').reduce((acc, key) => acc?.[key], obj);

const setNestedValue = (obj: any, path: string, value: any) => {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((acc, key) => {
        if (!acc[key]) acc[key] = {};
        return acc[key];
    }, obj);
    if (lastKey) target[lastKey] = value;
};

export interface IBoolSwitch extends IDashAutoAdminCustomFieldComponent {
    activeLabel?: string;
    inactiveLabel?: string;
    enableLabel?: string;
    disableLabel?: string;
    apiMethod?: string;
    initialValue?: boolean; // New prop to override initial value
}

const BoolSwitch = memo(({
    method,
    attribute,
    record,
    resourceConfig,
    activeLabel = 'Activo',
    inactiveLabel = 'Inactivo',
    apiMethod = 'change-status',
    initialValue, // New prop
}: IBoolSwitch) => {
    // Get the initial value from props or record
    const computedInitialValue = useMemo(() => {
        if (initialValue !== undefined) {
            return initialValue;
        }
        return getNestedValue(record, attribute.listAttribute || attribute.attribute) || false;
    }, [initialValue, record, attribute.listAttribute, attribute.attribute]);

    const [, setLoading] = useState<boolean>(true);
    const [checked, setChecked] = useState<boolean>(computedInitialValue);
    const listContext = useListContext();
    const [update, { isLoading: updateLoading }] = useUpdate();
    
    // Track if component has been initialized and if user has interacted with it
    const isInitializedRef = useRef(false);
    const hasUserInteractionRef = useRef(false);
    const confirmedValueRef = useRef<boolean>(computedInitialValue);

    // Memoize the attribute path to prevent unnecessary re-renders
    const attributePath = useMemo(() => 
        attribute.listAttribute || attribute.attribute,
        [attribute.listAttribute, attribute.attribute]
    );

    // Memoize the API endpoint
    const apiEndpoint = useMemo(() => 
        `${resourceConfig.model}/${record.id}/${apiMethod}`,
        [resourceConfig.model, record.id, apiMethod]
    );

    // Memoize the attribute key
    const attributeKey = useMemo(() => 
        attributePath.split(".").slice(-1)[0],
        [attributePath]
    );

    const onError = useCallback((error: any) => {
        console.error(error);
    }, []);

    const onChange = useCallback(async (value: boolean) => {
        // Mark that user has interacted with the component
        hasUserInteractionRef.current = true;
        
        // Optimistic update
        setChecked(value);

        // Update listContext.data immediately for instant UI feedback
        if (listContext && listContext.data) {
            const updatedData = listContext.data.map(item => {
                if (item.id === record.id) {
                    const updatedItem = { ...item };
                    setNestedValue(updatedItem, attributePath, value);
                    return updatedItem;
                }
                return item;
            });
            
            // Update the list context data
            listContext.data = updatedData;
        }

        window.dispatchEvent(new MessageEvent('dash-global-loader', { data: true }));

        try {
            await update(apiEndpoint, {
                id: record.id,
                data: { [attributeKey]: value },
                previousData: record,
            }, {
                onSuccess: (data) => {
                    console.log('Status updated successfully', data);
                    // Update confirmed value
                    confirmedValueRef.current = value;
                    // Keep the optimistic value as the confirmed value
                    setChecked(value);
                },
                onError: (error) => {
                    // Revert optimistic update on error
                    const revertValue = confirmedValueRef.current;
                    setChecked(revertValue);
                    
                    // Revert listContext.data on error
                    if (listContext && listContext.data) {
                        const revertedData = listContext.data.map(item => {
                            if (item.id === record.id) {
                                const revertedItem = { ...item };
                                setNestedValue(revertedItem, attributePath, revertValue);
                                return revertedItem;
                            }
                            return item;
                        });
                        listContext.data = revertedData;
                    }
                    
                    onError(error);
                },
                onSettled: (data, error) => {
                    window.dispatchEvent(new MessageEvent('dash-global-loader', { data: false }));
                },
            });
        } catch (error) {
            // Revert optimistic update
            const revertValue = confirmedValueRef.current;
            setChecked(revertValue);
            
            // Revert listContext.data on error
            if (listContext && listContext.data) {
                const revertedData = listContext.data.map(item => {
                    if (item.id === record.id) {
                        const revertedItem = { ...item };
                        setNestedValue(revertedItem, attributePath, revertValue);
                        return revertedItem;
                    }
                    return item;
                });
                listContext.data = revertedData;
            }
            
            onError(error);
        }
    }, [update, record.id, apiEndpoint, attributeKey, onError, listContext, attributePath]);

    // Initialize component only once, then ignore record changes after user interaction
    useEffect(() => {
        if (!isInitializedRef.current) {
            // First initialization - use computed initial value
            setChecked(computedInitialValue);
            confirmedValueRef.current = computedInitialValue;
            isInitializedRef.current = true;
            setLoading(false);
        } else if (!hasUserInteractionRef.current) {
            // Component initialized but no user interaction yet - still follow record/prop changes
            const currentValue = initialValue !== undefined 
                ? initialValue 
                : getNestedValue(record, attributePath) || false;
                
            if (currentValue !== confirmedValueRef.current) {
                setChecked(currentValue);
                confirmedValueRef.current = currentValue;
            }
            setLoading(false);
        }
        // If hasUserInteractionRef.current is true, ignore all external changes
        
    }, [computedInitialValue, initialValue, record, attributePath]);

    // Memoize the switch icons to prevent re-creation
    const switchIcon = useMemo(() => (
        <div style={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            color:'white',
            background:'black',
            border: '1px solid #000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <span style={{ fontSize: '8px' }}>$</span>
        </div>
    ), []);

    const checkedIcon = useMemo(() => (
        <div style={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            color:'green',
            background:'yellow',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <span style={{ fontSize: '8px' }}>$</span>
        </div>
    ), []);

    return (
        <>
            <Switch
                size="small"
                checked={checked}
                onChange={(e, value) => onChange(value)}
                icon={switchIcon}
                checkedIcon={checkedIcon}
            />
            <Typography variant="caption">
                {checked ? activeLabel : inactiveLabel}
            </Typography>
        </>
    );
});

BoolSwitch.displayName = 'BoolSwitch';

export default BoolSwitch;
