import React from 'react';

import {
    TextField,
    Datagrid,
} from 'react-admin/src';

import IDashAutoAdminAttribute from '../interfaces/IDashAutoAdminAttribute';
import IDashAutoAdminResourceConfig from '../interfaces/IDashAutoAdminResourceConfig';
//import IAutoGridButton from '../interfaces/IAutoGridButton';

import { AttributeToField } from './AttributeToField';
import { TableContainer } from '@mui/material';
//import evalActionPermission from '../utils/evalActionPermission';
import { ListDeleteButton, ListEditButton, ListViewButton } from '../toolbar/buttons/ListButtons';

interface AutoDataGridProps {
    /** Schema,(optional) resolves from resourceConfig, but in some cases without schema could work, not tested. */
    schema?: IDashAutoAdminAttribute[];
    /** BulkActions,(optional) resolves from resourceConfig, but in some cases without schema could work, not tested. */
    bulkActions?: any;
    resourceConfig?: IDashAutoAdminResourceConfig;
    className?: string;
}

export type IAutoDataGrid = AutoDataGridProps /* & typeof Datagrid*/;

const AutoDataGrid: React.FC<IAutoDataGrid> = ({
    resourceConfig,
    schema,
    bulkActions,
    ...dataGridProps
}) => {
    const _schema: IDashAutoAdminAttribute[] = resourceConfig?.schema || schema;

    if (!_schema || !_schema.filter)
        throw new Error(
            'Schema must be present as prop or as an attribute of resourceConfig object, and must be iterable',
        );

    const schemaIncludesId =
        _schema.filter((attribute) => attribute.attribute === 'id').length !== 0;

    const processedDataGridProps = {
        ...resourceConfig.dataGridProps,
        ...dataGridProps,
        ...(!!resourceConfig.BulkActions || !!bulkActions) ? { bulkActionButtons: resourceConfig.BulkActions || bulkActions } : { bulkActionButtons: false },
    };

    /*
    const _edit = evalActionPermission(resourceConfig, resourceConfig?.edit);
    const _view = evalActionPermission(resourceConfig, resourceConfig?.view);
    const _delete = evalActionPermission(resourceConfig, resourceConfig?.delete);

    // Defaults list buttons:
    const listViewButton: IAutoGridButton = resourceConfig.listViewButton || {
        enabled: _view,
    };
    const listEditButton: IAutoGridButton = resourceConfig.listEditButton || {
        enabled: _edit,
    };
    const listDeleteButton: IAutoGridButton =
        resourceConfig?.listDeleteButton || { enabled: _delete };
    */

    // TODO gridWrapperProps
    const DefaultGridWrapper = ({ children, ...gridWrapperProps }) => {
        return (
            <TableContainer
                sx={{ mt: 1 }}
                className={'dash-datagrid-wrapper'}
                {...gridWrapperProps}
            >
                {children}
            </TableContainer>
        );
    };

    const DataGridWrapper = resourceConfig.dataGridWrapper || DefaultGridWrapper;
    const DataGridRootComponent: typeof Datagrid =
        resourceConfig.dataGridRootComponent || Datagrid;

    return (
        <DataGridWrapper>

            <DataGridRootComponent {...processedDataGridProps}>
                {!schemaIncludesId && !(resourceConfig.hideSchemaId === true) && (
                    <TextField
                        key={'default_id_field_0'}
                        //fullWidth
                        source='id'
                        sortable={true}
                    //  todo: link a recurso
                    //   onClick={
                    //     (record &&
                    //       (() => {
                    //         linkToRecord2(record);
                    //       })) ||
                    //     undefined
                    //   }
                    />
                )}
                {_schema
                    .filter((attribute) => attribute.inList !== false)
                    .map((attribute, idx) => AttributeToField('list', resourceConfig, attribute, idx))
                }
                {/*<Button onClick={(e)=>{ console.log(record);  }}>Restaurar</Button>*/}
                <ListViewButton key={'list_view_btn'} resourceConfig={resourceConfig} />
                <ListEditButton key={'list_edit_btn'} resourceConfig={resourceConfig} />
                <ListDeleteButton key={'list_delete_btn'} resourceConfig={resourceConfig} />
                {resourceConfig?.customListButtons &&
                    resourceConfig.customListButtons.map((customButtonConfig, idx) => (
                        <customButtonConfig.component
                            key={'list_custom_buttton' + idx}
                            {...customButtonConfig.props}
                        />
                    ))}
            </DataGridRootComponent>
        </DataGridWrapper>
    );
};

export default AutoDataGrid;
