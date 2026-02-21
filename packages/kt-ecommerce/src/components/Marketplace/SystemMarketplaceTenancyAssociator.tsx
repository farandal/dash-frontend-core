import {
    Box,
} from "@mui/material";

import React, { useEffect, useState } from "react";
import { useController, useFormContext } from "react-hook-form";

import { Loading, SearchInput, useEditContext } from "react-admin";


import { List } from "react-admin";
import { TopToolbar } from "react-admin";
import { Datagrid } from "react-admin";
import { TextField } from "react-admin";
import { useListContext } from "react-admin";
import { PaginationComponent } from "dash-components";
import { useRecordSelection } from 'react-admin'
import { IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";


const ListAutoSelectIds = ({ resource, selectedIdsFn }) => {
    const { data, isLoading } = useListContext();
    const { record: systemMarketplace, isPending } = useEditContext<any>();
    const [finalSelectedIds, setFinalSelectedIds] = useState([]);
    const [selectedIds, { select }] = useRecordSelection({ resource });

    useEffect(() => {

        if (isLoading) return;

        let _selectedIds = [];

        if (systemMarketplace && systemMarketplace?.tenancy_ids) {
            _selectedIds = [...new Set([..._selectedIds, ...systemMarketplace.tenancy_ids])];
        }

        setFinalSelectedIds(_selectedIds);

    }, [data, systemMarketplace, isLoading]);

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

export const SystemMarketplaceTenancyAssociator: React.FC<IDashAutoAdminCustomFieldComponent> = ({
   resourceConfig }) => {


    const { record: systemMarketplace, isPending } = useEditContext<any>();
    const { setValue, control } = useFormContext(/*{ shouldUseNativeValidation: true }*/);

    const tenancy_ids = useController({ name: "tenancy_ids" });

    useEffect(() => {
     
        setValue("tenancy_ids", systemMarketplace?.systemMarketplace ? systemMarketplace.tenancy_ids.map(p => p.id) : []);
    

    }, [systemMarketplace]);


    return (<>
        {systemMarketplace && (
            <>
                <h1>Tenancies asociadas al marketplace</h1>
                <Box sx={{ width: "100%" }}>
                    <List
                        disableSyncWithLocation
                        resource='system/tenancy'
                        actions={<TopToolbar></TopToolbar>}
                        filters={[<SearchInput source="q" placeholder="Buscar" alwaysOn fullWidth />]}

                        pagination={<PaginationComponent />}
                        storeKey='system-marketplace-tenancies'
                        empty={<Loading />}
                        emptyWhileLoading={true}
                    >
                        <ListAutoSelectIds resource={'system/tenancy'} selectedIdsFn={(p) => {
                            tenancy_ids.field.onChange(p);
                        }} />
                        <Datagrid
                            bulkActionButtons={<></>}
                        >
                            <TextField source="id" />
                            <TextField source="legal_name" label='Nombre Legal' />
                            <TextField source="slug" label='Slug' />
                        </Datagrid>
                      
                    </List>
                </Box>
            </>
        )}

    </>);
};
