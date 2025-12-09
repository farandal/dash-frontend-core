import { Form, Popconfirm, Table, Typography } from 'antd';

import React, { useEffect, useState } from 'react';
import { useFieldArray } from 'react-hook-form';
import { Fab } from '@mui/material';
import EditableCell from './DataTable/EditableCell';
import * as Icons from '@mui/icons-material';
import { Loading } from 'react-admin';
//input interfaces
export interface MappingResource {
  text: string
}

//controller interface
// export interface IBrandMappingCol {
//   key: React.Key,
//   editable: boolean,
//   title: string,
//   dataIndex: string,
//   name: string
// }

export interface IMappingRow extends MappingResource {
  key: React.Key
}

const MapperAntD = ({ name, data }) => {

  //const data: any = useRecordContext();
  //const hasMappingField = useController({ name: 'has_mapping', defaultValue: false })
  //const hasMapping = useWatch({ name: 'has_mapping' })

  const { replace: replaceMetadataMappings } = useFieldArray({ name })

  const [form] = Form.useForm()
  const [editingKey, setEditingKey] = useState(null)
  const isEditing = (record: IMappingRow) => record.key === editingKey
  const [rows, setRows] = useState<IMappingRow[]>(null);
  //const [count, setCount] = useState(0);
  const [cols, setCols] = useState(null);

  useEffect(() => {
    const _rows: IMappingRow[] = data && data[name] ? data[name].map((_mapping: MappingResource, _index: number) => {
      return {
        key: _index,
        //editable:true,
        ..._mapping
      }
    }) : [];

    //setCount(data && data[name] ? data[name].length : 0);
    setRows(_rows);

  }, [data])

  useEffect(() => {

    if(!rows) return;
  
    const _cols = [
      {
        title: "Entrada",
        dataIndex: "text",
        key: "text",
        editable: true,
        width: '40%',
  
      },
      {
        title: 'Editar',
        dataIndex: 'edit',
        width: '20%',
        render: (_: any, record: IMappingRow) => {
          const editable = isEditing(record);
          return editable ? (
            <span>
              <Typography.Link onClick={() => save(record.key)} style={{ marginRight: 8 }}>
                Guardar
              </Typography.Link>
              <Popconfirm title="¿Seguro que quiere cancelar?" onConfirm={cancel}>
                <a>Cancelar</a>
              </Popconfirm>
            </span>
          ) : (
            <Typography.Link style={{ cursor: 'pointer' }} disabled={editingKey !== null} onClick={() => edit(record)}>
              Editar
            </Typography.Link>
          );
        },
      },
      {
        title: 'Eliminar',
        dataIndex: 'delete',
        width: '20%',
        render: (_, record: IMappingRow) =>
          rows.length >= 1 ? (
            <Popconfirm title="¿Seguro que desea eliminar?" onConfirm={() => handleDelete(record.key)}>
              <Icons.Delete style={{ cursor: 'pointer' }} />
            </Popconfirm>
          ) : null,
      },
    ];
  
    const mergedCols = _cols.map(col => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: (record: IMappingRow) => ({
          record,
          inputType: 'text',
          dataIndex: col.dataIndex,
          title: col.title,
          editing: isEditing(record),
        }),
      };
    });

    setCols(mergedCols);

    
  },[rows,editingKey])


  //const edit = (record: Partial<IMappingRow> & { key: React.Key }) => {
  const edit = (record: IMappingRow) => {
    form.setFieldsValue({ ...record })
    setEditingKey(record.key)
  };

  const cancel = () => {
    setEditingKey(null);
  };

  const handleDelete = (key: React.Key) => {
    const newData = rows.filter(item => item.key !== key);
    setRows(newData);
    processRowData(newData)
  };

  const save = async (key: React.Key) => {
    try {
      const row = (await form.validateFields()) as IMappingRow

      const newData = [...rows];
      const index = newData.findIndex(item => key === item.key)
      if (index > -1) {
        const item = newData[index]
        newData.splice(index, 1, {
          ...item,
          ...row,
        });

      } else {
        newData.push(row)

      }
      setRows(newData)
      setEditingKey(null)
      processRowData(newData)
    } catch (errInfo) {
      console.log('Validación', errInfo)
    }
  };

  const processRowData = (rows: IMappingRow[]) => {
    console.log(rows);
    replaceMetadataMappings(rows);
  }

  const handleAdd = () => {
    if(!rows) return;
    const newData: IMappingRow = {
      //key: count,
      key: rows.length+1,
      text: "",
    };
    setRows([...rows, newData]);
    //setCount(count + 1);
  };

  if (!rows) return <Loading />
  return (<>

    <Form form={form} component={false}>
      <Table
        components={{
          body: {
            cell: EditableCell,
          },
        }}
        bordered
        dataSource={rows}
        columns={cols}
        rowClassName="editable-row"
        //   pagination={{
        //     onChange: cancel,
        //   }}
        pagination={false}
      />
    </Form>
    <Fab size="small" className='fab-mapper' onClick={handleAdd} color="primary" aria-label="add">
      <Icons.Add />
    </Fab>
  </>
  );
}

export default MapperAntD
