import {IDashAutoAdminAttribute} from "dash-auto-admin";
import { SelectInput } from "react-admin";

const communesSchema:IDashAutoAdminAttribute[] = [
   /* {
      label: 'Id',
      attribute: 'id',
      type: Number
    },*/
    {
      label: 'Nombre',
      attribute: 'name',
      type: String
    },
    {
      label:"Región",
      attribute: 'region_id',
      type: 'ecommerce/region.name',
      pagination: false,
      multiple: false,
      component: SelectInput,
      inList: true
    },
    {
      label: 'Activa',
      attribute: 'active',
      type: Boolean
    }
];

export default communesSchema;