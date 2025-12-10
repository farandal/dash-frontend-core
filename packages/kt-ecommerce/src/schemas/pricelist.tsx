import { IDashAutoAdminAttribute } from "dash-auto-admin";
import React from "react";
import { SelectInput } from "react-admin";


const pricelistSchema: IDashAutoAdminAttribute[] = [

  {
    label: 'Nombre',
    attribute: 'name',
    type: String
  },

  /* {
     label: 'Cliente',
     attribute: 'tenant_id',
     type: 'tenant/tenant.name',
     pagination: false,
     multiple: false,
     component: SelectInput,
     fieldOptions: { fullWidth:true },
     componentProps: { fullWidth:true, filter:{pagination:false}, multiple:false},
     inList: false
   },*/
  {
    label: 'Moneda',
    attribute: 'currency_id',
    type: 'ecommerce/currency.code',
    pagination: false,
    multiple: false,
    component: SelectInput,
    componentProps: { fullWidth: true, filter: { }, multiple: false },
    inList: false
  },

  {
    label: 'Primario',
    attribute: 'is_primary',
    type: Boolean,
    inList: true
  },

  /*
  {
    tab: "Mapeo de lista de precio a punto de venta",
    label: "Mapeador de POS (BSALE)",
    attribute: 'output_pos_pricelist_mappings',
    type: String,
    custom: true,
    inList: false,
    showLabel: true,
    //inCreate: false,
    component: ({ method, attribute }) => <SearchableSelectChipsControlRecordContext
      method={method}
      attribute={attribute}
      resource="ecommerce/point_of_sale_pricelists"
      selectLabel="Búscador"
      viewAttribute='name'
      queryFilter="q"
      optionKeyId="id"
      transformOption={(val: any,parsedOptions:any[],caller) => {
         return !val.pointOfSalePricelist ? { ...val, pointOfSalePricelist: { id: val.id, name: val.name } } : val;
      }}
      valueKeyId="point_of_sale_pricelist_id"
      isOptionEqualToValue={(option: any, value: any) => {

        if (!option) return false;
        if (!value) return false;
        console.log({
          task: "isOptionEqualToValue",
          option,
          value,
          //result:  option.id === value.pointOfSalePricelist?.id
        });

        return value.pointOfSalePricelist ? option.id === value.pointOfSalePricelist.id : option === value;



      }}
      renderText={(option: any,caller:string) => {
        console.log("RENDER TEXT OPTION",option,caller)

        return option.pointOfSalePricelist?.name
      }}
      filter={{ flat: true, pagination: { perPage: 50 }, leafs: true }}
      isMultiple={true} />
  },*/



];

export default pricelistSchema;
