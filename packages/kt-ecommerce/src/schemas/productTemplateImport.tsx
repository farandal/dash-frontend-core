//import ProductPrices from "../components/ProductPrices";

import ProductTemplateImportForm from "../components/Product/ProductImportExport/ProductTemplateImportForm";
import { IDashAutoAdminAttribute } from "dash-auto-admin";


const productTemplateImportSchema: IDashAutoAdminAttribute[] = [

  {
    label: 'Nombre',
    attribute: 'name',
    type: String,
    validate: (value: string) => {
      if (!(value && value.length >= 3)) {
        throw new Error('Campo requerido. Debe ser mayor a 3 caracteres');
      }
    }
  },

  /*{
    label: 'file',
    attribute: 'file',
    type: String,
    inCreate: false,
    inList: false,
    inShow: false,
    inEdit: false
  },*/

  {
    label: 'Columnas',
    attribute: 'product_template_columns', // not being used.
    //custom: true,
    type: "custom",
    component: ProductTemplateImportForm,
    inList: false,
    inShow: false,
    inEdit: true,
    inCreate: true

  }

];

export default productTemplateImportSchema;