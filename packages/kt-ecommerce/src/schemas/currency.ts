import FormatCurrency from "../components/Currency/Format";
import { IDashAutoAdminAttribute } from "dash-auto-admin";


const currencySchema:IDashAutoAdminAttribute[] = [
{
  label: 'Código',
  attribute: 'code',
  type: String,
  fieldOptions: {
    helperText: 'E.g: CLP | USD ...'
  }
 
},
{
  label: 'Formato',
  attribute: 'format',
  type: String,
  fieldOptions: {
    helperText: 'E.g: 0.00 | 0,0.00 | 0'
  }
},
{
  label: 'Símbolo',
  attribute: 'symbol',
  type: String
},
{
    label: 'Número formateado',
    attribute: 'formateado',
    type: Number,
    custom: true,
    inList: false,
    component: FormatCurrency
},
];

export default currencySchema;
