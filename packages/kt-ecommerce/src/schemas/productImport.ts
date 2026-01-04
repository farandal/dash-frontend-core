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
    tab: "resource.import.instances.tabs.datos",
    attribute: 'import_type',
    label: 'resource.import.instances.fields.import_type',
    type: String,
    custom: true,
    inList: false,
    component: ImportTypeSelector,
  },

  {
    tab: "resource.import.instances.tabs.datos",
    attribute: 'product_template_id',
    label: 'resource.import.instances.fields.template',
    type: String,
    custom: true,
    inList: false,
    component: TemplateSelectorRAA,
  },

  {
    tab: "resource.import.instances.tabs.datos",
    attribute: 'products_file',
    listAttribute: 'filepath',
    label: 'resource.import.instances.fields.file',
    type: String,
    custom: true,
    inList: false,
    inShow: false,
    component: ExcelUploadAndPreview,
  },

  {
    tab: "resource.import.instances.tabs.datos",
    attribute: 'import_options',
    label: 'resource.import.instances.fields.options',
    type: String,
    custom: true,
    inList: true,
    component: ImportOptionsSelector,
  },

  {
    tab: "resource.import.instances.tabs.datos",
    attribute: 'status',
    label: 'resource.import.instances.fields.status',
    type: String,
    custom: true,
    inList: true,
    component: ProductImportStatus,
  },

  {
    tab: "resource.import.instances.tabs.preview",
    attribute: 'preview_log_id',
    label: 'resource.import.instances.fields.preview',
    type: String,
    custom: true,
    inList: false,
    component: ProductImportComponent,
  },

  {
    tab: "resource.import.instances.tabs.import",
    attribute: 'import_log_id',
    label: 'resource.import.instances.fields.import_action',
    type: String,
    custom: true,
    inList: false,
    component: ProductImportComponent,
  },

  {
    tab: "resource.import.instances.tabs.logs",
    attribute: 'logs',
    label: 'resource.import.instances.fields.logs',
    type: "custom",
    component: ProductImportLog,
    inEdit: true,
    inShow: true,
    inCreate: false
  },


  {
    tab: "resource.import.instances.tabs.datos",
    attribute: 'created_at',
    label: 'resource.import.instances.fields.created_at',
    type: Date,
    inEdit: false,
    inCreate: false
  },

  {
    tab: "resource.import.instances.tabs.datos",
    attribute: 'updated_at',
    label: 'resource.import.instances.fields.updated_at',
    type: Date,
    inEdit: false,
    inCreate: false
  }

];

export default productImportSchema;