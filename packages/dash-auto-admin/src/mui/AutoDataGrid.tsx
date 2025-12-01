import React, { useMemo, memo, useEffect } from 'react';

import {
    TextField,
    Datagrid,
} from 'react-admin';

import IDashAutoAdminAttribute from '../interfaces/IDashAutoAdminAttribute';
import IDashAutoAdminResourceConfig from '../interfaces/IDashAutoAdminResourceConfig';

import { AttributeToField } from './AttributeToField';
import { TableContainer } from '@mui/material';
import { ListDeleteButton, ListEditButton, ListViewButton } from '../toolbar/buttons/ListButtons';

interface AutoDataGridProps {
    /** Schema,(optional) resolves from resourceConfig, but in some cases without schema could work, not tested. */
    schema?: IDashAutoAdminAttribute[];
    /** BulkActions,(optional) resolves from resourceConfig, but in some cases without schema could work, not tested. */
    resourceConfig?: IDashAutoAdminResourceConfig;
    className?: string;
}

export type IAutoDataGrid = AutoDataGridProps;

// Memoize the buttons to prevent unnecessary re-renders
const MemoizedListViewButton = memo(ListViewButton);
const MemoizedListEditButton = memo(ListEditButton);
const MemoizedListDeleteButton = memo(ListDeleteButton);

const AutoDataGrid: React.FC<IAutoDataGrid> = ({
    resourceConfig,
    schema,
    ...dataGridProps
}) => {
    const _schema: IDashAutoAdminAttribute[] = resourceConfig?.schema || schema;

    if (!_schema || !_schema.filter)
        throw new Error(
            'Schema must be present as prop or as an attribute of resourceConfig object, and must be iterable',
        );

    // Memoize schema processing
    const schemaIncludesId = useMemo(() => 
        _schema.filter((attribute) => attribute.attribute === 'id').length !== 0
    , [_schema]);

    // Memoize processed dataGridProps
    const processedDataGridProps = useMemo(() => ({
        ...{selectedIds:[]},
        ...resourceConfig.dataGridProps,
        ...dataGridProps,
    }), [resourceConfig.dataGridProps, dataGridProps]);

    // Memoize the filtered schema for list display
    const filteredSchema = useMemo(() => 
        _schema.filter((attribute) => attribute.inList !== false)
    , [_schema]);

    // Default grid wrapper component
    const DefaultGridWrapper = memo((props: { children: React.ReactNode, className?: string, gridWrapperProps?: any }) => {
        const { children, className, gridWrapperProps } = props;
        return (
            <TableContainer
                sx={{ mt: 1 }}
                className={'dash-datagrid-wrapper '+(className || '')}
                {...gridWrapperProps}
            >
                {children}
            </TableContainer>
        );
    });

    const DataGridWrapper = resourceConfig.dataGridWrapper || DefaultGridWrapper;
    const DataGridRootComponent: typeof Datagrid =
        resourceConfig.dataGridRootComponent || Datagrid;
    
    // Memoize the custom list buttons
    const customListButtons = useMemo(() => {
        if (!resourceConfig?.customListButtons) return null;
        
        return resourceConfig.customListButtons.map((customButtonConfig, idx) => (
            <customButtonConfig.component
                key={'list_custom_buttton' + idx}
                {...customButtonConfig.props}
            />
        ));
    }, [resourceConfig?.customListButtons]);

  
      
    return <DataGridWrapper className={resourceConfig?.dataGridProps?.stickyHeader ? 'dash-sticky-header' : ''}>
            <DataGridRootComponent {...processedDataGridProps}>
                {!schemaIncludesId && !(resourceConfig.hideSchemaId === true) && (
                    <TextField
                        key={'default_id_field_0'}
                        source='id'
                        sortable={true}
                    />
                )}
                {filteredSchema.map((attribute, idx) => 
                    AttributeToField('list', resourceConfig, attribute, idx)
                )}
                <MemoizedListViewButton key={'list_view_btn'} resourceConfig={resourceConfig} />
                <MemoizedListEditButton key={'list_edit_btn'} resourceConfig={resourceConfig} />
                <MemoizedListDeleteButton key={'list_delete_btn'} resourceConfig={resourceConfig} />
                {customListButtons}
            </DataGridRootComponent>
        </DataGridWrapper>
    
};

// Export a memoized version of the component
//export default memo(AutoDataGrid);
export default AutoDataGrid