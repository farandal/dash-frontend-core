import {IDashAutoAdminAttribute} from "dash-auto-admin";
const regionSchema:IDashAutoAdminAttribute[] = [
{
  label: 'Nombre',
  attribute: 'name',
  type: String
},
{
  label: 'Activa',
  attribute: 'active',
  type: Boolean
}
];

export default regionSchema;