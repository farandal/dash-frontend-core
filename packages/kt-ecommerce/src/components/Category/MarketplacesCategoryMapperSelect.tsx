import { Table } from 'antd';
import { Category } from '../../interfaces/Category';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import React from 'react'
import { useRecordContext } from "react-admin";
import MapperAntD from '../MapperAntD';
import RASearchableSelect from '../RASearchableSelect';

const MarketplacesCategoryMapperSelectComponent: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute, ...props }) => {

  const record = useRecordContext();

  return <RASearchableSelect

    resource={"ecommerce/system_marketplace_category"}
    selectLabel={"Categoría"}
    viewAttribute={'name'}
    renderText={(option) => `${option}`}
    transformData={(value: any) => value.id}
    isOptionEqualToValue={(option: any, value) => {
      return option.id === value;
    }}
    filter={{ flat: true, pagination: false }}
    method={method}
    attribute={attribute}
    searchResults={50}
  //multiple={false}
  //inList={false}

  />
}

const MarketplacesCategoryMapperSelect = ({ method, attribute }: IDashAutoAdminCustomFieldComponent) => {
  switch (method) {
    case "edit":
    case "create":
      return <MarketplacesCategoryMapperSelectComponent attribute={attribute} method={method} />
    case "view":
      return <MarketplacesCategoryMapperSelectComponent attribute={attribute} method={method} />
  }
}

export default MarketplacesCategoryMapperSelect;
