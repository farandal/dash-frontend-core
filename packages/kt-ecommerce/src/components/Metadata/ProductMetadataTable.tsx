
import { IMetadataMappingRow, Metadata, Product } from '../../interfaces';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import React, { useState } from 'react'
import { useGetList } from 'react-admin';
import { useRecordContext } from "react-admin";
import { useController, useFieldArray } from 'react-hook-form';
import { Form, Popconfirm, Table } from 'antd';
import EditableCellOnFocus, { ColumnTypes, EditableRow } from '../DataTable/EditableCellOnFocus';
import * as Icons from '@mui/icons-material';
import { Chip, TextField } from '@mui/material';
import { Badge } from '@mui/material';

const MetadataField = ({ name, label, defaultValue }) => {
  const {
    field,
    //fieldState: { isTouched, error },
    // formState: { isSubmitted }
  } = useController({ name, defaultValue });

  return (
    <TextField
      {...field}
      label={label}
    // @TODO: integrar validador de moneda dependiendo del currency
    //error={(isTouched || isSubmitted)}
    //helperText={(isTouched || isSubmitted) && invalid ? error : ''}
    />
  );
};

const MetadataViewField = ({ name, label, defaultValue }) => {

  return (
    <Badge style={{ width: 50, fontSize: 4 }} badgeContent={label} color="primary">
      <Chip style={{ width: 100 }} label={defaultValue} />
    </Badge>
  );
};


const ProductMetadataEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {

  const product: Product = useRecordContext();
  const { data: availableMetadataFormats, isLoading: availableMetadataFormatsLoading } = useGetList(
    'ecommerce/metadata_format',
    {},
    { refetchOnWindowFocus: false }
  );

  // Metadata options related
  const { replace: replaceMetadataMappings } = useFieldArray({ name: 'mappings' })
  const [form] = Form.useForm()
  const [editingKey, setEditingKey] = useState(null)
  const isEditing = (record: IMetadataMappingRow) => record.key === editingKey
  /* @ts-ignore */
  const [count, setCount] = useState(availableMetadataFormats?.metadata_mappings ? availableMetadataFormats.metadata_mappings.length : 0);

  const processRowData = (rows: IMetadataMappingRow[]) => {
    replaceMetadataMappings(rows);
  }

  /* @ts-ignore */
  const handleAdd = () => {
    /* @ts-ignore */
    const newData: IMetadataMappingRow = {
      key: count,
      input: "",
      output: ""
    };
    setRows([...rows, newData]);
    setCount(count + 1);
  };

  const handleSave = (row: IMetadataMappingRow) => {
    const newData = [...rows];
    const index = newData.findIndex(item => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    setRows(newData);
    processRowData(newData);
  };

  const handleDelete = (key: React.Key) => {
    const newData = rows.filter(item => item.key !== key);
    setRows(newData);
  };

  const cancel = () => {
    setEditingKey(null);
  };

  const cols: (ColumnTypes[number] & { editable?: boolean; dataIndex: string })[] = [
    {
      title: "Nombre",
      dataIndex: "name",
      key: "name",
      editable: false,
      width: '40%',

    },
    {
      title: "Valor",
      dataIndex: "value",
      key: "value",
      editable: true,
      width: '40%',

    },
    {
      title: 'Acciones',
      dataIndex: 'operation',
      width: '20%',
        /* @ts-ignore */
      render: (_, record: IMetadataMappingRow) =>
        rows.length >= 1 ? (
          <Popconfirm title="¿Seguro que desea eliminar?" onConfirm={() => handleDelete(record.key)}>
            <Icons.Delete />
          </Popconfirm>
        ) : null,
    },

  ];

  const mergedCols = cols.map(col => {
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
  /* @ts-ignore */
  const _rows: IMetadataMappingRow[] = availableMetadataFormats && availableMetadataFormats.map((metadata_format: Metadata) => {
    return {
      key: metadata_format.id,
      name: metadata_format.name,
      value: ""
    }
  });

  const [rows, setRows] = useState<IMetadataMappingRow[]>(_rows);

  return (
    <>
      Available formats: {JSON.stringify(availableMetadataFormats)} <br />
      Metadata: {JSON.stringify(product.metadata)} <br />
      Rows: {JSON.stringify(_rows)} <br />
      {/*availableMetadataFormats && (availableMetadataFormats as Metadata[]).map((metaType) => {

                let prodcutStock = product && product.metadata ? product.metadata.find(metaItem => metaType.id === metaItem.stock_type_id) : null;

                return <MetadataField name={"updatedStocks._" + stockType.id} label={stockType.name} defaultValue={(prodcutStock?.stock) ?? 0} />
             
            })}*/}

      <Form form={form} component={false}>
        <Table
          components={{
            body: {
              row: EditableRow,
              cell: EditableCellOnFocus,
            }
          }}
          bordered
          dataSource={rows}
          /* @ts-ignore */
          columns={mergedCols}
          rowClassName="editable-row"
          pagination={{
            onChange: cancel,
          }}
        />
      </Form>

    </>
  )
}

const ProductMetadataView: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {
  const product: Product = useRecordContext();

  const { data: availableMetadataFormats, isLoading: availableMetadataFormatsLoading } = useGetList(
    'ecommerce/metadata_format',
    {},
    { refetchOnWindowFocus: false }
  );

  return (
    <table>
      {/*availableMetadataFormats && (availableMetadataFormats as Metadata[]).map((stockType) => {
                    let prodcutStock = product && product.stocks ? product.stocks.find(priceItem => stockType.id === priceItem.stock_type_id) : null;
                    return (
                        prodcutStock && prodcutStock.stock &&
                    <tr>
                    <td style={{padding:"3px",backgroundColor:"#f5f5f5"}}>{stockType.name}</td>
                    <td>{prodcutStock?.stock}</td>
                    </tr>
                    )
                })*/}
    </table>


  )
}

const ProductMetadata = ({ method, attribute,resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
  switch (method) {
    case "edit":
    case "create":
      return <ProductMetadataEdit attribute={attribute} method={method} resourceConfig={resourceConfig} />
    case "view":
      return <ProductMetadataView attribute={attribute} method={method} resourceConfig={resourceConfig} />
  }
}

export default ProductMetadata;