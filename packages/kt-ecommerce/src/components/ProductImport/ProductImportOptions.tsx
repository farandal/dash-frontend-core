import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';;
import React, { useState } from 'react'
import { useController } from 'react-hook-form';
import { Switch } from '@mui/material';
import MUISimpleJsonTable from '../MuiSimpleJsonTable';
import { useRecordContext } from 'react-admin';

const ProductImportOptionsEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {

  const createCategoriesField = useController({ name: 'create_new_categories', defaultValue: 0 });
  const assignDefaultBrand = useController({ name: 'assign_default_brand', defaultValue: 0 });
  const assignDefaultCategory = useController({ name: 'assign_default_category', defaultValue: 0 });

  return (
    <>

      <section>
        <label>Crear categorías</label>
        <Switch  {...createCategoriesField.field}
          onChange={(event) => {
            createCategoriesField.field.onChange(event.target.value ? 1 : 0)
          }}
        />
      </section>


      <section>
        <label>Asignar a categoría default</label>
        <Switch  {...assignDefaultBrand.field}
          onChange={(event) => {
            assignDefaultCategory.field.onChange(event.target.value ? 1 : 0)
          }}
        />
      </section>


      <section>
        <label>Asignar a marca default, productos que no coincidan con ningun mapeo de marca</label>
        <Switch  {...assignDefaultBrand.field}
          onChange={(event) => {
            assignDefaultBrand.field.onChange(event.target.value ? 1 : 0)
          }}
        />
      </section>

    </>

  )
}

const ProductImportOptionsView: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute, resourceConfig }) => {
  const record = useRecordContext();

  return <MUISimpleJsonTable vertical tableData={record.options.product_template} showKey ignore={["preview_cols", "preview_rows", "productTemplateColumns"]} />

}


const ProductImportOptions = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
  switch (method) {
    case "edit":
    case "create":
      return <ProductImportOptionsEdit attribute={attribute} method={method} resourceConfig={resourceConfig} />
    case "view":
      return <ProductImportOptionsView attribute={attribute} method={method} resourceConfig={resourceConfig} />
    case "list":
      return <ProductImportOptionsView attribute={attribute} method={method} resourceConfig={resourceConfig} />
  }
}


export default ProductImportOptions;
