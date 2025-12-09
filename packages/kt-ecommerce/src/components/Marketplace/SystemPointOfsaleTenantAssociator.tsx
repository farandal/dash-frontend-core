import {
    Box,
    Button,
    IconButton,
    ImageList,
    ImageListItem,
    ImageListItemBar,
} from "@mui/material";

import React, { useEffect, useState } from "react";
import { useController, useFormContext } from "react-hook-form";

import { Loading, SearchInput, useEditContext } from "react-admin";
import { useUpdate } from "react-admin";
import { ListManager } from "react-18-beautiful-dnd-grid/src"


import { List } from "react-admin";
import { TopToolbar } from "react-admin";
import { Datagrid } from "react-admin";
import { TextField } from "react-admin";
import { useListContext } from "react-admin";
import { useRecordContext } from "react-admin";
import { PaginationComponent } from "dash-components";
import { useRecordSelection } from 'react-admin'
import { IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";


const ListAutoSelectIds = ({ resource, selectedIdsFn }) => {
    const { data, isLoading } = useListContext();
    const { record: systemPointOfSale, isPending } = useEditContext<any>();
    const [finalSelectedIds, setFinalSelectedIds] = useState([]);
    const [selectedIds, { select }] = useRecordSelection({ resource });

    useEffect(() => {

        if (isLoading) return;

        let _selectedIds = [];

        /*if (data?.length) {
            _selectedIds = [...new Set([..._selectedIds, ...data.map(p => p.id)])];
        }*/

        if (systemPointOfSale && systemPointOfSale?.tenant_ids) {
            _selectedIds = [...new Set([..._selectedIds, ...systemPointOfSale.tenant_ids])];
        }

        setFinalSelectedIds(_selectedIds);

    }, [data, systemPointOfSale, isLoading]);

    useEffect(() => {
        if (!selectedIds || !selectedIds.length) return;

        if (selectedIdsFn) selectedIdsFn(selectedIds);
    }, [selectedIds]);


    useEffect(() => {
        if (!finalSelectedIds) return

        select(finalSelectedIds);
        //if (selectedIdsFn) selectedIdsFn(finalSelectedIds);

    }, [finalSelectedIds])

    return (
        <></>
    );
}

export const SystemPointOfSaleTenantAssociator: React.FC<IDashAutoAdminCustomFieldComponent> = ({
   resourceConfig }) => {


    const { record: systemPointOfSale, isPending } = useEditContext<any>();
    const { setValue, control } = useFormContext(/*{ shouldUseNativeValidation: true }*/);

    const tenant_ids = useController({ name: "tenant_ids" });

    useEffect(() => {
     
        setValue("tenant_ids", systemPointOfSale?.systemPointOfSale ? systemPointOfSale.tenant_ids.map(p => p.id) : []);
    

    }, [systemPointOfSale]);


    return (<>
        {systemPointOfSale && (
            <>
                <h1>Tenants asociados al POS</h1>
                <Box sx={{ width: "100%" }}>
                    <List
                        disableSyncWithLocation
                        resource='system/tenant'
                        /* This adds the filter button, but the problem this component is already in a form, cannot contain a nested form */
                        //actions={<TopToolbar><FilterButton /></TopToolbar>}
                        //filters={[<TextInput label="Buscar" source="q" />]}

                        actions={<TopToolbar></TopToolbar>}
                        filters={[<SearchInput source="q" placeholder="Buscar" alwaysOn fullWidth />]}

                        pagination={<PaginationComponent />}
                        storeKey='system-point_of_sales-tenants'
                        empty={<Loading />}
                        emptyWhileLoading={true}


                    >
                        <ListAutoSelectIds resource={'system/tenant'} selectedIdsFn={(p) => {
                            tenant_ids.field.onChange(p);
                        }} />
                        <Datagrid

                            bulkActionButtons={<></>}


                        >
                            <TextField source="id" />
                            <TextField source="name" label='Nombre' />
                            <TextField source="sku" label='SKU' />
                        </Datagrid>
                      
                    </List>
                </Box>
            </>
        )}

    </>);
};

