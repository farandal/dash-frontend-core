import { Badge, Box, Chip, TextField } from '@mui/material';
import { Price } from '../interfaces/Price';
import { Product } from '../interfaces/Product';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import React, { useEffect, useState } from 'react'
import { Empty, useRecordContext } from "react-admin";
import { Tenant } from '../interfaces/Tenant';
import { TenantMarketplaceSelector, TenantMarketplaceSelectorCreate } from './TenantMarketplaceSelector';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { NoResults } from 'dash-admin/src/components/misc/NoResults';

const TenantMarketplaceAssociationEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {

  return <TenantMarketplaceSelector method={method} />
}

const TenantMarketplaceAssociationCreate: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {

  return <TenantMarketplaceSelectorCreate method={method} />
}


const TenantMarketplaceAssociationView: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {
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

    {tenant.systemMarketplaces && tenant.systemMarketplaces.length > 0 ? (
      <DataGrid
        rows={tenant.systemMarketplaces}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 5 }
          }
        }}
        rowsPerPageOptions={[25, 50, 100, 200, 500]}
        hideFooter={true}
        disableSelectionOnClick
      />
    ) : (
      <NoResults
        title="No hay resultados"
        description="No hay marketplaces asociados"
      />
    )}
  </Box>
}

const TenantMarketplaceAssociation = ({ method, attribute }: IDashAutoAdminCustomFieldComponent) => {
  switch (method) {
    case "edit":
      return <TenantMarketplaceAssociationEdit attribute={attribute} method={method} />
    case "create":
      return <TenantMarketplaceAssociationCreate attribute={attribute} method={method} />
    case "view":
      return <TenantMarketplaceAssociationView attribute={attribute} method={method} />
  }
}

export default TenantMarketplaceAssociation;
