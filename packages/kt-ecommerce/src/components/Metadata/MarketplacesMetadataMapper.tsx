/*import { Table } from 'antd';
import { Category } from '../../interfaces/Category';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin'
import React, { useEffect, useMemo, useState } from 'react'
import { useRecordContext } from "react-admin";
import MapperAntD from '../MapperAntD';
import useAxios from '../../hooks/axios';
import { Loading } from 'react-admin';

import { Tree } from 'antd';
import type { DataNode } from 'antd/es/tree';
import Search from 'antd/lib/input/Search';
import { useController, useWatch } from 'react-hook-form';
//import RASearchableSelect from '../RASearchableSelect';
import MarketplaceTag from '../Misc/MarketplaceTag';
import RASearchableSelectChips, { SearchableSelectChipsControl } from '../RASearchableSelectChips';
import { Metadata } from 'panel/interfaces/Metadata';
import { SUDOSelectDropdown } from 'dash-uikit';
import { element } from 'prop-types';
import SearchableSelect from '../SearchableSelect';
import { useLogger } from '../../hooks/useLogger';
import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import DictionaryContext from '@panel/providers/DictionaryContext';*/


import { Metadata,Category } from "../../interfaces";
import { FormControl, SelectChangeEvent, InputLabel, Select, MenuItem } from "@mui/material";
import DictionaryContext from "dash-admin/src/contexts/dictionary/DictionaryContext";
import { IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";
import { useAxios } from 'dash-axios-hook';

import React, { useState, useEffect } from "react";
import { useRecordContext, Loading } from "react-admin";
import { Table } from 'antd';
import { useController, useWatch } from "react-hook-form";
import MarketplaceTag from "../Misc/MarketplaceTag";
import SearchableSelect from "../SearchableSelect";
import { SearchableSelectChipsControl } from "../SearchableSelectChips";

const convertArrayToObject = (array, key) => {
  const initialValue = {};
  return array.reduce((obj, item) => {
    return {
      ...obj,
      [item[key]]: item,
    };
  }, initialValue);
};

export interface ISystemMarketplace {
  class: string
  icon_path: string
  icon_url: string
  id: number
  name: string
}

export interface ISystemMarketplaceCategory {
  hash_update: string
  id: number
  metadata: any
  name: string
  source_id: string
  systemMarketplaceCategory: any // ? viene null
  systemMarketplaceSubMetadataFormats: ISystemMarketplaceCategory[]
  system_marketplace_category_id: number // ? viene null
  system_marketplace_id: number
}

export interface ICategoryTree {
  title: string
  metadataFormats: ISystemMarketplaceCategory[]
  marketplaceId: string | number
  updateSelectedMetadataFormats: (newValues: any, marketplace) => any
  defaultSelectedKeys: any[]
}


export interface IMarketplaceMetadata {
  id: number
  tenant_id: string
  metadata_format_id: number
  system_marketplace_metadata_format_id: number
  systemMarketplaceMetadataFormat: ISystemMarketplaceMetadataFormat
}

export interface ISystemMarketplaceMetadataFormat {
  id: number
  system_marketplace_id: number
  ownerable_type: string
  ownerable_id: number
  group: string
  source_id: string
  name: string
  attribute: string
  value_type: string
  required: boolean
  metadata: Metadata
  hash_update: string
}

export interface IMetadata {
  id: string
  name: string
  tags: ITags
  hierarchy: string
  relevance: number
  value_type: string
  value_max_length: number
  attribute_group_id: string
  attribute_group_name: string
  hint: string
}

export interface ITags {
  catalog_required: boolean
}



const parsetreeCategory = (category: ISystemMarketplaceCategory) => {
  return {

    title: category.name,
    key: category.id,
    //children: category.systemMarketplaceSubMetadataFormats.map((cat) => parsetreeCategory(cat))

  }
}

const getParentKey = (key: React.Key, tree: any[]): React.Key => {
  let parentKey: React.Key;
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.children) {
      if (node.children.some(item => item.key === key)) {
        parentKey = node.key;
      } else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children);
      }
    }
  }
  return parentKey!;
};

const MarketplacesMetadataMapperEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {

  const metadata: Metadata = useRecordContext();
  const isInternal = metadata?.is_internal === true ? true : false;
  //const logger = useLogger("MarketplacesMetadataMapperEdit");

  const [parsedMetadataFormatsByMarketplaceValues, setParsedMetadataFormatsByMarketplaceValues] = useState(null);

  const [systemMarketplaces, setSystemMarketplaces] = useState<ISystemMarketplace[]>(null);

  //const [systemMarketplacesMetadata, setsystemMarketplacesMetadata] = useState<ISystemMarketplaceCategory[]>(null);
  const axios = useAxios();
  //const [loadingMetadataFormats, setLoadingMetadataFormats] = useState<boolean>(false);
  const defaultSelectedKeys = metadata?.output_metadata_format_mappings ? metadata.output_metadata_format_mappings.map(ele => ele.system_marketplace_metadata_format_id) : []
  const output_metadata_format_mappings = useController({ name: "output_metadata_format_mappings", defaultValue: defaultSelectedKeys })
  const [allSelectedValues, setAllSelectedValues] = useState<number[]>(defaultSelectedKeys);

  const getMetadata = async () => {
    //let parsedMetadataFormats = {};
    const { data: _systemMarketplaces } = await axios.get(`ecommerce/system_marketplace`);
    //const { data: _systemMarketplacesMetadata } = await axios.get(`ecommerce/system_marketplace_metadata_format`);

    setSystemMarketplaces(_systemMarketplaces.data);
    //setsystemMarketplacesMetadata(_systemMarketplacesMetadata.data);
    /*_systemMarketplaces.data.map((systemMarketplace: ISystemMarketplace) => {
        parsedMetadataFormats = { ...parsedMetadataFormats, ...{ [systemMarketplace.id]: _systemMarketplacesMetadata.data.filter((category) => category.system_marketplace_id === systemMarketplace.id) } };
    });*/
    //setParsedMetadataFormatsByMarketplaceValues(parsedMetadataFormats);

  }

  const [loadingMetadataFormatFilters, setLoadingMetadataFormatFilters] = useState<boolean>(true);
  const [metadataFormatFilters, setMetadataFormatFilters] = useState<any[]>([]);

  const [metadaCurrentRequests, setMetadataCurrentRequests] = useState<number>(0);

  const getMetadataFormatFilters = async (systemMarketplaceId: number) => {

    try {

      const { data: _metadataFormatFilters } = await axios.get(`ecommerce/system_marketplace/${systemMarketplaceId}/metadataFormatFilters`);
      setLoadingMetadataFormatFilters(false);

      setMetadataFormatFilters(oldArray => [...oldArray, _metadataFormatFilters]);



    } catch (error) {
      console.error(error);
    } finally {
      setLoadingMetadataFormatFilters(false);
    }
  }

  useEffect(() => {
    console.log("getMetadata")
    //setLoadingMetadataFormats(true);

    getMetadata();
    // Aparentemente el hot module reload de vite, no ejecuta el clanup
    return () => { console.log("cleanup"); setMetadataFormatFilters([]) }
  }, [])

  useEffect(() => {
    if (metadataFormatFilters) {
      console.log("metadataFormatFilters updated", metadataFormatFilters, metadataFormatFilters.length);
      setMetadataCurrentRequests(metadataFormatFilters ? metadataFormatFilters.length : 0)
    }

  }, [metadataFormatFilters])

  useEffect(() => {

    if (systemMarketplaces) {
      setLoadingMetadataFormatFilters(true);
      console.log("getMetadataFormatFilters")
      systemMarketplaces.map(
        (systemMarketplace, idx) => {

          console.log("getMetadataFormatFilters", systemMarketplace.id);
          getMetadataFormatFilters(systemMarketplace.id);
        }
      );
    }
  }, [systemMarketplaces]);


  /*const updateSelectedMetadataFormats = (newValues: any, marketplace: any) => {
      setAllSelectedValues([...newValues]);
      output_metadata_format_mappings.field.onChange([...newValues]);
  }*/




  //const MetadataMappers = useMemo(() => {

  //logger.log("loaded systemmarketplaces",systemMarketplaces);
  //const MetadataMappers:React.FC = ({...props}) => {
  //if (systemMarketplaces) return <Loading loadingSecondary={`Cargando system marketplaces...`} />

  if (!systemMarketplaces || !systemMarketplaces.length) { return <Loading loadingSecondary={`Cargando system marketplaces...`} /> }
  const marketplacesCount = systemMarketplaces.length;
  console.log("MARKETPLACES COUNT", marketplacesCount);

  if (systemMarketplaces && marketplacesCount && (metadaCurrentRequests < marketplacesCount)) return <Loading loadingSecondary={`Cargando Filtros ${metadaCurrentRequests}/${marketplacesCount}`} />
  return <>{systemMarketplaces.map(
    (systemMarketplace, idx) => <MarketplaceMetadaEdit
          metadata={metadata}
          isInternal={isInternal}
          systemMarketplace={systemMarketplace}
          idx={idx}
          metadataFormatFilters={metadataFormatFilters}
          attribute={attribute}
          method={'edit'} resourceConfig={null} />
  )}</>

  //}
  // }, [systemMarketplaces,tmp_selected_category, metadaCurrentRequests,filters]);


  /*<CategoryTree
              title={systemMarketplaces.find(systemMarketplace => systemMarketplace.id == parseInt(systemMarketplaceId)).name}
              metadataFormats={parsedMetadataFormatsByMarketplaceValues[systemMarketplaceId]}
              marketplaceId={systemMarketplaceId}
              updateSelectedMetadataFormats={updateSelectedMetadataFormats}
              defaultSelectedKeys={defaultSelectedKeys}
  />*/

  //return MetadataMappers
}
export interface IMarketplaceMetadaEdit extends IDashAutoAdminCustomFieldComponent {
  metadataFormatFilters: any[]
  idx: React.Key
  systemMarketplace: ISystemMarketplace

  isInternal: boolean
  metadata: Metadata

}

const OwnerableTypeFilter = ({ selectedOwnerableType, systemMarketplace, attribute, filters }) => {

  const tmp_selected_category = useWatch({ name: `tmp_selected_category_${selectedOwnerableType}` });
  const record = useRecordContext();

  const Selector = ({ defaultValue }: { defaultValue: IMarketplaceMetadata }) => {
    switch (selectedOwnerableType) {

      case "App\\Models\\SystemMarketplaceCategory":
        return <FormControl fullWidth><SearchableSelect
          resource='ecommerce/system_marketplace_category'
          selectLabel='Categoría'
          title='Seleccione una Categoría'
          renderText={(option) => `${option.breadcrumbed_name}`}
          name={`tmp_selected_category_${selectedOwnerableType}`}
          filter={{
            leafs: 1,
            flat: true,
            pagination: true,
            system_marketplace_id: systemMarketplace.id,
          }}
        /></FormControl>
        break;
      default:
        return <></>
    }

  }

  const system_marketplace_id = systemMarketplace.id;

  const includes: number[] = record && record.output_metadata_format_mappings &&
    Array.isArray(record.output_metadata_format_mappings) ?
    record.output_metadata_format_mappings
      .filter(ele => typeof ele !== 'number' && ele.systemMarketplaceMetadataFormat.system_marketplace_id === systemMarketplace.id)
      .map(ele => ele.system_marketplace_metadata_format_id) : [];

  const defaultValue: IMarketplaceMetadata = record && record.output_metadata_format_mappings &&
    Array.isArray(record.output_metadata_format_mappings) ?
    record.output_metadata_format_mappings
      .filter(ele => typeof ele !== 'number' && ele.systemMarketplaceMetadataFormat.system_marketplace_id === systemMarketplace.id)[0] : null;

  return <>

    <Selector defaultValue={defaultValue} />
    <SearchableSelectChipsControl
        /* @ts-ignore */
      attribute={attribute.attribute}
      resource={"ecommerce/system_marketplace_metadata_format"}
      useBaseAttributeName={false}
      fieldAttributeNamePrefix='temp_'

      selectLabel={"Búscador de metadata de marketplace"}
      queryFilter={"q"}
      //valueKeyId={"metadata_format_id"}
      renderText={(option: Category) => {
        return option ?
          (option.hasOwnProperty("systemMarketplaceMetadataFormat") ?
            option.systemMarketplaceMetadataFormat.name :
            option.name) : ""
      }}
      //transformData={(value: Category) => value.id}
      isOptionEqualToValue={(option: Category, value: Category) => {
        if (!option) return false;
        if (!value) return false;
        //return option.id === value.system_marketplace_metadata_format_id;
        return option.id === value.system_marketplace_metadata_format_id
      }}
      filter={{
        pagination: { perPage: 50 },
        system_marketplace_id: systemMarketplace.id,
        ...(filters && { group: filters.filter(ele => Number(ele.systemMarketplaceId) === Number(systemMarketplace.id) && ele.hasOwnProperty("group"))[0]?.group }),
        //...(filters && { ownerable_type: filters.filter(ele => Number(ele.systemMarketplaceId) === Number(systemMarketplace.id) && ele.hasOwnProperty("ownerable_type") )[0]?.ownerable_type }),
        ...(tmp_selected_category && { ownerable_id: tmp_selected_category.id }),
        ...(selectedOwnerableType && { ownerable_type: selectedOwnerableType })

      }}
      defaultValues={defaultValue}
      includes={includes}

      isMultiple={false}


    />
    {/*attribute.attribute*/}
    {/*JSON.stringify(includes)*/}
    {/*JSON.stringify(defaultValue)*/}

  </>


}

const OwnerableTypeSelector = ({ systemMarketplaceMetadataFormatFilters, systemMarketplace, ownerableTypes, attribute, filters }) => {

  const record = useRecordContext();

  const selectedValue: IMarketplaceMetadata = record && record.output_metadata_format_mappings &&
    Array.isArray(record.output_metadata_format_mappings) ?
    record.output_metadata_format_mappings
      .filter(ele => typeof ele !== 'number' && ele.systemMarketplaceMetadataFormat.system_marketplace_id === systemMarketplace.id)[0] : null;

  const [selectedOwnerableType, setSelectedOwnerableType] = useState(null);

  const selectOwnerableTypeHandler = (event: SelectChangeEvent) => {

    setSelectedOwnerableType(event.target.value as string);
  };
  const DICT = React.useContext(DictionaryContext);


  return <><FormControl fullWidth>
    <InputLabel /*id=""*/>{DICT.get('ownerable_type_selector_label')}</InputLabel>
    <Select
      /*labelId=""*/
      id="ownerable_type"
      {...(selectedValue && { value: selectedValue.systemMarketplaceMetadataFormat.ownerable_type })}
      label="Age"
      onChange={selectOwnerableTypeHandler}
    >
      {ownerableTypes.map((value, key) => (
        <MenuItem key={key} value={value.ownerable_type}>
          {DICT.get(value.ownerable_type)}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
    <OwnerableTypeFilter filters={filters} attribute={attribute} selectedOwnerableType={selectedOwnerableType} systemMarketplace={systemMarketplace} />
  </>
}


const MarketplaceMetadaEdit: React.FC<IMarketplaceMetadaEdit> = ({ attribute, method, idx, systemMarketplace, metadataFormatFilters, isInternal, metadata }) => {
  //const systemMarketplace: ISystemMarketplace = systemMarketplaces.find((systemMarketplace) => systemMarketplace.id === Number(systemMarketplaceId));

  /*
  const selected_value = useWatch({ name: attribute.attribute});

  useEffect(()=> {
   
  },[selected_value])
  */

  const DICT = React.useContext(DictionaryContext);

  const alteredAttribute = { ...attribute, ...{ attribute: attribute.attribute + "." + idx } }
  // este reemplazo hace que el formulario guarde los valores en  attribute.attribute

  const systemMarketplaceMetadataFormatFilters = metadataFormatFilters.filter(ele => Number(ele.id) === Number(systemMarketplace.id)).find(ele => { return ele.id === Number(systemMarketplace.id) });

  const ownerableTypes = systemMarketplaceMetadataFormatFilters ? systemMarketplaceMetadataFormatFilters.ownerable_types : []
  const groups = systemMarketplaceMetadataFormatFilters ? systemMarketplaceMetadataFormatFilters.groups : []

  console.log("attribute", attribute.attribute);
  console.log("ownerableTypes", ownerableTypes);
  console.log("groups", groups);


  const [filters, setFilters] = useState<any[]>(null);
  //foreach ownerableTypes
  /*
  {
   "ownerable_type": "App\\Models\\SystemMarketplaceCategory"
  }*/

   
  return <>

    <MarketplaceTag marketplace={systemMarketplace} />

    {isInternal ?
      <>Metadata '{metadata.name}' no es modificable</>
      :

      <>
        {/*ownerableTypes && ownerableTypes.length && processDynamicFilters(ownerableTypes)*/}

        {groups && groups.length ?

          <FormControl fullWidth>
            <InputLabel>Grupo</InputLabel>

            <Select
              /*labelId=""
              id=""*/
              label="Grupo"
              onChange={(values) => {
                setFilters(oldValues => {
                  return oldValues ?
                    [...oldValues.filter(ele => !(Number(ele.systemMarketplaceId) === Number(systemMarketplace.id) && ele.hasOwnProperty("group"))), { systemMarketplaceId: systemMarketplace.id, group: values }]
                    :
                    [{ systemMarketplaceId: systemMarketplace.id, group: values }]
                })
              }}
            >
              {groups.map((ele) => (
                <MenuItem key={ele.group} value={ele.group}>
                  {DICT.get(ele.group)}
                </MenuItem>
              ))}

            </Select>
          </FormControl>

          : <></>
        }

        <OwnerableTypeSelector systemMarketplaceMetadataFormatFilters={systemMarketplaceMetadataFormatFilters} filters={filters} attribute={alteredAttribute} ownerableTypes={ownerableTypes} systemMarketplace={systemMarketplace} />

      </>
    }


  </>

}

const MarketplacesMetadataMapperView: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {
  const category: Category = useRecordContext();

  const columns = [
    {
      title: 'Valor',
      dataIndex: 'text',
      key: 'name',
    }
  ];

  return (
    <Table<any>
      columns={columns}
      dataSource={category?.input_category_mappings}
      bordered
      rowClassName="editable-row"
      pagination={false}
    />
  );
};

const MarketplacesMetadataMapper = ({ method, attribute,resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
  switch (method) {
    case "edit":
    case "create":
      return <MarketplacesMetadataMapperEdit attribute={attribute} method={method} resourceConfig={resourceConfig} />
    //return <MarketplacesMetadataMapperSearcherEdit attribute={attribute} method={method} resourceConfig={resourceConfig} />
    case "view":
      return <MarketplacesMetadataMapperView attribute={attribute} method={method} resourceConfig={resourceConfig} />
  }
}

export default MarketplacesMetadataMapper;