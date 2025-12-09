import { ISelectedExportColumn } from "../components/Product/ProductImportExport/Interfaces";
import ProductTemplateShow from "../components/Product/ProductTemplateShow";
import { IDashAutoAdminResourceConfig } from "dash-auto-admin";
import productTemplateSchema from "../schemas/productTemplate";

import TrashTemplate from "dash-admin/src/resources/Trash/TrashTemplate";
import ResourceTemplate from "dash-admin/src/templates/ResourceTemplate";
import React from "react";
import ListAlt from "@mui/icons-material/ListAlt";

const productExportTemplateResource: IDashAutoAdminResourceConfig =
{
  roles: ["*"],
  component: ResourceTemplate,
  //createComponent: (resourceConfig) => <ProductTemplateExportForm  method="create" />,
  //editComponent: (resourceConfig) =>  <ProductTemplateExportForm method="edit" />,
  showComponent: (resourceConfig) => <ProductTemplateShow />,
  //customRoutes: (resourceConfig) => TrashTemplate(resourceConfig) ,
  model: "ecommerce/product_export_templates",
  group: "Import/Export",
  label: "Plantillas de exportación",
  schema: productTemplateSchema,
  icon: <ListAlt />,
  redirectAfterUpdate: false,
  showDialogAfterSubmit: true,
  closeDrawerAfterSave: false,
  menu: [
    {
      title: "Lista de plantillas de exportación",
      redirect: "/ecommerce/product_export_templates",
    },
    /*{
    title: "🗑",
    redirect: "/trash/product_export_template",
}*/
  ],
  mainAction: {
    title: "Crear Plantilla",
    // type: "ghost",
    redirect: "/ecommerce/product_export_template/create",
  },
  isFormData: false,
  //saveButtonAlwaysEnabled: true,
  drawer: true,

  postFormatter: (data) => {
    const selectedColumns: ISelectedExportColumn[] =
      data.selectedColumns;
    
    const product_template_columns = selectedColumns.map(
      (selectedColumn, idx) => {
        return {
          ...selectedColumn,
          data_index: idx,
          editable: 1,
        };
      }
    );

    return {
      //tenant_id: globalTenantId,
      name: data.name,
      product_template_columns: product_template_columns,
      //file: data.fileField.fileList ? data.fileField.fileList[0].name : "",
      skip_rows: data.skipHeaders,
      tenant_id: data.tenant_id,
      type: "EXPORT",
    };
  },
  search: true,
  listProps: { storeKey: false }, // deshabilita persistencia deel estado, cache de los valores seleccionados sort, page, etc.
  resetSelectedIdsOnLoad: true,
  saveButtonAlwaysEnabled: true,
  processErrors: false,
}


export default productExportTemplateResource;