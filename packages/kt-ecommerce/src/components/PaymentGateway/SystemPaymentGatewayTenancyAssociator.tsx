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
    const { record: systemPaymentGateway, isPending } = useEditContext<any>();
    const [finalSelectedIds, setFinalSelectedIds] = useState([]);
    const [selectedIds, { select }] = useRecordSelection({ resource });

    useEffect(() => {

        if (isLoading) return;

        let _selectedIds = [];

        if (systemPaymentGateway && systemPaymentGateway?.tenancy_ids) {
            _selectedIds = [...new Set([..._selectedIds, ...systemPaymentGateway.tenancy_ids])];
        }

        setFinalSelectedIds(_selectedIds);

    }, [data, systemPaymentGateway, isLoading]);

    useEffect(() => {
        if (!selectedIds || !selectedIds.length) return;

        if (selectedIdsFn) selectedIdsFn(selectedIds);
    }, [selectedIds]);


    useEffect(() => {
        if (!finalSelectedIds) return

        select(finalSelectedIds);

    }, [finalSelectedIds])

    return (
        <></>
    );
}

export const SystemPaymentGatewayTenancyAssociator: React.FC<IDashAutoAdminCustomFieldComponent> = ({
   resourceConfig }) => {


    const { record: systemPaymentGateway, isPending } = useEditContext<any>();
    const { setValue, control } = useFormContext();

    const tenancy_ids = useController({ name: "tenancy_ids" });

    useEffect(() => {
     
        setValue("tenancy_ids", systemPaymentGateway?.tenancy_ids ? systemPaymentGateway.tenancy_ids : []);
    

    }, [systemPaymentGateway]);


    return (<>
        {systemPaymentGateway && (
            <>
                <h1>Associated Tenancies</h1>
                <Box sx={{ width: "100%" }}>
                    <List
                        disableSyncWithLocation
                        resource='tenancy'
                        actions={<TopToolbar></TopToolbar>}
                        filters={[<SearchInput source="q" placeholder="Search" alwaysOn fullWidth />]}

                        pagination={<PaginationComponent />}
                        storeKey='system-payment-gateway-tenancies'
                        empty={<Loading />}
                        emptyWhileLoading={true}


                    >
                        <ListAutoSelectIds resource={'tenancy'} selectedIdsFn={(p) => {
                            tenancy_ids.field.onChange(p);
                        }} />
                        <Datagrid

                            bulkActionButtons={<></>}


                        >
                            <TextField source="id" />
                            <TextField source="public_name" label='Name' />
                            <TextField source="email" label='Email' />
                            <TextField source="status" label='Status' />
                        </Datagrid>
                      
                    </List>
                </Box>
            </>
        )}

    </>);
};
