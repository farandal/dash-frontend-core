import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useController, useFormContext } from "react-hook-form";
import {
    Loading,
    SearchInput,
    useEditContext,
    List,
    TopToolbar,
    Datagrid,
    TextField,
    useListContext,
    useRecordSelection,
} from "react-admin";
import { PaginationComponent } from "dash-components";
import { IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";

/**
 * Entitlement editor for a SystemCheckoutGateway: which TenancyAccounts may use this provider.
 * Mirrors SystemMarketplaceTenancyAssociator but reads/writes the checkout record's `tenancy_ids`
 * directly (the API returns them as a flat id array).
 */
const TENANCY_RESOURCE = "system/tenancy";

const ListAutoSelectIds: React.FC<{ selectedIdsFn: (ids: any[]) => void }> = ({ selectedIdsFn }) => {
    const { data, isLoading } = useListContext();
    const { record } = useEditContext<any>();
    const [selectedIds, { select }] = useRecordSelection({ resource: TENANCY_RESOURCE });

    // On load, select the record's current tenancy_ids
    useEffect(() => {
        if (isLoading || !data?.length) return;
        const ids = Array.isArray(record?.tenancy_ids) ? [...new Set(record.tenancy_ids)] : [];
        if (ids.length > 0) {
            select(ids);
        }
    }, [isLoading, data?.length, record?.id]);

    // When selected IDs change, propagate to form
    useEffect(() => {
        if (selectedIdsFn && selectedIds?.length > 0) {
            selectedIdsFn(selectedIds);
        }
    }, [selectedIds, selectedIdsFn]);

    return <></>;
};

export const SystemCheckoutGatewayTenancyAssociator: React.FC<IDashAutoAdminCustomFieldComponent> = () => {
    const { record } = useEditContext<any>();
    const { setValue, watch } = useFormContext();
    const tenancy_ids = useController({ name: "tenancy_ids" });
    const watchTenancyIds = watch("tenancy_ids");

    useEffect(() => {
        if (record?.id) {
            const ids = Array.isArray(record?.tenancy_ids) ? record.tenancy_ids : [];
            setValue("tenancy_ids", ids);
        }
    }, [record?.id, setValue]);

    return (
        <>
            {record && (
                <>
                    <h1>Cuentas (Tenancies) habilitadas para este proveedor</h1>
                    <Box sx={{ width: "100%" }}>
                        <List
                            disableSyncWithLocation
                            resource={TENANCY_RESOURCE}
                            actions={<TopToolbar></TopToolbar>}
                            filters={[<SearchInput source="q" placeholder="Buscar" alwaysOn fullWidth />]}
                            pagination={<PaginationComponent />}
                            storeKey="system-checkout-gateway-tenancies"
                            empty={<Loading />}
                            emptyWhileLoading={true}
                        >
                            <ListAutoSelectIds selectedIdsFn={(p) => tenancy_ids.field.onChange(p)} />
                            <Datagrid bulkActionButtons={<></>}>
                                <TextField source="id" />
                                <TextField source="legal_name" label="Nombre Legal" />
                                <TextField source="slug" label="Slug" />
                            </Datagrid>
                        </List>
                    </Box>
                </>
            )}
        </>
    );
};

export default SystemCheckoutGatewayTenancyAssociator;
