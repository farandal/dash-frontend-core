import {
    Box, Button
} from "@mui/material"
import React, { useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"
import { useWatch } from "react-hook-form"
import SearchableSelect from "./SearchableSelect"
import { DataGrid, GridColDef } from "@mui/x-data-grid"

import { Loading, useGetList, useGetOne, useRecordContext, useTranslate } from "react-admin"
import { Tenant } from "dash-admin/src/interfaces/Tenant"

export interface ITenantMarketplaceSelector {
    //tenant: Tenant
    method: string
}

export const TenantMarketplaceSelectorEdit: React.FC<ITenantMarketplaceSelector> = ({
    method,
    ...props
}) => {
    const { setValue } = useFormContext();
    const translate = useTranslate();
    const tenantContext: Tenant = useRecordContext();

    const [toDeleteSystemMarketplace, setToDeleteSystemMarketplace] = useState<any[]>([])
    const [resetKey, setResetKey] = useState(0)
    const systemMarketplaceRows = useWatch({ name: "systemMarketplaces", defaultValue: [] })

    const { data: tenant, isLoading: tenantLoading } = useGetOne('tenant/tenant', { id: tenantContext.id}, { refetchOnWindowFocus: false});

    useEffect(() => {
        if(tenant && !tenantLoading) {
            setValue("systemMarketplaces", tenant.systemMarketplaces || [])
            setValue("system_marketplace_ids", (tenant.systemMarketplaces || []).map((m: any) => m.id))
        }
    }, [tenant, tenantLoading, setValue])

    const columns: GridColDef[] = [
        { field: "id", headerName: "ID", width: 20 },
        {
            field: "name",
            headerName: translate('tenant.marketplaces.nombre') || "Nombre",
            width: 300,
            editable: false,
        },
        {
            field: "class",
            headerName: translate('tenant.marketplaces.clase') || "Clase",
            width: 300,
            editable: false,
        }
    ]

    const removeSystemMarketplace = () => {
        const selection = Array.isArray(toDeleteSystemMarketplace) ? toDeleteSystemMarketplace : [];
        if (selection.length === 0) return;

        const filtered = (systemMarketplaceRows || []).filter(
            (item: any) => item && item.id && !selection.map(String).includes(String(item.id))
        )
   
        setValue("systemMarketplaces", filtered);
        setValue("system_marketplace_ids", filtered.map((m: any) => m.id));
        setToDeleteSystemMarketplace([]);
        // Force grid reset to clear checkboxes  
        setResetKey(prev => prev + 1);
    }

    if(!tenant) return <Loading/>

    // Debug: Log the rows to see what we're working with
    console.log('Marketplace rows:', systemMarketplaceRows);

    return (
        <>
            {/*<h2
                style={{
                    fontSize: 20,
                    fontWeight: "bold",
                    textAlign: "center",
                    margin: "1rem 0",
                }}
            >
                {translate('tenant.marketplaces.title')}
            </h2>*/}

            <div style={{ margin: "1rem auto", width: "100%" }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 2, mb: 2 }}>
                    <Box sx={{ flexGrow: 1 }}>
                        <SearchableSelect
                            resource="ecommerce/system_marketplace"
                            selectLabel={translate('tenant.marketplaces.select')}
                            title={translate('tenant.marketplaces.select_marketplaces')}
                            isMultiple
                            isEmpty={true}
                            defaultValues={tenant?.systemMarketplaces || []}
                            renderText={(option) => option.name}
                            name="systemMarketplaces"
                        />
                    </Box>
                    {toDeleteSystemMarketplace.length > 0 && (
                        <Button
                            className="btn-success"
                            variant="outlined"
                            onClick={() => removeSystemMarketplace()}
                            color="error"
                            sx={{ mb: '4px' }}
                        >
                            {translate('tenant.marketplaces.delete_selected')}
                        </Button>
                    )}
                </Box>
                <Box sx={{ height: 400, width: "100%" }}>
                    <DataGrid
                        key={`marketplace-grid-${resetKey}`}
                        rows={(systemMarketplaceRows || []).filter((r: any) => r && r.id !== undefined)}
                        columns={columns}
                        getRowId={(row) => row.id}
                        checkboxSelection
                        onRowSelectionModelChange={(selectionModel: any) => {
                            console.log('Raw selection model:', selectionModel);
                            
                            // MUI X v8 returns {type: 'include'|'exclude', ids: Set<GridRowId>}
                            let selectionArray: any[] = [];
                            
                            if (Array.isArray(selectionModel)) {
                                // Legacy format
                                selectionArray = selectionModel;
                            } else if (selectionModel && typeof selectionModel === 'object' && selectionModel.ids) {
                                // New format v8: extract from Set
                                if (selectionModel.ids instanceof Set) {
                                    selectionArray = Array.from(selectionModel.ids);
                                } else if (Array.isArray(selectionModel.ids)) {
                                    selectionArray = selectionModel.ids;
                                }
                            }
                            
                            console.log('Marketplace selection changed:', selectionArray);
                            setToDeleteSystemMarketplace(selectionArray);
                        }}
                        disableRowSelectionOnClick
                        hideFooter
                    />
                </Box>
            </div>
        </>
    )
}

export const TenantMarketplaceSelectorCreate: React.FC<ITenantMarketplaceSelector> = ({
    method,
    ...props
}) => {
    const translate = useTranslate();
    const systemMarketplaceIdsDefaultValue = []

    const { data: systemMarketplaceList, isLoading } = useGetList(
        'ecommerce/system_marketplace',
        {},
        { refetchOnWindowFocus: false}
    );

    const columns: GridColDef[] = [
        { field: "id", headerName: "ID", width: 20 },
        {
            field: "name",
            headerName: translate('tenant.marketplaces.nombre') || "Nombre",
            width: 300,
            editable: false,
        },
        {
            field: "class",
            headerName: translate('tenant.marketplaces.clase') || "Clase",
            width: 300,
            editable: false,
        }
    ]

    const { setValue } = useFormContext();

    const onChange = (values: any) => {
        setValue("system_marketplace_ids", values);
    }

    useEffect(() => {
        setValue("system_marketplace_ids", systemMarketplaceIdsDefaultValue)
    }, [])

    if(isLoading || !systemMarketplaceList) return <Loading/>

    return (
        <Box sx={{ height: 400, width: "100%" }}>
            <DataGrid
                rows={(systemMarketplaceList || []).filter((r: any) => r && r.id !== undefined)}
                columns={columns}
                checkboxSelection
                onRowSelectionModelChange={(ids) => {
                    onChange(ids)
                }}
                disableRowSelectionOnClick
                hideFooter
            />
        </Box>
    )
}

export const TenantMarketplaceSelector: React.FC<ITenantMarketplaceSelector> = ({
    ...props
}) => {

   return props.method === "edit" ? 
                <TenantMarketplaceSelectorEdit {...props} /> 
                : 
                <TenantMarketplaceSelectorCreate  {...props} />

    
}

