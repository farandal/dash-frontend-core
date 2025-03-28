import {
  IDashAutoAdminAttribute,
} from 'dash-auto-admin';

import { SelectInput } from 'react-admin';
import { ListActive } from "dash-components";

const communeSchema: IDashAutoAdminAttribute[] = [

  {
    tab: 'datos',
    attribute: 'name',
    label: 'Nombre',
    type: String,
    sortable: true,
  },

  {
    tab: 'datos',
    label: "Región",
    attribute: 'region_id',
    type: 'commune/region.name',
    pagination: false,
    multiple: false,
    component: SelectInput,
    inList: true
  },
  {
    tab: 'datos',
    attribute: 'is_active',
    label: 'Activa',
    type: String,
    sortable: true,
    custom: true,
    component: ListActive,
    showLabel: true,
    /*inEdit: true,
    inList: true,
    inShow: true,
    inCreate: true,*/
    //processor: 'Boolean'
  },
];

export default communeSchema;
