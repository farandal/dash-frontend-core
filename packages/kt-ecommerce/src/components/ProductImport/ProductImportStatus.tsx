import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';;
import React, { useState } from 'react'
import { useController } from 'react-hook-form';
import { Chip, Switch } from '@mui/material';
import MUISimpleJsonTable from '../MuiSimpleJsonTable';
import { useRecordContext, useTranslate } from 'react-admin';

const ProductImportStatusEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {
  // No se puede editar el status desde el panel
  return (
    <>
    </>
  )
}

const ProductImportStatusView: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {
  const record = useRecordContext();
  const translate = useTranslate();
  return (
    <Chip label={translate(`resource.import.instances.statuses.${record.status}`)} />
  )
}


const ProductImportStatus = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
  switch (method) {
    case "edit":
    case "create":
      return <ProductImportStatusEdit attribute={attribute} method={method} resourceConfig={resourceConfig} />
    case "view":
      return <ProductImportStatusView attribute={attribute} method={method} resourceConfig={resourceConfig} />
    case "list":
      return <ProductImportStatusView attribute={attribute} method={method} resourceConfig={resourceConfig} />
  }
}


export default ProductImportStatus;
