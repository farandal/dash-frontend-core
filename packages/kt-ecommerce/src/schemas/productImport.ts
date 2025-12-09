import ExcelUploadAndPreview from "../components/ProductImport/ExcelUploadAndPreview";
import ProductImportComponent from "../components/ProductImport/ProductImportComponent";
import ProductImportStatus from "../components/ProductImport/ProductImportStatus";
import TemplateSelectorRAA from "../components/ProductImport/TemplateSelectorRAA";
import ImportTypeSelector from "../components/ProductImport/ImportTypeSelector";


import { IDashAutoAdminAttribute } from "dash-auto-admin";
import ImportOptionsSelector from "../components/ProductImport/importOptionsSelector";
import ProductImportLog from "../components/ProductImportLog";

const productImportSchema: IDashAutoAdminAttribute[] = [

  {
    tab: "Datos",
    attribute: 'import_type',
    label: 'Tipo de Importación',
    type: String,
    custom: true,
    inList: false,
    component: ImportTypeSelector,
  },

  {
    tab: "Datos",
    attribute: 'product_template_id',
    label: 'Template',
    type: String,
    custom: true,
    inList: false,
    component: TemplateSelectorRAA,
  },

  {
    tab: "Datos",
    attribute: 'products_file',
    listAttribute: 'filepath',
    label: 'Archivo',
    type: String,
    custom: true,
    inList: false,
    inShow: false,
    component: ExcelUploadAndPreview,
  },

  {
    tab: "Datos",
    attribute: 'import_options',
    label: 'Opciones de Importación',
    type: String,
    custom: true,
    inList: true,
    component: ImportOptionsSelector,
  },

  {
    tab: "Datos",
    attribute: 'status',
    label: 'Status',
    type: String,
    custom: true,
    inList: true,
    component: ProductImportStatus,
  },

  {
    tab: "Previsualizar",
    attribute: 'preview_log_id',
    label: 'Previsualizar',
    type: String,
    custom: true,
    inList: false,
    component: ProductImportComponent,
  },

  {
    tab: "Importar",
    attribute: 'import_log_id',
    label: 'Importar',
    type: String,
    custom: true,
    inList: false,
    component: ProductImportComponent,
  },

  {
    tab: "Logs",
    attribute: 'logs',
    label: 'Logs',
    type: "custom",
    component: ProductImportLog,
    inEdit: true,
    inShow: true,
    inCreate: false
  },


  {
    tab: "Datos",
    attribute: 'created_at',
    label: 'Creado',
    type: Date,
    inEdit: false,
    inCreate: false
  },

  {
    tab: "Datos",
    attribute: 'updated_at',
    label: 'Actualizado',
    type: Date,
    inEdit: false,
    inCreate: false
  }

];

export default productImportSchema;