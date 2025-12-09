import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';;
import React, { useState } from 'react'
import { useController } from 'react-hook-form';
import { Chip, Switch } from '@mui/material';
import MUISimpleJsonTable from '../MuiSimpleJsonTable';
import { useRecordContext } from 'react-admin';

const ProductImportStatusEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {
  // No se puede editar el status desde el panel
  return (
    <>
    </>
  )
}

const ProductImportStatusView: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {
  const record = useRecordContext();
  return (
    <Chip label={record.status} />
  )
}


const ProductImportStatus = ({ method, attribute }: IDashAutoAdminCustomFieldComponent) => {
  switch (method) {
    case "edit":
    case "create":
      return <ProductImportStatusEdit attribute={attribute} method={method} />
    case "view":
      return <ProductImportStatusView attribute={attribute} method={method} />
    case "list":
      return <ProductImportStatusView attribute={attribute} method={method} />
  }
}


export default ProductImportStatus;
