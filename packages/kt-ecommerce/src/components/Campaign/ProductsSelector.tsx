import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin'
import React, { useState } from 'react'
import { TextField as RATextField } from 'react-admin'
import { useRecordContext } from "react-admin";
import { useController, useWatch } from "react-hook-form";

import { Box, Button } from '@mui/material';
import SearchableSelect from '../SearchableSelect';
import { DataGrid, GridColDef } from '@mui/x-data-grid';


const CampaignProductsSelectorView: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {
  const record = useRecordContext();
  // return <>{record.geocoded_address}</>
  return <RATextField label={attribute.label} source={attribute.attribute} options={attribute.fieldOptions} />;
}

const CampaignProductsSelectorEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {

  const record = useRecordContext();

  const [toDeleteProduct, setToDeleteProduct] = useState([]);

  const productIds = useWatch({ name: "product_ids" });

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 90 },
    {
      field: "description",
      headerName: "Nombre",
      width: 150,
      editable: false,
    },
    {
      field: "sku",
      headerName: "SKU",
      width: 150,
      editable: false,
    },
  ];

  const product_ids = useController({ name: "product_ids" });

  const removeProduct = () => {
    const filtered = productIds.filter(
      (item) => !toDeleteProduct.includes(item.id)
    );

    product_ids.field.onChange(filtered);
  };

  let defaultProductsIds = [];

  return (

    <div style={{ margin: "1rem auto", width: "100%" }}>
      {/* <TextInput source="title" label='Titulo' /> */}
      {
        <SearchableSelect
          resource="ecommerce/product"
          selectLabel="Seleccione"
          title="Seleccione productos"
          isMultiple
          isEmpty={true}
          defaultValues={defaultProductsIds || []}
          // transformData={(data) => (data.map(item => item.id))}
          renderText={(option) => option.description}
          name="product_ids"
        />
      }
      <Box sx={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={
            productIds?.length > 0 && productIds[0].id ? productIds : []
          }
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[25, 50, 100, 200, 500]}
          checkboxSelection


          onRowSelectionModelChange={(ids) => {



            setToDeleteProduct(ids.map((e) => parseInt(e as string)));

          }}

          disableSelectionOnClick
        />
      </Box>
     


         <Button
                           
                            variant="outlined"
                            onClick={() => removeProduct()}
                        >
                            Borrar seleccionados
                        </Button>

      
    </div>

  )

}

const CampaignProductsSelector = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
  switch (method) {
    case "edit":
    case "create":
      return <CampaignProductsSelectorEdit attribute={attribute} method={method} resourceConfig={resourceConfig} />
    case "view":
      return <CampaignProductsSelectorView attribute={attribute} method={method}  resourceConfig={resourceConfig} />
  }
}

export default CampaignProductsSelector;
