import { IDashAutoAdminResourceConfig } from "dash-auto-admin";
import productImportSchema from "../schemas/productImport";
import TrashTemplate from "dash-admin/src/resources/Trash/TrashTemplate";
import ResourceTemplate from "dash-admin/src/templates/ResourceTemplate";
import React from "react";

import ListAlt from "@mui/icons-material/ListAlt";
import {DASHAppConstants} from "dash-constants";
import ProductImportContext from "../components/ProductImport/ProductImportContext";

const Icon = ListAlt as unknown as React.FC;

const productImportInstanceResource: IDashAutoAdminResourceConfig =
{
 roles:[DASHAppConstants.system.SYSTEM_ROLE, DASHAppConstants.system.TENANT_ROLE],
  component: ResourceTemplate,
  contextComponent: ProductImportContext,
  model: "ecommerce/product_import_instances",
  group: "resource.groups.import_export",
  label: "resource.import.instances.label",
  schema: productImportSchema,
  icon: <Icon />,
  menu: [
    {
      title: "resource.import.instances.menu_list",
      redirect: "/ecommerce/product_import_instances",
    },
  ],
  
 
    mainAction: {
            title: "resource.import.instances.main_action",
            fn: "redirect",
            // type: "ghost",
            mode: "create",
            redirect: "create",
        },



  search: true,
  isFormData: true,
  edit: false,
  redirectAfterCreate: "edit", 
  redirectAfterUpdate:"edit",
  mutationMode: "pessimistic",
  dataGridProps: {
    rowClick: false,
  },
  postFormatter(params, method) {
    // Remove legacy fields - they should be in import_options now
    const legacyFields = ['create_new_categories', 'assign_default_brand', 'assign_default_category'];
    legacyFields.forEach(field => {
      if (params[field] !== undefined) {
        delete params[field];
      }
    });

    // Ensure import_type is set
    if (!params.import_type) {
      params.import_type = params.product_template_id ? 'template' : 'normalized';
    }

    // Ensure import_options is an object
    if (!params.import_options) {
      params.import_options = {};
    }

    return params;
  },
// In the formPostFormatter function, update to handle options instead of import_options:

formPostFormatter: (params, form) => {
  form.delete("product_template");
  
  if (params.products_file) {
    form.delete("products_file");
    if (params.products_file?.file) {
      form.append(
        "products_file",
        params.products_file.file as Blob
      );
    } else {
      form.append(
        "products_file",
        params.products_file.rawFile as Blob
      );
    }
  }

  // Handle options object - convert to individual form fields for multipart
  if (params.options && typeof params.options === 'object') {
    form.delete("options");
    Object.keys(params.options).forEach(key => {
      form.append(`options[${key}]`, params.options[key]);
    });
  }

  // Log form entries
  console.log('Form data entries:');
  for (const pair of (form as any).entries()) {
    console.log(pair[0], pair[1]);
  }

  return form;
},
  listEditButton: { enabled: false },
  saveButtonAlwaysEnabled: true,
  processErrors: false,
  listProps: { storeKey: false },
  resetSelectedIdsOnLoad: true,
}

export default productImportInstanceResource;
