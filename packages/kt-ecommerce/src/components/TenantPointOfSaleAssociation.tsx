import { Box, Button } from '@mui/material';


import React, { useEffect, useState } from 'react'
import { Loading, useGetList, useRecordContext } from "react-admin";

import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useWatch, useController } from 'react-hook-form';
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

    const tenant: Tenant = useRecordContext();

    const [toDeletesystemPointOfSale, setToDeletesystemPointOfSale] = useState([])
    const systemPointOfSaleIds = useWatch({ name: "systemPointOfSales", defaultValue: tenant?.systemPointOfSales || [] })

    useEffect(() => {
        console.log(systemPointOfSaleIds);

    }, [systemPointOfSaleIds])


    const columns: GridColDef[] = [
        { field: "id", headerName: "ID", width: 20 },
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

    const selected_system_point_of_sales = useController({ name: "systemPointOfSales" })

    const removesystemPointOfSale = () => {
        const filtered = systemPointOfSaleIds.filter(
            (item) => !toDeletesystemPointOfSale.includes(item.id)
        )
        selected_system_point_of_sales.field.onChange(filtered)
    }

    return (
        <>
                <><h2
                    style={{
                        fontSize: 20,
                        fontWeight: "bold",
                        textAlign: "center",
                        margin: "1rem 0",
                    }}
                >
                    Relacionar Puntos de venta con el Tenant
                </h2>

                    <div style={{ margin: "1rem auto", width: "100%" }}>

                        <SearchableSelect
                            resource="ecommerce/system_point_of_sale"
                            selectLabel="Seleccione"
                            title="Seleccione puntos de venta"
                            isMultiple
                            //isEmpty={tenant.systemPointOfSales ? false : true}
                            isEmpty={true}
                            defaultValues={tenant?.systemPointOfSales || []}
                            //transformData={(data) => (data.map(data => data.id))}
                            renderText={(option) => option.name}
                            name="systemPointOfSales"
                        />
                        <Box sx={{ height: 400, width: "100%" }}>
                            <DataGrid
                                rows={systemPointOfSaleIds}
                                columns={columns}
                                
                                onRowSelectionModelChange={(ids) => {
                                   
                           /* @ts-ignore */
                                    setToDeletesystemPointOfSale(ids);
                                    //setToDeletesystemPointOfSale(ids.map((e) => parseInt(e as string)));
                                  
                                  }}

                                initialState={{
                                    pagination: {
                                        paginationModel: {
                                            pageSize: 25,
                                        },
                                    },
                                }}
                                pageSizeOptions={[25, 50, 100, 200, 500]}
                                hideFooter={true}
                                disableRowSelectionOnClick
                            />
                        </Box>
                      
                           <Button
                           
                            variant="outlined"
                            onClick={() => removesystemPointOfSale()}
                        >
                            Borrar seleccionados
                        </Button>
                    </div></>
        </>


    )
}

export const TenantPointOfSaleSelectorCreate: React.FC<ITenantPointOfSaleSelector> = ({
    method,
    ...props
}) => {


    const [toDeletesystemPointOfSale, setToDeletesystemPointOfSale] = useState([])
    const systemPointOfSaleIds = useWatch({ name: "systemPointOfSales", defaultValue: [] })

    const { data: systemPointOfSaleIdsList, total, isLoading, error } = useGetList(
        "ecommerce/system_point_of_sale",
        {
            /*pagination: false*/
        },
        { refetchOnWindowFocus: false}
    );

    useEffect(() => {
        console.log(systemPointOfSaleIds);

    }, [systemPointOfSaleIds])


    const columns: GridColDef[] = [
        { field: "id", headerName: "ID", width: 20 },
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

    const selected_system_point_of_sales = useController({ name: "systemPointOfSales" })

    const removesystemPointOfSale = () => {
        const filtered = systemPointOfSaleIds.filter(
            (item) => !toDeletesystemPointOfSale.includes(item.id)
        )
        selected_system_point_of_sales.field.onChange(filtered)
    }

    if(!systemPointOfSaleIdsList) return <Loading/>
    return (

                <DataGrid
                    rows={systemPointOfSaleIdsList}
                    columns={columns}
                   
                    checkboxSelection
                  
                    onRowSelectionModelChange={(ids) => {
                                   
                 
                          /* @ts-ignore */
                        setToDeletesystemPointOfSale(ids)
                      
                      }}



                    initialState={{
                        pagination: {
                            paginationModel: {
                                pageSize: 25,
                            },
                        },
                    }}
                    pageSizeOptions={[25, 50, 100, 200, 500]}
                    hideFooter={true}
                    disableRowSelectionOnClick
                />


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

    return <Box sx={{ width: "100%" }}>
         {tenant.systemPointOfSales && tenant.systemPointOfSales.length > 0 ? (
        <DataGrid
            rows={tenant.systemPointOfSales}
            columns={columns}
            initialState={{
                pagination: {
                    paginationModel: {
                        pageSize: 25,
                    },
                },
            }}
            pageSizeOptions={[25, 50, 100, 200, 500]}
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
