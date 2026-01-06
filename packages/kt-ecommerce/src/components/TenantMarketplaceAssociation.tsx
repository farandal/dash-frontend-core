import { Box } from '@mui/material';
import { ITenant as Tenant } from '../interfaces';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import React from 'react'
import { useRecordContext } from "react-admin";
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
        rows={(tenant.systemMarketplaces || []).filter((r: any) => r && r.id !== undefined)}
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

const TenantMarketplaceAssociation = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
  switch (method) {
    case "edit":
      return <TenantMarketplaceAssociationEdit attribute={attribute} method={method} resourceConfig={resourceConfig} />
    case "create":
      return <TenantMarketplaceAssociationCreate attribute={attribute} method={method} resourceConfig={resourceConfig} />
    case "view":
      return <TenantMarketplaceAssociationView attribute={attribute} method={method} resourceConfig={resourceConfig} />
  }
}

export default TenantMarketplaceAssociation;
