import { Button, FormControlLabel, Switch } from '@mui/material';
import { Product } from '../interfaces/Product';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';;
import React, { Fragment, useEffect, useState } from 'react'
import { TextInput } from 'react-admin';
import { useRecordContext } from "react-admin";
import { useGetList } from 'react-admin';
import History from './Product/History';
import { Loading } from 'react-admin';

export interface IProductHistoryComponent {
  product: Product
}
export const ProductHistoryComponent: React.FC<IProductHistoryComponent> = ({ product }) => {
  // const product: Product = useRecordContext();

  return (product ? <History currentProduct={product} /> : <Loading />)
}

const ProductHistoryEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {

  const product: Product = useRecordContext();

  return (
    <>{product &&
      <ProductHistoryComponent product={product} />
    }</>
  )
}

const ProductHistoryView: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {
  const product: Product = useRecordContext();
  return (
    <>{product &&
      <ProductHistoryComponent product={product} />
    }</>
  )
}


const ProductHistory = ({ method, attribute }: IDashAutoAdminCustomFieldComponent) => {
  switch (method) {
    case "edit":
    case "create":
      return <ProductHistoryEdit attribute={attribute} method={method} />
    case "view":
      return <ProductHistoryView attribute={attribute} method={method} />
  }
}


export default ProductHistory;
