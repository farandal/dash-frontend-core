import { Box, Button } from '@mui/material';


import React, { useEffect, useState } from 'react'
import { Loading, useGetList, useRecordContext, useTranslate } from "react-admin";

import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useWatch, useController, useFormContext } from 'react-hook-form';
import SearchableSelect from './SearchableSelect';

import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import { NoResults } from 'dash-admin/src/components/misc/NoResults';
import { Tenant } from '../interfaces';

export interface ITenantPointOfSaleSelector {
    //tenant: Tenant
    method: string
}

export const TenantPointOfSaleSelector: React.FC<ITenantPointOfSaleSelector> = ({
    method,
    ...props
}) => {
    const { setValue } = useFormContext();
    const translate = useTranslate();
    const tenant: Tenant = useRecordContext();

    const [toDeletesystemPointOfSale, setToDeletesystemPointOfSale] = useState<any[]>([])
    const [resetKey, setResetKey] = useState(0)
    const systemPointOfSaleRows = useWatch({ name: "systemPointOfSales", defaultValue: tenant?.systemPointOfSales || [] })

    useEffect(() => {
        // Initial sync of IDs if not present
        if (tenant?.systemPointOfSales) {
            setValue("system_point_of_sale_ids", tenant.systemPointOfSales.map((p: any) => p.id));
        }
    }, [tenant, setValue]);

    const columns: GridColDef[] = [
        { field: "id", headerName: "ID", width: 20 },
        {
            field: "name",
            headerName: translate('tenant.point_of_sales.nombre') || "Nombre",
            width: 300,
            editable: false,
        },
        {
            field: "class",
            headerName: translate('tenant.point_of_sales.clase') || "Clase",
            width: 300,
            editable: false,
        }
    ]

    const removesystemPointOfSale = () => {
        const selection = Array.isArray(toDeletesystemPointOfSale) ? toDeletesystemPointOfSale : [];
        if (selection.length === 0) return;

        const filtered = (systemPointOfSaleRows || []).filter(
            (item: any) => item && item.id && !selection.map(String).includes(String(item.id))
        )
        
        setValue("systemPointOfSales", filtered);
        setValue("system_point_of_sale_ids", filtered.map((p: any) => p.id));
        setToDeletesystemPointOfSale([]);
        // Force grid reset to clear checkboxes
        setResetKey(prev => prev + 1);
    }

    return (
        <>
            {/*
            <h2
                style={{
                    fontSize: 20,
                    fontWeight: "bold",
                    textAlign: "center",
                    margin: "1rem 0",
                }}
            >
                {translate('tenant.point_of_sales.title')}
            </h2>*/
            }

            <div style={{ margin: "1rem auto", width: "100%" }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 2, mb: 2 }}>
                    <Box sx={{ flexGrow: 1 }}>
                        <SearchableSelect
                            resource="ecommerce/system_point_of_sale"
                            selectLabel={translate('tenant.point_of_sales.select')}
                            title={translate('tenant.point_of_sales.select_pos')}
                            isMultiple
                            isEmpty={true}
                            defaultValues={tenant?.systemPointOfSales || []}
                            renderText={(option) => option.name}
                            name="systemPointOfSales"
                        />
                    </Box>
                    {toDeletesystemPointOfSale.length > 0 && (
                        <Button
                            variant="outlined"
                            onClick={() => removesystemPointOfSale()}
                            color="error"
                            sx={{ mb: '4px' }}
                        >
                            {translate('tenant.point_of_sales.delete_selected')}
                        </Button>
                    )}
                </Box>
                <Box sx={{ height: 400, width: "100%" }}>
                    <DataGrid
                        key={`pos-grid-${resetKey}`}
                        rows={(systemPointOfSaleRows || []).filter((r: any) => r && r.id !== undefined)}
                        columns={columns}
                        onRowSelectionModelChange={(selectionModel: any) => {
                            console.log('Raw POS selection model:', selectionModel);
                            
                            // MUI X v8 returns {type: 'include'|'exclude', ids: Set<GridRowId>}
                            let selectionArray: any[] = [];
                            
                            if (Array.isArray(selectionModel)) {
                                selectionArray = selectionModel;
                            } else if (selectionModel && typeof selectionModel === 'object' && selectionModel.ids) {
                                if (selectionModel.ids instanceof Set) {
                                    selectionArray = Array.from(selectionModel.ids);
                                } else if (Array.isArray(selectionModel.ids)) {
                                    selectionArray = selectionModel.ids;
                                }
                            }
                            
                            console.log('POS selection changed:', selectionArray);
                            setToDeletesystemPointOfSale(selectionArray);
                        }}
                        checkboxSelection
                        disableRowSelectionOnClick
                        hideFooter
                    />
                </Box>
            </div>
        </>
    )
}

export const TenantPointOfSaleSelectorCreate: React.FC<ITenantPointOfSaleSelector> = ({
    method,
    ...props
}) => {
    const translate = useTranslate();
    const { setValue } = useFormContext();

    const { data: systemPointOfSaleList, isLoading } = useGetList(
        "ecommerce/system_point_of_sale",
        {},
        { refetchOnWindowFocus: false}
    );

    const columns: GridColDef[] = [
        { field: "id", headerName: "ID", width: 20 },
        {
            field: "name",
            headerName: translate('tenant.point_of_sales.nombre') || "Nombre",
            width: 300,
            editable: false,
        },
        {
            field: "class",
            headerName: translate('tenant.point_of_sales.clase') || "Clase",
            width: 300,
            editable: false,
        }
    ]

    const onChange = (values: any) => {
        setValue("system_point_of_sale_ids", values);
    }

    if(isLoading || !systemPointOfSaleList) return <Loading/>

    return (
        <Box sx={{ height: 400, width: "100%" }}>
            <DataGrid
                rows={(systemPointOfSaleList || []).filter((r: any) => r && r.id !== undefined)}
                columns={columns}
                checkboxSelection
                onRowSelectionModelChange={(ids: any) => {
                    onChange(ids)
                }}
                disableRowSelectionOnClick
                hideFooter
            />
        </Box>
    )
}


const TenantPointOfSaleAssociationEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {

    return <TenantPointOfSaleSelector method={method} />
}

const TenantPointOfSaleAssociationView: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {
    const tenant: Tenant = useRecordContext();

    const columns: GridColDef[] = [
        {
            field: "name",
            headerName: "Nombre",
            width: 300,
            editable: false,
        },
        {
            field: "class",
            headerName: "Clase",
            width: 300,
            editable: false,
        }
    ]

    return <Box sx={{ width: "100%", height: 400 }}>
         {tenant.systemPointOfSales && tenant.systemPointOfSales.length > 0 ? (
        <DataGrid
            rows={(tenant.systemPointOfSales || []).filter((r: any) => r && r.id !== undefined)}
            columns={columns}
            hideFooter={true}
            disableRowSelectionOnClick
        />
    ) : (
        <NoResults
         
            title="No hay resultados"
            description="No hay marketplaces asociados"
        />
    )}
    </Box>
}
const TenantPointOfSaleAssociation = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
    switch (method) {
        case "edit":
        case "create":
            return <TenantPointOfSaleAssociationEdit attribute={attribute} method={method} resourceConfig={resourceConfig} />
        case "view":
            return <TenantPointOfSaleAssociationView attribute={attribute} method={method}  resourceConfig={resourceConfig} />
    }
}

export default TenantPointOfSaleAssociation;
