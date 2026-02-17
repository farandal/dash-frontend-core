import TenantIdsSelector from "../components/TenantIdsSelector";
import SearchableSelectChipsControlRecordContext from "../components/RASearchableSelectChipsRecordContext";
import { IDashAutoAdminAttribute } from "dash-auto-admin";
import React from "react";

const stocktypeSchema:IDashAutoAdminAttribute[] = [
    
    {
      label: 'Nombre',
      attribute: 'name',
      type: String
    },
   
   /* {
      label: 'Cliente',
      attribute: 'tenant_id',
      type: 'ecommerce/tenant.name',
      pagination: false,
      multiple: false,
      component: SelectInput,
      componentProps: { filter:{pagination:false}, multiple:false},
      inList: false
    },*/
    
    {
      label: 'Primario',
      attribute: 'is_primary',
      type: Boolean,
      inList: true
    },

    /*{
      tab: "Mapeo",
      label: "Mapeador de POS (BSALE)",
      attribute: 'output_pos_stock_type_mappings',
      type: String,
      custom: true,
      inList: false,
      inShow: false,
      //inCreate: false,
      component: ({ method, attribute,resourceConfig }) => 
      <SearchableSelectChipsControlRecordContext
        method={method}
        attribute={attribute}
        resourceConfig={resourceConfig}
        resource="ecommerce/point_of_sale_stock_type"
        selectLabel="Búscador"
        viewAttribute='name'
        queryFilter="q"
        optionKeyId="id"
        
        transformOption={(val: any,parsedOptions:any[],caller) => {
          return !val.pointOfSaleStockType ? { ...val, pointOfSaleStockType: { id: val.id, name: val.name } } : val;
        }}
        valueKeyId="point_of_sale_stock_type_id"
        isOptionEqualToValue={(option: any, value: any) => {


          //if(!option) return;
          //if(!value) return;

  
          //let _option = Array.isArray(option) ?  option[0] : option.id;
        //
          //if(Array.isArray(value) && value.length) {
          //          return option.id === value[0].point_of_sale_stock_type_id;
          //}

          return _option === value.id;

          if (!option) return false;
          if (!value) return false;
         
          return value.pointOfSaleStockType ? option.id === value.pointOfSaleStockType.id : option === value;
          

        }}
        //renderText={(option: any) => { console.log(option); return (option && option.name) || "" }}
        
        renderText={(option: any,caller:string) => {
          //console.log("RENDER TEXT OPTION",option,caller)
          return option.pointOfSaleStockType?.name
        }}
        
        filter={{ flat: true, pagination: { perPage: 50 }, leafs: true }}
        isMultiple={true} />
    },*/


      {   
         tab: "Tenants",
              attribute: 'tenant_ids',
              label: 'Tenants',
              type: Array,
              inList: false,
              custom: true,
              component: TenantIdsSelector
            
    },
  
];

export default stocktypeSchema;
