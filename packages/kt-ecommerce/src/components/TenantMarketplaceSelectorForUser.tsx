import {
    Box
} from "@mui/material"
import React, { useEffect, useState } from "react"
import { useController, useFormContext } from "react-hook-form"
import { useWatch } from "react-hook-form"
import SearchableSelect from "./SearchableSelect"
import { DataGrid, GridColDef } from "@mui/x-data-grid"
import { Col, Row, Divider, Button as ButtonAntd } from "antd"
import { Tenant } from "../interfaces/Tenant"
import { Loading, useGetList, useGetOne, useRecordContext } from "react-admin"

export interface ITenantMarketplaceSelectorForUser {
    //tenant: Tenant
    method: string
}

export const TenantMarketplaceSelectorForUserEdit: React.FC<ITenantMarketplaceSelectorForUser> = ({
    method,
    ...props
}) => {
    const { setValue } = useFormContext();

    const tenantContext: Tenant = useRecordContext();

   
    const systemMarketplaceIds = useWatch({ name: "systemMarketplaces", defaultValue: [] })

    const { data: tenant, isLoading: tenantLoading, error: tenantError } = useGetOne('tenant/tenant', { id: tenantContext.id}, { refetchOnWindowFocus: false});

    useEffect(() => {
        console.log(systemMarketplaceIds);
    }, [systemMarketplaceIds])

    useEffect(() => {
       
        if(tenant) {
            setValue("systemMarketplaces", tenant.systemMarketplaces)
        }
  
    }, [tenant])

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
                    Marketplaces asociados con el Tenant
                </h2>

                    <div style={{ margin: "1rem auto", width: "100%" }}>

                        
                        <Box sx={{ height: 400, width: "100%" }}>
                            <DataGrid
                                rows={systemMarketplaceIds}
                                columns={columns}
                                pageSize={5}
                                rowsPerPageOptions={[25,50,100,200,500]}
                               
                               
                                disableSelectionOnClick
                            />
                        </Box>
                        
                    </div></>

        </>

    )
}

export const TenantMarketplaceSelectorForUserCreate: React.FC<ITenantMarketplaceSelectorForUser> = ({
    method,
    ...props
}) => {
    const systemMarketplaceIdsDefaultValue = []
    
    const { data: systemMarketplaceList, total, isLoading, error, isFetching } = useGetList(
        'ecommerce/system_marketplace',
        {
            pagination: false,
        },
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




export const TenantMarketplaceSelectorForUser: React.FC<ITenantMarketplaceSelectorForUser> = ({
    ...props
}) => {

   return props.method === "edit" ? 
                <TenantMarketplaceSelectorForUserEdit {...props} /> 
                : 
                <TenantMarketplaceSelectorForUserCreate  {...props} />

    
}

