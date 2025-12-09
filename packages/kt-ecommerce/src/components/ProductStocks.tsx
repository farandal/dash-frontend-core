import { Badge, Chip } from '@mui/material';

import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import React, { useEffect, useState } from 'react'
import { useGetList } from 'react-admin';
import { NumberInput } from 'react-admin';
import { useRecordContext } from "react-admin";
import { useController, useFieldArray, useFormContext } from 'react-hook-form';
import NumberFormat from 'react-number-format';
import { TextField } from 'react-admin';
import { TextInput } from 'react-admin';
import { LinearProgress } from 'react-admin';
import { LoadingIndicator } from 'react-admin';
import { StockType } from '../interfaces/StockType';
import { Product } from '../interfaces/Product';


//const StockField = ({ name, label, defaultValue }) => {
//    const {
//        field,
//        //fieldState: { isTouched, error },
//        // formState: { isSubmitted }
//    } = useController({ name /*, defaultValue*/ });
//console.log("PRODUCT STOCK FIELD NAME",name,defaultValue);
//    return (<>
//        <TextField
//            type='number'
//            fullWidth
//            {...field}
//            label={label}
//            defaultValue={defaultValue}
//            onChange={(e) => { field.onChange({ target: { name, value: e.target.value } }) }}
//            
//        // @TODO: integrar validador de moneda dependiendo del currency
//        //error={(isTouched || isSubmitted)}
//        //helperText={(isTouched || isSubmitted) && invalid ? error : ''}
//        />
//        
//        </>
//    );
//};

const StockField = ({ name, label, defaultValue, idx }) => <TextInput key={idx} label={label} fullWidth source={name} defaultValue={defaultValue} />

const StockViewField = ({ name, label, defaultValue, idx }) => {

  return <Badge key={idx} style={{ width: 50, fontSize: 4 }} badgeContent={label} color="primary">
    <Chip style={{ width: 100 }} label={defaultValue} />
  </Badge>

};

const ProductStocksEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute, resourceConfig }) => {
  const product: Product = useRecordContext();

  const { setValue, watch, formState } = useFormContext();
  const { fields, append } = useFieldArray({
    name: 'updatedStocks',
    keyName: 'stockKey',
  });

  const { data: availableStockTypes, isLoading: availableStockTypesLoading } = useGetList(
    'ecommerce/stock_type',
    { pagination: { page: 1, perPage: 100 } },
    { refetchOnWindowFocus: false }
  );

  useEffect(() => {
    if (product?.stocks && availableStockTypes) {
      availableStockTypes.forEach((stockType) => {
        const productStock = product.stocks.find(stock => stockType.id === stock.stock_type_id);
        setValue(`updatedStocks._${stockType.id}`, productStock?.stock || '', {
          shouldDirty: true,
          shouldTouch: true
        });
      });
    }
  }, [product, availableStockTypes, setValue]);

  return <>{availableStockTypes ? (availableStockTypes as StockType[]).map((stockType, idx) => {
    let productStock = product && product.stocks ? product.stocks.find(priceItem => stockType.id === priceItem.stock_type_id) : { stock: "" };
    return <TextInput
      key={idx}
      source={`updatedStocks._${stockType.id}`}
      label={stockType.name}
      defaultValue={productStock?.stock || ''}
    />
  }
  ) : <LinearProgress />}</>
}
const ProductStocksView: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute, resourceConfig }) => {
  const product: Product = useRecordContext();

  const { data: availableStockTypes, isLoading: availableStockTypesLoading } = useGetList(
    'ecommerce/stock_type',
    { /* pagination: false*/ },
    { refetchOnWindowFocus: false }
  );

  return (
    <table>
      {availableStockTypes && (availableStockTypes as StockType[]).map((stockType) => {
        let prodcutStock = product && product.stocks ? product.stocks.find(priceItem => stockType.id === priceItem.stock_type_id) : null;
        return (
          prodcutStock && prodcutStock.stock &&
          <tr>
            <td style={{ padding: "3px", backgroundColor: "#f5f5f5" }}>{stockType.name}</td>
            <td>{prodcutStock?.stock}</td>
          </tr>
        )
      })}
    </table>


  )
}

const ProductStocks = ({ method, attribute }: IDashAutoAdminCustomFieldComponent) => {
  switch (method) {
    case "edit":
    case "create":
      return <ProductStocksEdit attribute={attribute} method={method} resourceConfig={undefined} />
    case "view":
      return <ProductStocksView attribute={attribute} method={method} resourceConfig={undefined} />
  }
}


export default ProductStocks;