/*import { Table } from "antd";
import { Category } from "../../interfaces/Category";
import { IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";
import React, { Fragment, useEffect, useState } from "react";
import { useRecordContext } from "react-admin";
import { useGetOne } from "react-admin";
import { ISystemMarketplace, Tenant } from "@panel/interfaces/Tenant";

import { getCookie } from "@panel/utils/cookies";
import { Loading } from "react-admin";
import { ISystemMarketplaceCategory } from "../Metadata/MarketplacesMetadataMapper";
import { SearchableSelectChipsControlRecordContext } from "../RASearchableSelectChipsRecordContext";*/


import { getCookie } from "dash-admin/src/utils/cookies";
import { Table } from "antd";
import React, { useState, useEffect, Fragment } from "react";
import { useRecordContext, useGetOne, Loading } from "react-admin";
import  SearchableSelectChipsControlRecordContext from "../RASearchableSelectChipsRecordContext";
import { ISystemMarketplaceCategory, ISystemMarketplace } from "./MarketplacesCategoryMapper";
import { IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";

import { dashStorage } from "dash-utils";
import { Category, Tenant } from "../../interfaces";


export interface IValueForOutputCategoryMapping {
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

export interface IOptionForOutputCategoryMapping {
  id: number;
  tenant_id: number;
  category_id?: any;
  name: string;
  is_primary: boolean;
  breadcrumbed_name: string;
  category?: any;
  subcategories: any[];
  key: string;
  system_marketplace_category_id: number;
  systemMarketplaceCategory: ISystemMarketplaceCategory;
}

const CategoryOutputEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({
  method,
  attribute,
}) => {
  const category: Category = useRecordContext();
  const tenant_id = dashStorage.getItem('tenant_id');

  const {
    data: tenant,
    isLoading: tenantLoading,
    error: tenantError,
  } = useGetOne("system/tenant", { id: tenant_id }, { refetchOnWindowFocus: false });
  // For each system_marketplace render InputMetadataMarketplaceMappe
  const [tenantSystemMarketplaces, setTenantSystemMarketplaces] =
    useState<ISystemMarketplace[]>(null);

  useEffect(() => {
    if (tenant && !tenantLoading && !tenantError) {
      setTenantSystemMarketplaces((tenant as Tenant).systemMarketplaces);
    }
  }, [tenant, tenantLoading, tenantError]);

  //console.log('tenantSystemMarketplaces', tenantSystemMarketplaces);

  if (!tenantSystemMarketplaces) return <>No disponible sin marketplaces asociados</>;
  return (
    <>
      {tenantSystemMarketplaces.map((mp, key) => {
        const indexedAttributeName = {
          ...attribute,
          ...{
            listAttribute: "tmp_" + attribute.attribute + "." + key,
          },
        };
        const systemMarketplaceId = mp.id;
        const recordValue = category ? category[
          indexedAttributeName.attribute
        ] : null;
        const foundValue = recordValue && recordValue.length && recordValue.filter(
          (ouput_cattegory_mapping) =>
            ouput_cattegory_mapping.systemMarketplaceCategory
              ?.system_marketplace_id === systemMarketplaceId
        );

        const defaultValue =
          category?.output_category_mappings &&
            method === "edit" &&
            (foundValue && foundValue.length)
            ? foundValue[0]
            : null;

        return (
          <Fragment key={key}>
            <div>
              Mapeador categorias de marketplace {mp.name}
              <SearchableSelectChipsControlRecordContext
                {...(defaultValue && {
                  defaultValues: defaultValue,
                })}
                resourceConfig={null}
                method={method}
                attribute={indexedAttributeName}
                useListAttributeForController={true}
                resource={"ecommerce/system_marketplace_categories"}
                selectLabel={"Búscador de categorías"}
                viewAttribute={"breadcrumbed_name"}
                valueKeyId={"system_marketplace_category_id"} // para el includes
                renderText={(option: Category) =>
                  option && option.breadcrumbed_name
                    ? `${option.breadcrumbed_name}`
                    : null
                }
                transformData={(value: Category) => value}
                isOptionEqualToValue={(
                  option: IOptionForOutputCategoryMapping,
                  value: IValueForOutputCategoryMapping
                ) => {
                  if (!option) return;
                  if (!value) return;

                  let _option = Array.isArray(option)
                    ? option[0]
                    : option.id;
                  //let _value = Array.isArray(value) ?  value[0] : value.id;

                  if (Array.isArray(value) && value.length) {
                    return (
                      option.id ===
                      value[0]
                        .system_marketplace_category_id
                    );
                  }

                  return _option === value.id;
                  //return option.id === value.id;
                }}

                queryFilter={"q"}
                filter={{
                  flat: true,
                  pagination: { perPage: 50 },
                  leafs: true,
                  system_marketplace_id: mp.id,
                }}
                isMultiple={false}
              />
            </div>
          </Fragment>
        );
      })}
    </>
  );
};

const CategoryOutputView: React.FC<IDashAutoAdminCustomFieldComponent> = ({
  method,
  attribute,
}) => {
  const category: Category = useRecordContext();

  const columns = [
    {
      title: "Valor",
      dataIndex: "text",
      key: "name",
    },
  ];
  return (
    <Table
      columns={columns}
      dataSource={category?.input_category_mappings}
      bordered
      rowClassName="editable-row"
      pagination={false}
    />
  );
};

const CategoryOutput = ({
  method,
  attribute,
  resourceConfig
}: IDashAutoAdminCustomFieldComponent) => {
  switch (method) {
    case "edit":
    case "create":
      return <CategoryOutputEdit attribute={attribute} method={method} resourceConfig={resourceConfig} />;
    case "view":
      return <CategoryOutputView attribute={attribute} method={method}  resourceConfig={resourceConfig} />;
  }
};

export default CategoryOutput;
