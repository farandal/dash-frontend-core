//import ProductMetadata from "../components/Metadata/ProductMetadata";
import TenantIdsSelector from "../components/TenantIdsSelector";
import ProductMetadata from "../components/Metadata/ProductMetadata";
import GallerySelector from "../components/Product/GallerySelector";
import ProductImage from "../components/Product/ProductImage";
import ProductHistory from "../components/ProductHistory";
import ProductPrices from "../components/ProductPrices";
//import ProductProducts from "../components/ProductProducts";
import ProductStocks from "../components/ProductStocks";
import RASearchableSelectChips from "../components/RASearchableSelectChips";
import SearchableSelectChipsControlRecordContext from "../components/RASearchableSelectChipsRecordContext";
import { Category } from "../interfaces";

//import ProductURLs from "../components/ProductUrls";
//import { SearchableSelectChipsControlRecordContext } from "../components/RASearchableSelectChipsRecordContext";
//import { Category } from "../interfaces/Category";
import { IDashAutoAdminAttribute } from "dash-auto-admin";
import { ListActive } from "dash-components";

//import React from "react";
import { AutocompleteInput, SelectArrayInput, SelectInput } from "react-admin";

interface IValueForOutputCategoryMapping {
  id: number;
  tenant_id: string;
  category_id?: any;
  name: string;
  is_primary: boolean;
  breadcrumbed_name: string;
  category?: any;
  subcategories: any[];
  key: string;
}

interface IOptionForOutputCategoryMapping {
  id: number;
  tenant_id: string;
  category_id?: any;
  name: string;
  is_primary: boolean;
  breadcrumbed_name: string;
  category?: any;
  subcategories: any[];
  key: string;
}


const productSchema: IDashAutoAdminAttribute[] = [
  /*{
    // parent category
    attribute: 'category_id',
    type: Number
  },*/
 {
    tab: "resource.ecommerce.products.tabs.product",
    label: 'resource.ecommerce.products.fields.image',
    attribute: 'gallery',
    type: "custom",
    component: ProductImage,
    sortable: true,
    showLabel: true,
    inEdit: false,
    inCreate: false,
    inShow:false,
    inList: true
  },
  {
    tab: "resource.ecommerce.products.tabs.product",
    label: 'resource.ecommerce.products.fields.name',
    attribute: 'name',
    type: String,
    sortable: true,
    showLabel: true
  },
  
  {
    tab: "resource.ecommerce.products.tabs.product",
    label: 'resource.ecommerce.products.fields.description',
    attribute: 'description',
    type: String,
    //custom: true,
    //component: RichTextFieldWrapper,
    fieldProps: {
      multiline: true,
    },
    slotProps: {
      multiline: true,
      fullWidth: true
    },
    inList: false,
    showLabel: true
  },

   {
    tab: "resource.ecommerce.products.tabs.product",
    label: "resource.ecommerce.products.fields.is_enabled",
    attribute: 'is_enabled',
     type: "custom",
    component: ListActive
  },

     {
        tab: "resource.ecommerce.products.tabs.product",
        label: 'resource.ecommerce.products.fields.featured',
        attribute: 'featured',
        type: "custom",
        component: ListActive
    },

     {
        tab: "resource.ecommerce.products.tabs.product",
        label: 'resource.ecommerce.products.fields.mall_listed',
        attribute: 'mall_listed',
         type: "custom",
        component: ListActive
    },

    {
    tab: "resource.ecommerce.products.tabs.product",
    label: 'resource.ecommerce.products.fields.keywords',
    attribute: 'keywords',
    type: String,
    //custom: true,
    //component: RichTextFieldWrapper,
    fieldProps: {
      multiline: true,
    },
    slotProps: {
      multiline: true,
      fullWidth: true
    },
    inList: false,
    showLabel: true
  },
/*
    {
    tab: "resource.ecommerce.products.tabs.product",
    label: 'Mapeo de voz',
    attribute: 'metavoice',
    type: String,
    //custom: true,
    //component: RichTextFieldWrapper,
    fieldProps: {
      multiline: true,
    },
    slotProps: {
      multiline: true,
      fullWidth: true
    },
    inList: false,
    showLabel: true
  },
*/
  {
    tab: "resource.ecommerce.products.tabs.product",
    label: 'resource.ecommerce.products.fields.sku',
    attribute: 'sku',
    type: String,
    sortable: true,

  },
  {
    tab: "resource.ecommerce.products.tabs.product",
    label: 'resource.ecommerce.products.fields.display_order',
    attribute: 'display_order',
    type: Number,
    sortable: true,
    inList: false,
    inShow: true,
    inEdit: true,
    inCreate: true,
    fieldProps: {
      min: 0,
      helperText: 'resource.ecommerce.products.fields.display_order_helper',
    },
  },
  {
  tab: "resource.ecommerce.products.tabs.category_modifiers",
  label: 'resource.ecommerce.products.fields.categories',
  attribute: 'category_ids',
  listAttribute: 'categories',
  type: 'ecommerce/category.breadcrumbed_name',
  custom: true,
  pagination: false,
  multiple: true, // Make sure this is set to true
  component: ({ method, attribute, resourceConfig }) => <SearchableSelectChipsControlRecordContext
    method={method}
    attribute={attribute}
    resourceConfig={resourceConfig}
    defaultValues={null} // This will now properly infer from record
    resource={"ecommerce/category"}
    selectLabel={"Categoría"}
    viewAttribute={'breadcrumbed_name'}
    valueKeyId={'id'}
    renderText={(option: Category) => option && option.breadcrumbed_name ? `${option.breadcrumbed_name}` : ''}
    transformData={(value: Category) => value}
    isOptionEqualToValue={(option: Category, value: Category) => {
      if (!option || !value) return false;
      return option.id === value.id;
    }}
    queryFilter={"q"}
    filter={{ flat: true, pagination: false }}
    isMultiple={true} // Set this to true for multiple selection
  />,
  inList: false,
  inEdit: true,
  inCreate: true,
  inShow: false
},

  {
    tab: "resource.ecommerce.products.tabs.category_modifiers",
    label: "resource.ecommerce.products.fields.modifier_groups",
    attribute: 'modifier_groups_ids',
    listAttribute: 'modifier_groups',
    type: "ecommerce/modifier.name",
    custom: true,
    pagination: false,
    multiple: true,
    component: ({ method, attribute, resourceConfig }) => <SearchableSelectChipsControlRecordContext
      method={method}
      attribute={attribute}
      resourceConfig={resourceConfig}
      defaultValues={null}
      resource={"ecommerce/modifier"}
      selectLabel={"Grupos de Modificadores"}
      viewAttribute={'name'}
      valueKeyId={'id'}
      renderText={(option: any) => option && option.name ? `${option.name}` : ''}
      transformData={(value: any) => value}
      isOptionEqualToValue={(option: any, value: any) => {
        if (!option || !value) return false;
        return option.id === value.id;
      }}
      queryFilter={"q"}
      filter={{ pagination: false }}
      isMultiple={true}
    />,
    inList: false,
    inEdit: true,
    inCreate: true,
    inShow: false
  },
  {
    tab: "resource.ecommerce.products.tabs.prices",
    label: "resource.ecommerce.products.fields.prices",
    attribute: 'prices', // para un custom component, atributo no es necesario, pero es requerido por la interfaz
    type: String,
    custom: true,
    inList: true, // TODO: show price in list
    component: ProductPrices,
  },

  {
    tab: "resource.ecommerce.products.tabs.stocks",
    label: "resource.ecommerce.products.fields.stocks",
    attribute: 'stocks', // para un custom component, atributo no es necesario, pero es requerido por la interfaz
    type: String,
    custom: true,
    inList: false,
    component: ProductStocks,
  },

  {
    tab: "resource.ecommerce.products.tabs.stocks",
    label: "resource.ecommerce.products.fields.infinite_stock",
    attribute: 'infinite_stock',
    type: Boolean,
    inList: false
  },


 

  {

    label: 'resource.ecommerce.products.fields.brand',
    tab: "resource.ecommerce.products.tabs.brand",
    attribute: 'brand_id',
    type: 'ecommerce/brand.name',
    pagination: false,
    multiple: false,
    //component: SelectInput,
    component: (props) => <SelectInput
      {...props}
      /* @ts-ignore */
      options={{ refetchOnWindowFocus: false }}
    />,
    sortable: true

  },

  /* TODO: METADATA */
  
  {
    tab: "resource.ecommerce.products.tabs.metadata",
    label: "resource.ecommerce.products.fields.metadata",
    attribute: 'metadata',
    type: String,
    custom: true,
    inList: false,
    inDrawer: false,
    //inCreate: false,
    component: ProductMetadata,
  },

  /*

  {
    tab: "Código Marketplace",
    label: "Código Marketplace",
    attribute: 'urls', // para un custom component, atributo no es necesario, pero es requerido por la interfaz
    type: String,
    custom: true,
    inList: false,
    inDrawer: false,
    component: ProductURLs,
  },
  */
  {
    tab: "resource.ecommerce.products.tabs.gallery",
    label: 'resource.ecommerce.products.fields.gallery',
    attribute: 'gallery_id',
    type: 'ecommerce/gallery.title',
    pagination: false,
    multiple: false,
    /*component: (props) => <><AutocompleteInput 
      {...props}
      optionText="title"
      optionValue="id"
      debounce={300}
      filterToQuery={(searchText) => ({ q: searchText })}
      shouldRenderSuggestions={(val) => val.trim().length > 1}
      suggestionLimit={20}
      emptyText="Sin galería"
      emptyValue=""
      TextFieldProps={{
        placeholder: 'Buscar galería...',
      }}
      options={{ refetchOnWindowFocus: false }}
    />
    IMAGE PREVIEW
    
    </>,*/
    component: GallerySelector,


    componentProps: { 
      filter: { flat: true, pagination: false }, 
      multiple: false 
    },
    inList: false,
    inDrawer: false,
  },

 /* {
    tab: "Packs",
    label: "Paquete",
    attribute: 'products', // para un custom component, atributo no es necesario, pero es requerido por la interfaz
    type: String,
    custom: true,
    inList: false, // No se puede mostrar en el listado, porque el backend no trae el listado de imagnes en la lista
    component: ProductProducts,
    inDrawer: false,
  },
*/

  {
    tab: "resource.ecommerce.products.tabs.history",
    label: "resource.ecommerce.products.fields.history",
    attribute: 'product.id', // para un custom component, atributo no es necesario, pero es requerido por la interfaz
    type: String,
    custom: true,
    inList: false, // No se puede mostrar en el listado, porque el backend no trae el listado de imagnes en la lista
    inEdit: true,
    inCreate: false,
    inShow: true,
    //inDrawer: false,
    component: ProductHistory,
  },

    {   // TODO: if is_internal, do not allow this input
        tab: "resource.ecommerce.products.tabs.tenants",
          attribute: 'tenant_ids',
          label: 'resource.ecommerce.products.fields.tenants',
          type: Array,
          inList: false,
          custom: true,
          component: TenantIdsSelector
        
      },

];

export default productSchema;
