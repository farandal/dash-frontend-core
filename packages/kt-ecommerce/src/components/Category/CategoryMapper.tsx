import { Table } from 'antd';

import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import React from 'react'
import { useRecordContext } from "react-admin";
import MapperAntD from '../MapperAntD';
import { Alert } from '@mui/material';
import { Category } from '../../interfaces';

const CategoryMapperEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {
  const category: Category = useRecordContext();

  return (<>

    <MapperAntD name='input_category_mappings' data={category} />
    <Alert severity="info">* entradas de texto en la columna de categorías del archivo de carga masiva.</Alert>
  </>)
}

const CategoryMapperView: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {
  const category: Category = useRecordContext();

  const columns = [
    {
      title: 'Valor',
      dataIndex: 'text',
      key: 'name',
    }
  ]
  return (<>

    <Table columns={columns} dataSource={category?.input_category_mappings} bordered rowClassName="editable-row" pagination={false} />

  </>)
}

const CategoryMapper = ({ method, attribute,resourceConfig}: IDashAutoAdminCustomFieldComponent) => {
  switch (method) {
    case "edit":
    case "create":
      return <CategoryMapperEdit attribute={attribute} method={method} resourceConfig={resourceConfig} />
    case "view":
      return <CategoryMapperView attribute={attribute} method={method} resourceConfig={resourceConfig} />
  }
}

export default CategoryMapper;


/*import { Table } from 'antd';
import { Category } from '../../interfaces/Category';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import React, { Fragment, useEffect, useState } from 'react'
import { useRecordContext } from "react-admin";
import MapperAntD from '../MapperAntD';
import { useGetOne } from 'react-admin';
import { Tenant } from '@panel/interfaces/Tenant';
import { ISystemMarketplace } from './MarketplacesCategoryMapper';
import { getCookie } from '@panel/utils/cookies';
import { SearchableSelectChipsControl } from '../RASearchableSelectChips';
import { Loading } from 'react-admin';

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

const CategoryMapperEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {
    const category: Category = useRecordContext();
    const tenant_id = getCookie("tenant_id");

    const { data: tenant, isLoading: tenantLoading, error: tenantError } = useGetOne('tenant/tenant', { id: tenant_id}, { refetchOnWindowFocus: false});
    // For each system_marketplace render InputMetadataMarketplaceMappe
    const [tenantSystemMarketplaces, setTenantSystemMarketplaces] = useState<ISystemMarketplace[]>(null);
    useEffect(() => {
        if(tenant && !tenantLoading && !tenantError) {
            setTenantSystemMarketplaces((tenant as Tenant).systemMarketplaces);
        }
    },[tenant,tenantLoading,tenantError]);
    console.log('tenantSystemMarketplaces', tenantSystemMarketplaces);

    if(!tenantSystemMarketplaces) return <Loading/>
    return(
        <>
            {tenantSystemMarketplaces.map((mp, key) => {
                return(
                    <Fragment key={key}>
                        Mapeador categorias de marketplace {mp.name}
                        <SearchableSelectChipsControl
                            method={method}
                            attribute={attribute}
                            resource="ecommerce/system_marketplace_category"
                            selectLabel="Búscador de categorías"
                            viewAttribute='breadcrumbed_name'
                            queryFilter="q"
                            optionKeyId="id"
                            valueKeyId="system_marketplace_category_id"
                            isOptionEqualToValue={(option: IOptionForOutputCategoryMapping, value: IValueForOutputCategoryMapping) => {
                                if(!option) return;
                                if(!value) return;
                                let _option = Array.isArray(option) ?  option[0] : option.id;
                            //let _value = Array.isArray(value) ?  value[0] : value.id;

                                if(Array.isArray(value) && value.length) {
                                        return option.id === value[0].system_marketplace_category_id;
                                }
                                return _option === value.id;

                                //return option.id === value.id;
                            }}
                            renderText={(option: IOptionForOutputCategoryMapping) => { console.log(option); return (option && option.breadcrumbed_name) || "" }}
                            filter={{ flat: true, pagination: { perPage: 50 }, leafs: true }}
                            isMultiple={false}
                        />
                        <MapperAntD name='input_category_mappings' data={category} />
                    </Fragment>
                )
            })}
        </>)
}

const CategoryMapperView: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {
    const category: Category = useRecordContext();

    const columns = [
        {
            title: 'Valor',
            dataIndex: 'text',
            key: 'name',
        }
    ]
    return (
        <Table columns={columns} dataSource={category?.input_category_mappings} bordered rowClassName="editable-row" pagination={false}/>
    )
}

const CategoryMapper = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
    switch (method) {
        case "edit":
        case "create":
            return <CategoryMapperEdit attribute={attribute} method={method} resourceConfig={resourceConfig} />
        case "view":
            return <CategoryMapperView attribute={attribute} method={method} resourceConfig={resourceConfig} />
    }
  }

export default CategoryMapper;
*/