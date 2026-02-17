import TenantIdsSelector from "../components/TenantIdsSelector";
import ModifierOptionsComponent from "../components/Modifiers/ModifierOptionsComponent";
import ModifierProducts from "../components/Modifiers/ModifierProducts";
import ModifierType from "../components/Modifiers/ModifierType";
import { IDashAutoAdminAttribute, IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";
import { SelectArrayInput, SelectInput, useInput } from "react-admin";
//import ModifierOptionsComponent from "@app/components/ecommerce/ModifierGroup/ModifierOptionsComponent";

const modifierGroupSchema: IDashAutoAdminAttribute[] = [
  {
    tab: "Data",
    label: 'Nombre',
    attribute: 'name',
    type: String
  },
  {
    tab: "Data",
    label: 'Tipo',
    attribute: 'type',
    type: String,
    custom: true,
    component: ModifierType,
  },
  {
    tab: "Data",
    label: 'Descripción',
    attribute: 'description',
    type: String
  },
  {
    tab: "Data",
    label: 'Obligatorio',
    attribute: 'is_required',
    type: Boolean
  },
  {
    tab: "Data",
    label: 'Mínimo de selecciones',
    attribute: 'min_selections',
    type: Number,
    inList: false
  },
  {
    tab: "Data",
    label: 'Máximo de selecciones',
    attribute: 'max_selections',
    type: Number,
    inList: false
  },
   
  {
    tab: "Opciones",
    label: 'Opciones',
    attribute: 'options',
    type: String,
    custom: true,
    component: ModifierOptionsComponent,
    processor: "Null",
  },
  {
    tab: "Productos",
    label: "Productos",
    attribute: 'product_ids',
    type: String,
    custom: true,
    inList: false,
    showLabel: true,
    component: ModifierProducts
    /*component: ({ method, attribute,resourceConfig }) => <SearchableSelectChipsControlRecordContext
        method={method}
        attribute={attribute}
        resource="ecommerce/product"
        selectLabel="Búscador"
        viewAttribute='name'
        queryFilter="q"
        optionKeyId="id"
        valueKeyId="id"
        isOptionEqualToValue={(option, value) => {
            if (!option) return false;
            if (!value) return false;
            return option.id === value;
        } }
        renderText={(option) => option.name}
        filter={{ pagination: { perPage: 50 } }}
        isMultiple={true} resourceConfig={resourceConfig}    />
  }*/
  },

  {   
     tab: "Tenants",
          attribute: 'tenant_ids',
          label: 'Tenants',
          type: Array,
          inList: false,
          custom: true,
          component: TenantIdsSelector
        
      },
   
       
];

export default modifierGroupSchema;