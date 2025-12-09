import { Badge, Box, Chip, TextField } from '@mui/material';
import { Price } from '../interfaces/Price';
import { Product } from '../interfaces/Product';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import React, { useEffect, useState } from 'react'
import { useRecordContext } from "react-admin";
import { Tenant } from '../interfaces/Tenant';
import { TenantMarketplaceSelector, TenantMarketplaceSelectorCreate } from './TenantMarketplaceSelector';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { TenantMarketplaceSelectorForUserEdit } from './TenantMarketplaceSelectorForUser';

const TenantMarketplaceAssociationForUserEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({ props }) => {
  return <TenantMarketplaceSelectorForUserEdit {...props} />
}


const TenantMarketplaceAssociationForUserView: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {
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
      rows={tenant.systemMarketplaces}
      columns={columns}
      pageSize={5}
      rowsPerPageOptions={[25, 50, 100, 200, 500]}
      hideFooter={true}
      disableSelectionOnClick
    />
  </Box>
}

const TenantMarketplaceAssociationForUser = ({ method, attribute }: IDashAutoAdminCustomFieldComponent) => {
  switch (method) {
    case "edit":
      return <TenantMarketplaceAssociationForUserEdit attribute={attribute} method={method} />

    case "view":
      return <TenantMarketplaceAssociationForUserView attribute={attribute} method={method} />
  }
}

export default TenantMarketplaceAssociationForUser;
