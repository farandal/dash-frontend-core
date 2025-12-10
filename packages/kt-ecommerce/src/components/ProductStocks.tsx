
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import React, { useEffect } from 'react'
import { useGetList } from 'react-admin';
import { useRecordContext } from "react-admin";
import { useFieldArray, useFormContext } from 'react-hook-form';
import { TextInput } from 'react-admin';
import { LinearProgress } from 'react-admin';
import { IStockType, Product } from '..';


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

  return <>{availableStockTypes ? (availableStockTypes as IStockType[]).map((stockType, idx) => {
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
      {availableStockTypes && (availableStockTypes as IStockType[]).map((stockType) => {
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

const ProductStocks = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
  switch (method) {
    case "edit":
    case "create":
      return <ProductStocksEdit attribute={attribute} method={method} resourceConfig={undefined} />
    case "view":
      return <ProductStocksView attribute={attribute} method={method} resourceConfig={undefined} />
  }
}


export default ProductStocks;