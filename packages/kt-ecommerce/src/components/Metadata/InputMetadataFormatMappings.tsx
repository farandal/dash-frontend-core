/*import { Button, Form, FormInstance, Input, InputNumber, InputRef, Popconfirm, Table, Typography } from 'antd';
import { ISystemMarketplace, Tenant } from '../../interfaces/Tenant';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';;
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useRecordContext } from 'react-admin';
import { useController, useFieldArray, useWatch } from 'react-hook-form';
import { Fab, FormControlLabel, Switch } from '@mui/material';
import * as Icons from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { IMetadataMappingRow, Metadata, MetadataMappingResource } from '../../interfaces/Metadata';
import EditableCellOnFocus, { ColumnTypes, EditableRow } from '../DataTable/EditableCellOnFocus';
import { useGetOne } from 'react-admin';
import { getCookie } from '../../utils/cookies';
import { stringify } from 'qs';
import { Loading } from 'react-admin';
import MarketplaceTag from '../Misc/MarketplaceTag';
import { useLogger } from '../../hooks/useLogger';*/

import { Button, Form, FormInstance, Input, InputNumber, InputRef, Popconfirm, Table, Typography } from 'antd';
import { Metadata, IMetadataMappingRow, MetadataMappingResource } from "../interfaces/Metadata";

import * as Icons from '@mui/icons-material';

import { getCookie } from "dash-admin/src/utils/cookies";
import { IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";
import React, { useState, useEffect } from "react";
import { useGetOne, useRecordContext, Loading } from "react-admin";

import { useFieldArray } from "react-hook-form";

import EditableCellOnFocus, { ColumnTypes, EditableRow } from "../DataTable/EditableCellOnFocus";
import MarketplaceTag from "../Misc/MarketplaceTag";
import { ISystemMarketplace } from "./MarketplacesMetadataMapper";
import { Tenant } from '../interfaces';
import { dashStorage } from 'dash-utils';


const InputMetadataFormatMappingsEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {
  // Por cada system marketplace renderea un mapeador de metadata
  const tenant_id = dashStorage.getItem('tenant_id');
  //const logger = useLogger("InputMetadataFormatMappingsEdit");
  const { data: tenant, isLoading: tenantLoading, error: tenantError } = useGetOne('tenant/tenant', { id: tenant_id }, { refetchOnWindowFocus: false });

  const metadata: Metadata = useRecordContext();
  // For each system_marketplace render InputMetadataMarketplaceMappe
  const [tenantSystemMarketplaces, setTenantSystemMarketplaces] = useState<ISystemMarketplace[]>(null);
  useEffect(() => {
    if (tenant && !tenantLoading && !tenantError) {
      setTenantSystemMarketplaces((tenant as Tenant).systemMarketplaces);
    }
  }, [tenant, tenantLoading, tenantError])

  console.log("InputMetadataFormatMappingsEdit Component")
  console.log('tenantSystemMarketplaces', tenantSystemMarketplaces)
  console.log('metadata', metadata)

  return tenantSystemMarketplaces ? 
    tenantSystemMarketplaces.length === 0 ? 
      <div>No hay marketplaces asociados al cliente</div> 
      : <>{tenantSystemMarketplaces.map((tenantSystemMarketplace, idx) => {
          return <div key={idx} className='input-metadata-marketplace-mapper' ><InputMetadataMarketplaceMapper metadata={metadata} tenantSystemMarketplace={tenantSystemMarketplace} idx={idx} /></div>
        })}</>
    : <Loading />

}
export interface IInputMetadataMarketplaceMapper {
  tenantSystemMarketplace: ISystemMarketplace
  idx: number
  metadata: Metadata
}
const InputMetadataMarketplaceMapper: React.FC<IInputMetadataMarketplaceMapper> = ({ metadata, tenantSystemMarketplace, idx, ...props }) => {
  // Mapeador de metadata
  //const logger = useLogger("InputMetadataMarketplaceMapper");

  const _input_metadata_format_mappings = metadata && metadata.input_metadata_format_mappings ? metadata.input_metadata_format_mappings.filter(ele => ele.system_marketplace_id === tenantSystemMarketplace.id) : [];
  //const hasMappingField = useController({ name: 'has_mapping', defaultValue: false })
  //const hasMapping = useWatch({ name: 'has_mapping', defaultValue: false })
  const { replace: replaceMetadataMappings } = useFieldArray({ name: 'temp_input_metadata_format_mappings.' + idx })
  const [form] = Form.useForm()
  const [editingKey, setEditingKey] = useState(null)
  const isEditing = (record: IMetadataMappingRow) => record.key === editingKey
  //const [count, setCount] = useState(_input_metadata_format_mappings ? _input_metadata_format_mappings.length : 0);

  const [cols, setCols] = useState([]);
  const [rows, setRows] = useState<IMetadataMappingRow[]>(null);

  const isInternal = metadata?.is_internal === true ? true : false;

  const _cols: (ColumnTypes[number] & { editable?: boolean; dataIndex: string })[] = [
    {
      title: "Entrada",
      dataIndex: "input",
      key: "input",
      editable: true,
      width: '40%',
    },
    {
      title: "Salida",
      dataIndex: "output",
      key: "output",
      editable: !isInternal,
      width: '40%',
    },
    {
      title: 'Acciones',
      dataIndex: 'operation',
      render: (value, record, index) =>
        _input_metadata_format_mappings.length >= 1 && !isInternal ? (
          <Popconfirm title="¿Seguro que desea eliminar?" onConfirm={() => handleDelete((record as IMetadataMappingRow).key)}>
            <Icons.Delete />
          </Popconfirm>
        ) : null,
    }
  ];

  useEffect(() => {

    const _rows: IMetadataMappingRow[] = metadata && _input_metadata_format_mappings ?

      _input_metadata_format_mappings.map((_metadata_mapping: MetadataMappingResource, _index: number) => {
        return {
          key: _metadata_mapping.id,
          ..._metadata_mapping
        }
      }) : [];

    console.log("Setting intial rows: ", _rows);

    processRowData(_rows);

    /*return () => {
       console.log("Cleanup Rows and Cols")
       setRows([]);
       setCols([]);
      }*/

  }, [metadata]);

  useEffect(() => {
    const processedCols = _cols.map(col => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: (record: IMetadataMappingRow) => ({
          record,
          inputType: 'text',
          dataIndex: col.dataIndex,
          title: col.title,
          editing: isEditing(record),
          editable: col.editable,
          handleSave
        }),
      };
    });
    setCols(processedCols);
  }, rows)

  const processRowData = (rows: IMetadataMappingRow[]) => {
    replaceMetadataMappings(rows);
    setRows(rows);
  }

  const handleAdd = () => {
    const newData: IMetadataMappingRow = {
      key: rows.length + 1,
      input: "",
      output: "",
      system_marketplace_id: tenantSystemMarketplace.id
    };

    //processRowData([...rows, newData]);
    setRows([...rows, newData]);
    //setCount(count + 1);
  };

  const handleSave = (row: IMetadataMappingRow) => {

    const _data = [...rows];

    //const item = _data.find(item => item.key === row.key) || row;

    const index = _data.findIndex(item => row.key === item.key);

    if (index === -1) {
      _data.push(row);
    } else {
      _data.splice(index, 1, {
        ...row
      });
    }

    let newDataWithSystemMarketplace = _data.map(data => {
      return {
        ...data,
        system_marketplace_id: tenantSystemMarketplace.id
      }
    })

    //setRows(newDataWithSystemMarketplace);
    processRowData(newDataWithSystemMarketplace);
  };

  const handleDelete = (key: React.Key) => {
    const newData = rows.filter(item => item.key !== key);
    //setRows(newData);
    processRowData(newData);
  };

  const cancel = () => {
    setEditingKey(null);
  };
  
  return <Form form={form} component={false}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', margin: '24px 0 4px' }}>
      <MarketplaceTag marketplace={tenantSystemMarketplace} />
      {!isInternal ? <Button type='primary' style={{ marginBottom: 16 }} onClick={handleAdd} aria-label="add">
        <Icons.Add /> Agregar
      </Button> : <></>}
    </div>
    <Table
      components={{
        body: {
          row: EditableRow,
          cell: EditableCellOnFocus,
        }
      }}
      bordered
      dataSource={rows}
      //dataSource={_rows}
      columns={cols}
      rowClassName="editable-row"
      pagination={{
        onChange: cancel,
      }}
    />

  </Form>


};

const InputMetadataFormatMappingsView: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {
  const record: Metadata = useRecordContext();
  return <>{JSON.stringify(record[attribute.attribute])}</>
}

const InputMetadataFormatMappings = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
  switch (method) {
    case "edit":
    case "create":
      return <InputMetadataFormatMappingsEdit resourceConfig={resourceConfig} attribute={attribute} method={method} />
    case "view":
      return <InputMetadataFormatMappingsView resourceConfig={resourceConfig} attribute={attribute} method={method} />
  }
}

export default InputMetadataFormatMappings;