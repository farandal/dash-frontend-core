import { Badge, Box, Chip, TextField } from '@mui/material';

import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import React, { useEffect, useState } from 'react'
import { Loading, useGetList, useRecordContext, useGetOne } from "react-admin";

import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useWatch, useController, useFormContext } from 'react-hook-form';
import SearchableSelect from './SearchableSelect';
import { Col, Row, Divider, Button as ButtonAntd } from "antd";
import { Tenant } from '../interfaces';

export interface ITenantPointOfSaleSelectorForUser {
  //tenant: Tenant
  method: string
}

export const TenantPointOfSaleSelectorForUser: React.FC<ITenantPointOfSaleSelectorForUser> = ({
  method,
  ...props
}) => {

  const tenantContext: Tenant = useRecordContext();

  const { data: tenant, isLoading: tenantLoading, error: tenantError } = useGetOne('tenant/tenant', { id: tenantContext.id }, { refetchOnWindowFocus: false });

  const { setValue } = useFormContext();
  const systemPointOfSaleIds = useWatch({ name: "systemPointOfSales", defaultValue: tenant?.systemPointOfSales || [] })

  useEffect(() => {
    console.log(systemPointOfSaleIds);
  }, [systemPointOfSaleIds])

  useEffect(() => {
    if (tenant) {
      setValue("systemPointOfSales", tenant.systemPointOfSales)
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
        Puntos de venta asociados al Tenant
      </h2>

        <div style={{ margin: "1rem auto", width: "100%" }}>

          <Box sx={{ height: 400, width: "100%" }}>
            <DataGrid
              rows={systemPointOfSaleIds}
              columns={columns}
              pageSize={5}
              rowsPerPageOptions={[25, 50, 100, 200, 500]}
              disableSelectionOnClick
            />
          </Box>
        </div></>
    </>

  )
}

const TenantPointOfSaleAssociationForUserEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {
  return <TenantPointOfSaleSelectorForUser method={method} />
}

const TenantPointOfSaleAssociationForUserView: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {
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

  return <Box sx={{ height: 200, width: "100%" }}>
    <DataGrid
      rows={tenant.systemPointOfSales}
      columns={columns}
      pageSize={5}
      rowsPerPageOptions={[25, 50, 100, 200, 500]}
      hideFooter={true}
      disableSelectionOnClick
    />
  </Box>
}

const TenantPointOfSaleAssociationForUser = ({ method, attribute }: IDashAutoAdminCustomFieldComponent) => {
  switch (method) {
    case "edit":
    case "create":
      return <TenantPointOfSaleAssociationForUserEdit attribute={attribute} method={method} />
    case "view":
      return <TenantPointOfSaleAssociationForUserView attribute={attribute} method={method} />
  }
}

export default TenantPointOfSaleAssociationForUser;
