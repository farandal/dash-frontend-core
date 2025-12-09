import ProductTemplateExportForm from "../components/Product/ProductImportExport/ProductTemplateExportForm";
import { IDashAutoAdminAttribute } from "dash-auto-admin";

const productTemplateSchema:IDashAutoAdminAttribute[] = [
   
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
      custom: true,
      type: typeof ProductTemplateExportForm,
      component: ProductTemplateExportForm,
      inList: false,
      inShow: false,
      inEdit: true,
      inCreate: true
      
    }
  
];

export default productTemplateSchema;