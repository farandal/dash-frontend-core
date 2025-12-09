import { IDashAutoAdminResourceConfig } from "dash-auto-admin";
import modifierGroupSchema from "../schemas/modifiers";
import LocalOffer from "@mui/icons-material/LocalOffer";
import ResourceTemplate from "dash-admin/src/templates/ResourceTemplate";
import {DASHAppConstants} from "dash-constants";
import React from "react";


const modifierGroupResource: IDashAutoAdminResourceConfig = {
 roles:[DASHAppConstants.system.SYSTEM_ROLE, DASHAppConstants.system.TENANT_ROLE],
  component: ResourceTemplate,
  trash: true,
  model: "ecommerce/modifier",
  group: "Productos",
  label: "Grupos de Modificadores",
  schema: modifierGroupSchema,
  icon: <LocalOffer />,
  menu: [
    {
      title: "Grupos de Modificadores",
      redirect: "/ecommerce/modifier",
    },
  
  ],
  mainAction: {
    title: "Crear grupo de modificadores",
    mode: "create",
    fn: "virtualhash",
    redirect: "inline/create",
  },
  drawer: true,
  drawerOptions: {
    
    edit: false,
 
  },

      referenceFilters: [
        {
            id: "Nombre",
            label: "Nombre", // filter label'
            source: "name", // id field
            reference: null,
            optionText: null,
            alwaysOn: true,
        },
        {
            id: "description",
            label: "Descripción", // filter label'
            source: "description", // id field
            reference: null,
            optionText: null,
            alwaysOn: true,
        },
       
      ],
  search: true,
  listViewButton: { enabled: false },
  formGroupMode: "tabs", // groups or tabs
  mutationMode: "pessimistic",
  saveButtonAlwaysEnabled: true,
  processErrors: false,
  redirectAfterUpdate: "edit",
  redirectAfterCreate: "edit",
  beforeSubmit: (values) => {
    if (!values.options || values.options.length === 0) {
      throw { error: "Debe agregar al menos una opción al grupo de modificadores" };
    }
    return values;
  },
  postFormatter: (params) => {
    // Format options if needed
    if (params.options) {
      params.options = params.options.map((option, index) => ({
        ...option,
        display_order: index
      }));
    }
    
    // Format product_ids if needed
    if (params.product_ids) {
      params.product_ids = Array.isArray(params.product_ids) 
        ? params.product_ids.map(id => typeof id === 'object' ? id.id : id)
        : [];
    }
    
  
    return params;
  },
  listProps: { storeKey: false },
  resetSelectedIdsOnLoad: true,
};

export default modifierGroupResource;