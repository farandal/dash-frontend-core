import { IDashAutoAdminResourceConfig } from "dash-auto-admin";
import ResourceTemplate from "dash-admin/src/templates/ResourceTemplate";
import React from "react";

import ListAlt from "@mui/icons-material/ListAlt";
import ProductTemplateShow from "../components/Product/ProductTemplateShow";
import { Show } from "react-admin";
import productTemplateImportSchema from "../schemas/productTemplateImport";
import { IAvailableColumn, ISelectedColumn } from "../components/Product/ProductImportExport/Interfaces";
import {DASHAppConstants} from "dash-constants";

const productImportInstanceResource: IDashAutoAdminResourceConfig =
{
    roles:[DASHAppConstants.system.SYSTEM_ROLE, DASHAppConstants.system.TENANT_ROLE],
  component: ResourceTemplate,
  showComponent: (resourceConfig) => (
    <Show>
      <ProductTemplateShow />
    </Show>
  ),
  trash: true,
  model: "ecommerce/product_template",
  group: "Import/Export",
  label: "Plantillas de importación",
  schema: productTemplateImportSchema,
  icon: <ListAlt />,
  menu: [
    {
      title: "Lista de plantillas de importación",
      redirect: "/ecommerce/product_template",
    },
    {
      title: "🗑",
      redirect: "/ecommerce/product_template/trash",
    },
  ],
  mainAction: {
    title: "Crear Plantilla",
    // type: "ghost",
    redirect: "/ecommerce/product_template/create",
  },
  isFormData: false,
  postFormatter: (data) => {
    const selectedColumns: ISelectedColumn[] = data.selectedColumns;
    const availableTemplateColumns: IAvailableColumn[] =
      data.availableTemplateColumns || [];


    const product_template_columns = selectedColumns.map(
      (selectedColumn) => {
        // find in available Columns

        //delete availableColumn.id;
        if (
          availableTemplateColumns.find(
            (ele) => ele.id === selectedColumn.attribute
          )
        ) {
          return {
            ...availableTemplateColumns.find(
              (ele) => ele.id === selectedColumn.attribute
            ),
            //...selectedColumn,
            data_index: selectedColumn.dataIndex,
            editable: selectedColumn.editable, // @TODO
          };
        }
      }
    );

    //const tenant_id = getCookie('tenant_id');
    
    return {
      //tenant_id: tenant_id,

      name: data.name,
      product_template_columns: product_template_columns,
      file:
        data?.fileField && data.fileField?.fileList
          ? data.fileField.fileList[0].name
          : "",
      skip_rows: data.skipHeaders,
      tenant_id: data.tenant_id,
      //tenant_id: tenant_id,
      preview_rows: data.previewRows,
      preview_cols: data.previewCols,
      type: "IMPORT",
    };
  },
  search: true,
  saveButtonAlwaysEnabled: true,
  processErrors: false,
}

export default productImportInstanceResource;