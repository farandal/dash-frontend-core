import { Chip, Tooltip } from '@mui/material';

import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import React, {  } from 'react'
import { useGetList } from 'react-admin';
import { useRecordContext } from "react-admin";
import { NumericFormat } from 'react-number-format';
import numeral from 'numeral';
import { TextInput } from 'react-admin';
import { LoadingIndicator } from 'react-admin';

import { Product } from '..';

interface IProductPrices extends IDashAutoAdminCustomFieldComponent {

}

const ProductPricesView: React.FC<IProductPrices> = ({ method, attribute, data }) => {

  const product = useRecordContext();

  const prices = product?.prices;
  
  return <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
    {prices && prices.filter(price => !price.pricelist?.is_internal).map((price) => 
      <Tooltip 
        key={price.id}
        title={price.pricelist?.name || 'Price List'}
        arrow
        placement="top"
      >
        <Chip
          label={`${price.pricelist?.currency?.symbol}${price.price} `}
          sx={{
            fontSize: '12px',
            p: 0
          }}
          size='small'
        />
      </Tooltip>
    )}
  </div>}

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

const PriceField = ({ name, label, defaultValue, currency, idx }) => {

  const NumberFormatCustom = React.forwardRef<
    typeof NumericFormat,
    CustomProps
  >(function NumberFormatCustom(props, ref) {
    const { onChange, ...other } = props;
    /* TODO: This requires to be upgraded!!! NumericFormat deprecation */
    return <NumericFormat key={idx}
      {...other}
      getInputRef={ref}
      onValueChange={(values) => {
        onChange({
          target: {
            name: props.name,
            value: values.value,
          },
        });
      }}
      valueIsNumericString
      /* @ts-ignore */
      form={(value) => currency?.symbol + numeral(value).format(currency?.format)}
    />
  });
  return <TextInput key={idx} fullWidth InputProps={{
    inputComponent: NumberFormatCustom as any,
    fullWidth: true
  }}
    label={label} source={name} defaultValue={defaultValue} />
};

const ProductPricesEdit: React.FC<IProductPrices> = ({ method, attribute, data }) => {

  const product: Product = useRecordContext();

  const { data: availablePriceLists, isLoading: availablePriceListsLoading } = useGetList(
    'ecommerce/pricelist',
    { pagination: { page: 1, perPage: 1000 } },
    { refetchOnWindowFocus: false }
  );

  // 🔥 FIXED: Add loading state and error handling
  if (availablePriceListsLoading) {
    return <LoadingIndicator />;
  }

  if (!availablePriceLists || availablePriceLists.length === 0) {
    return <div>No price lists available</div>;
  }

  return <>{availablePriceLists && availablePriceLists.map((priceList, idx) => {
    // 🔥 FIXED: Add null check for priceList
    if (!priceList) {
      console.warn(`ProductPricesEdit: priceList at index ${idx} is null or undefined`);
      return null;
    }

    let productPrice = product?.prices?.find(priceItem => priceList.id === priceItem.pricelist_id) || { price: "" };
    
    // 🔥 FIXED: Changed pricelist to priceList (typo fix)
    return <PriceField 
      idx={idx} 
      key={idx} 
      name={"updatedPrices._" + priceList.id} 
      label={priceList.name} // 🔥 FIXED: was pricelist.name
      defaultValue={(productPrice?.price) ?? ""} 
      currency={priceList.currency} 
    />
  })}</>
}

const ProductPrices = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {

  switch (method) {
    case "edit":
    case "create":
      return <ProductPricesEdit attribute={attribute} method={method} resourceConfig={resourceConfig} />
    case "view":
    case "list":
      return <ProductPricesView attribute={attribute} method={method} resourceConfig={resourceConfig} />
  }
}

export default ProductPrices;

