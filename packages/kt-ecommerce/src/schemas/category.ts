/*import {IDashAutoAdminAttribute} from "dash-auto-admin";
//import CategoryMapper from "../components/Category/CategoryMapper";

//import { SearchableSelectChipsControl } from "../components/RASearchableSelectChips";
import MarketplacesCategoryMapper from "@panel/components/Category/MarketplacesCategoryMapper";
import CategoryMapper from "@panel/components/Category/CategoryMapper";
import CategoryOutputMapper from "@panel/components/Category/CategoryOutputMapper";
*/
/*
interface IValueForOutputCategoryMapping {
  id: number;
  tenant_id: number;
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
  tenant_id: number;
  category_id?: any;
  name: string;
  is_primary: boolean;
  breadcrumbed_name: string;
  category?: any;
  subcategories: any[];
  key: string;
}
*/

import CategoryMapper from "../components/Category/CategoryMapper";
import CategoryOutputMapper from "../components/Category/CategoryOutputMapper";
import { IDashAutoAdminAttribute } from "dash-auto-admin";

const categorySchema: IDashAutoAdminAttribute[] = [

  {
    attribute: 'name',
    label: 'Nombre',
    type: String
  },

  {
    attribute: 'is_primary',
    label: 'Principal',
    type: Boolean
  },

  /* {
       tab: "Mapeo de categorías de marketplace",
       label: "Mapeador categorias de marketplace",
       attribute: '',
       type: String,
       custom: true,
       inList: false,
       component: MarketplacesCategoryMapper,
   },*/

  //   {
  //     tab: "Mapeo de categorías de marketplace",
  //     label: "Mapeador categorias de marketplace",
  //     attribute: 'output_category_mappings',
  //     type: String,
  //     custom: true,
  //     inList: false,
  //     //inCreate: false,
  //     component: ({ method, attribute }) =>
  //   },

  /*
  {
    tab: "Mapeo de entrada",
    label: "Mapeador categorias de entrada (importación masiva)",
    attribute: 'input_category_mappings',
    type: String,
    custom: true,
    inList: false,
    component: CategoryMapper,
  },

  {
    tab: "Mapeo de salida",
    label: "Mapeador categorias de salida",
    attribute: 'output_category_mappings',
    type: String,
    custom: true,
    inList: false,
    component: CategoryOutputMapper,
  },
  */

];

export default categorySchema;
