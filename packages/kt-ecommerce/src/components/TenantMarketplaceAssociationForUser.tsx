import { Box } from '@mui/material';
import { ITenant as Tenant } from '../interfaces';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import React from 'react'
import { useRecordContext } from "react-admin";
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
      initialState={{
                    pagination: {
                        paginationModel: { pageSize: 5 },
                    },
                }}
      pageSizeOptions={[25, 50, 100, 200, 500]}
      hideFooter={true}
      disableRowSelectionOnClick
    />
  </Box>
}

const TenantMarketplaceAssociationForUser = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
  switch (method) {
    case "edit":
      return <TenantMarketplaceAssociationForUserEdit attribute={attribute} method={method} resourceConfig={resourceConfig} />

    case "view":
      return <TenantMarketplaceAssociationForUserView attribute={attribute} method={method} resourceConfig={resourceConfig} />
  }
}

export default TenantMarketplaceAssociationForUser;
