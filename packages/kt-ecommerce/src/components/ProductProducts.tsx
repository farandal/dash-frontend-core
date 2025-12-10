import { Button, FormControlLabel, Switch } from '@mui/material';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import React, { Fragment, useEffect } from 'react'
import { TextInput, useInput } from 'react-admin';
import { useRecordContext } from "react-admin";
import { useFieldArray, useFormContext } from 'react-hook-form';
import SearchableSelect from './SearchableSelect';
import { Product } from '..';


const ProductProductsEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {

  const product: Product = useRecordContext();
  const { fields, append, remove } = useFieldArray({
    name: 'products',
    keyName: 'prodKey',
  });

  // Get form methods to update the form state
  const { setValue, watch, formState } = useFormContext();

  // Use useInput to properly integrate with react-admin's form state
  const { field } = useInput({ source: 'is_pack' });

  // Watch the is_pack value from the form
  const formIsPackValue = watch('is_pack');

  useEffect(() => {
    if (product?.products && product?.products?.length) {
      // Ensure form state is synced on initial load
      setValue('is_pack', true, {
        shouldDirty: true,
        shouldTouch: true
      });
    }
  }, [product, setValue]);

  // Handle toggle change
  const handleIsPackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;

    // Update the form state with options that mark the form as dirty and touched
    setValue('is_pack', checked, {
      shouldDirty: true,
      shouldTouch: true
    });

    // Also update through the react-admin input to ensure proper integration
    field.onChange(checked);
  };

  return <>
    <br />
    {/* We can add this for debugging purposes */}
    {/* <div>Form is dirty: {formState.isDirty ? 'Yes' : 'No'}</div> */}

    <FormControlLabel
      value={formIsPackValue}
      control={
        <Switch
          checked={formIsPackValue || false}
          onChange={handleIsPackChange}
        />
      }
      label="¿Es un pack?"
    />
    {formIsPackValue && <Button onClick={() => append({ product: undefined, quantity: 0 })}>Agregar</Button>}
    {formIsPackValue && fields.map((item, index) => {
      return <Fragment key={item.prodKey}>
        <SearchableSelect resource='ecommerce/product' selectLabel='Seleccione' title='Seleccione un producto' renderText={(option) => `${option.sku} - ${option.description} `} name={`products.${index}.product`} />
        <TextInput source={`products.${index}.quantity`} label="Stock" /><Button onClick={() => remove(index)}>X</Button>
      </Fragment>
    })}
  </>
}
const ProductProductsView: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {
  const product: Product = useRecordContext();
  return (
    <></>
  )
}

const ProductProducts = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
  switch (method) {
    case "edit":
    case "create":
      return <ProductProductsEdit attribute={attribute} method={method} resourceConfig={resourceConfig} />
    case "view":
      return <ProductProductsView attribute={attribute} method={method} resourceConfig={resourceConfig} />
  }
}

export default ProductProducts;