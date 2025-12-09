import {
    Box, Button
} from "@mui/material"
import React, { useEffect, useState } from "react"
import { useController, useFormContext } from "react-hook-form"
import { useWatch } from "react-hook-form"
import SearchableSelect from "./SearchableSelect"
import { DataGrid, GridColDef } from "@mui/x-data-grid"

import { Loading, useGetList, useGetOne, useRecordContext } from "react-admin"
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

    const tenantContext: Tenant = useRecordContext();

    const [toDeleteSystemMarketplace, setToDeleteSystemMarketplace] = useState([])
    const systemMarketplaceIds = useWatch({ name: "systemMarketplaces", defaultValue: [] })

    const { data: tenant, isLoading: tenantLoading, error: tenantError } = useGetOne('tenant/tenant', { id: tenantContext.id}, { refetchOnWindowFocus: false});

    useEffect(() => {
      
        if(tenant && !tenantLoading) {
            setValue("systemMarketplaces", tenant.systemMarketplaces)
        }
  
    }, [tenant,tenantLoading])

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

    const selected_system_marketplaces = useController({ name: "systemMarketplaces" })


    const removeSystemMarketplace = () => {
        const filtered = systemMarketplaceIds.filter(
            (item) => !toDeleteSystemMarketplace.includes(item.id)
        )
        //selected_system_marketplaces.field.onChange(filtered)
   
        setValue("systemMarketplaces",filtered);
    }
    if(!tenant) return <Loading/>
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
                    Relacionar Marketplaces con Tenant
                </h2>

                    <div style={{ margin: "1rem auto", width: "100%" }}>

                        <SearchableSelect
                            resource="ecommerce/system_marketplace"
                            selectLabel="Seleccione"
                            title="Seleccione marketplaces"
                            isMultiple
                            //isEmpty={tenant.systemMarketplaces ? false : true}
                            isEmpty={true}
                            defaultValues={tenant?.systemMarketplaces || []}
                            //transformData={(data) => (data.map(data => data.id))}
                            renderText={(option) => option.name}
                            name="systemMarketplaces"
                        />
                        <Box sx={{ height: 400, width: "100%" }}>
                            <DataGrid
                                rows={systemMarketplaceIds}
                                columns={columns}
                                pageSize={5}
                                rowsPerPageOptions={[25,50,100,200,500]}
                                checkboxSelection
                                onRowSelectionModelChange={(ids) => {
                          
                                    setToDeleteSystemMarketplace(ids)
                                
                                }}

                               
                                disableSelectionOnClick
                            />
                        </Box>
                        <Button
                            className="btn-success"
                            variant="outlined"
                            onClick={() => removeSystemMarketplace()}
                        >
                            Borrar seleccionados
                        </Button>
                    </div></>

        </>


    )
}

export const TenantMarketplaceSelectorCreate: React.FC<ITenantMarketplaceSelector> = ({
    method,
    ...props
}) => {
    const systemMarketplaceIdsDefaultValue = []
    //const [toDeleteSystemMarketplace, setToDeleteSystemMarketplace] = useState([])
    //const systemMarketplaceIds = useWatch({ name: "system_marketplace_ids", defaultValue: systemMarketplaceIdsDefaultValue  })

    const { data: systemMarketplaceList, total, isLoading, error, isFetching } = useGetList(
        'ecommerce/system_marketplace',
        {},
        { refetchOnWindowFocus: false}
    );

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

    const { setValue } = useFormContext();

    

    const onChange = (values) => {
    
        setValue("system_marketplace_ids",values);
    }

    useEffect(() => {
        setValue("system_marketplace_ids",systemMarketplaceIdsDefaultValue)

    },[])

    if(!systemMarketplaceList) return <Loading/>
    return (

        <>
            
                <DataGrid
                    rows={systemMarketplaceList}
                    columns={columns}
                    pageSize={5}
                    rowsPerPageOptions={[25,50,100,200,500]}
                    checkboxSelection
                    
                    onRowSelectionModelChange={(ids) => {
                       
                          
                        onChange(ids)
                      
                      }}


                    disableSelectionOnClick
                />

     </>


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

