import { Table } from 'antd';
import { Category } from '../../interfaces';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import React, { useEffect, useMemo, useState } from 'react'
import { useRecordContext } from "react-admin";
import MapperAntD from '../MapperAntD';
import { useAxios } from 'dash-axios-hook';
import { Loading } from 'react-admin';

import { Tree } from 'antd';
import type { DataNode } from 'antd/es/tree';
import Search from 'antd/lib/input/Search';
import { useController } from 'react-hook-form';


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
  class?: string
  icon_path?: string
  icon_url?: string
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
  systemMarketplaceSubcategories: ISystemMarketplaceCategory[]
  system_marketplace_category_id: number // ? viene null
  system_marketplace_id: number
}

export interface ICategoryTree {
  title: string
  categories: ISystemMarketplaceCategory[]
  marketplaceId: string | number
  updateSelectedCategories: (newValues: any, marketplace) => any
  defaultSelectedKeys: any[]
}

const parsetreeCategory = (category: ISystemMarketplaceCategory) => {
  return {

    title: category.name,
    key: category.id,
    children: category.systemMarketplaceSubcategories.map((cat) => parsetreeCategory(cat))

  }
}

const getParentKey = (key: React.Key, tree: DataNode[]): React.Key => {
  let parentKey: React.Key;
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.children) {
      if (node.children.some(item => item.key == key)) {
        parentKey = node.key;
      } else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children);
      }
    }
  }
  return parentKey!;
};

const getGenerateList = (data) => {
  const list = [];

  const generateList = (data) => {
    for (let i = 0; i < data.length; i++) {
      const node = data[i];
      const { key, title } = node;
      list.push({
        key,
        title
      });

      if (node.children) {
        generateList(node.children);
      }
    }
  };
  generateList(data);

  return list;
}


const CategoryTree: React.FC<ICategoryTree> = ({ marketplaceId, title, categories, updateSelectedCategories, defaultSelectedKeys, ...props }) => {

  //const treeData: DataNode[] = categories.map(category => parsetreeCategory(category));
  const [searchValue, setSearchValue] = useState('');
  const defaultData: DataNode[] = categories.map(category => parsetreeCategory(category));
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>(defaultSelectedKeys || []);
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>(defaultSelectedKeys ?? []);
  //const [selectedKeys, setSelectedKeys] = useState<React.Key[]>(defaultSelectedKeys ?? []);
  const dataList = useMemo(() => getGenerateList(defaultData), [defaultData]);
  const [typingTimerCategories, setTimerCategories] = useState(undefined);

  const handleTimer = (e) => {
    clearTimeout(typingTimerCategories);
    setTimerCategories(setTimeout(() => { onChange(e) }, 800));
  }

  const onExpand = (newExpandedKeys: React.Key[]) => {
    setExpandedKeys(newExpandedKeys);
    setAutoExpandParent(false);
  };

  const onCheck = (checkedKeysValue: React.Key[], node) => {

    //console.log('onCheck', checkedKeysValue);
    console.log([node.node.key]);
    //setCheckedKeys(checkedKeysValue);
    setCheckedKeys([node.node.key]);
    updateSelectedCategories([node.node.key], marketplaceId);

  };

  /*  const onSelect = (selectedKeysValue: React.Key[], info: any) => {

        console.log('onSelect', info);
        //setSelectedKeys(selectedKeysValue);
    };*/


  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    // console.log(value)
    if (value) {
      const newExpandedKeys = dataList
        .map((item: any) => {
          if (item.title.indexOf(value) > -1) {
            const parent = getParentKey(item.key, defaultData);
            return parent;
          }
          return null;
        })
        .filter((item, i, self) => item && self.indexOf(item) === i);
      setExpandedKeys(newExpandedKeys as React.Key[]);
      setSearchValue(value);
      setAutoExpandParent(true);
    }
    else {
      setExpandedKeys([]);
      setSearchValue(value);
      setAutoExpandParent(false);
    }
  };


  const treeData = useMemo(() => {
    const loop = (data: DataNode[]): DataNode[] =>
      data.map(item => {
        const strTitle = item.title as string;
        const index = strTitle.indexOf(searchValue);
        const beforeStr = strTitle.substring(0, index);
        const afterStr = strTitle.slice(index + searchValue.length);
        const title =
          index > -1 ? (
            <span>
              {beforeStr}
              <b>{searchValue}</b>
              {afterStr}
            </span>
          ) : (
            <span>{strTitle}</span>
          );
        if (item.children) {
          return { title, key: item.key, children: loop(item.children) };
        }

        return {
          title,
          key: item.key,

        };
      });

    return loop(defaultData);
  }, [searchValue]);

  return (
    <>
      <Search style={{ marginBottom: 8 }} placeholder="Search" onChange={handleTimer} />
      <Tree
        checkable
        onExpand={onExpand}
        expandedKeys={expandedKeys}
        autoExpandParent={autoExpandParent}
          /* @ts-ignore */
        onCheck={onCheck}
        checkedKeys={checkedKeys}
        //onSelect={onSelect}
        //selectedKeys={selectedKeys}
        treeData={treeData}
        multiple={false}
      />
    </>
  );
};


const MarketplacesCategoryMapperEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {

  const category: Category = useRecordContext();


  const [parsedCategoriesByMarketplaceValues, setParsedCategoriesByMarketplaceValues] = useState(null);
  const [systemMarketplaces, setSystemMarketplaces] = useState<ISystemMarketplace[]>(null);
  const [systemMarketplacesCategories, setSystemMarketplacesCategories] = useState<ISystemMarketplaceCategory[]>(null);
  const axios = useAxios();
  const [loadingCategories, setLoadingCategories] = useState<boolean>(false);
  const defaultSelectedKeys = category?.output_category_mappings ? category.output_category_mappings.map(ele => ele.system_marketplace_category_id) : []
  const output_category_mappings = useController({ name: "output_category_mappings", defaultValue: defaultSelectedKeys })
  const [allSelectedValues, setAllSelectedValues] = useState<number[]>(defaultSelectedKeys);

  useEffect(() => {
    const getCategories = async () => {
      let parsedCategories = {};
      try {
        const { data: _systemMarketplaces } = await axios.get(`ecommerce/system_marketplace`);
        const { data: _systemMarketplacesCategories } = await axios.get(`ecommerce/system_marketplace_category`);
        setSystemMarketplaces(_systemMarketplaces.data);
        setSystemMarketplacesCategories(_systemMarketplacesCategories.data);
        _systemMarketplaces.data.map((systemMarketplace: ISystemMarketplace) => {
          parsedCategories = { ...parsedCategories, ...{ [systemMarketplace.id]: _systemMarketplacesCategories.data.filter((category) => category.system_marketplace_id == systemMarketplace.id) } };
        });
        setParsedCategoriesByMarketplaceValues(parsedCategories);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingCategories(false);
      }
    }
    setLoadingCategories(true);
    getCategories();
  }, [])



  const updateSelectedCategories = (newValues: any, marketplace: any) => {
    setAllSelectedValues([...allSelectedValues, ...newValues]);
    output_category_mappings.field.onChange([...allSelectedValues, ...newValues]);
  }

  const CategoryMappers = useMemo(() => {
    if (!parsedCategoriesByMarketplaceValues) return <Loading />
    return <>{Object.keys(parsedCategoriesByMarketplaceValues).map(
      (systemMarketplaceId) =>
        <CategoryTree
          title={systemMarketplaces.find(systemMarketplace => systemMarketplace.id == parseInt(systemMarketplaceId)).name}
          categories={parsedCategoriesByMarketplaceValues[systemMarketplaceId]}
          marketplaceId={systemMarketplaceId}
          updateSelectedCategories={updateSelectedCategories}
          defaultSelectedKeys={defaultSelectedKeys}
        />
    )}</>

  }, [parsedCategoriesByMarketplaceValues]);


  /*return <>{JSON.stringify(allSelectedValues)} {CategoryMappers}</>*/
  return <>{CategoryMappers}</>
}

const MarketplacesCategoryMapperView: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {
  const category: Category = useRecordContext();

  const columns = [
    {
      title: 'Valor',
      dataIndex: 'text',
      key: 'name',
    }
  ]
  return (
    <Table columns={columns} dataSource={category?.input_category_mappings} bordered rowClassName="editable-row" pagination={false} />
  )
}

const MarketplacesCategoryMapper = ({ method, attribute,resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
  switch (method) {
    case "edit":
    case "create":
      return <MarketplacesCategoryMapperEdit attribute={attribute} method={method} resourceConfig={resourceConfig} />
    case "view":
      return <MarketplacesCategoryMapperView attribute={attribute} method={method} resourceConfig={resourceConfig} />
  }
}

export default MarketplacesCategoryMapper;
