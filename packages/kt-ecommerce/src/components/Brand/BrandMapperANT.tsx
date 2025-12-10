import React, { useState } from 'react';
import { Button, useRecordContext } from 'react-admin';
import { useFieldArray, useForm } from 'react-hook-form';
import { Dialog, DialogActions, DialogTitle, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
//import EditableCell from '../DataTable/EditableCell';
import * as Icons from '@mui/icons-material';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
//input interfaces
export interface BrandMappingResource {
    text: string
}

//controller interface
export interface IBrandMappingCol {
  key: React.Key,
  editable: boolean,
  title: string,
  dataIndex: string,
  name: string
}

export interface IBrandMappingRow extends BrandMappingResource {
  key: React.Key
}


const BrandMapperANTEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {

    // TODO reemplazar con Brand
  const brand: any = useRecordContext();
  //const hasMappingField = useController({ name: 'has_mapping', defaultValue: false })
  //const hasMapping = useWatch({ name: 'has_mapping' })

  const { replace: replaceMetadataMappings } = useFieldArray({ name: 'input_brand_mappings' })

  const { register, handleSubmit, setValue, getValues } = useForm()
  const [editingKey, setEditingKey] = useState(null)
  const isEditing = (record: IBrandMappingRow) => record.key === editingKey

  const [count, setCount] = useState(brand?.input_brand_mappings ? brand.input_brand_mappings.length : 0);

  //const edit = (record: Partial<IBrandMappingRow> & { key: React.Key }) => {
  const edit = (record: IBrandMappingRow) => {
    setValue('text', record.text)
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
      const row = getValues() as IBrandMappingRow

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

  const cols = [
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
      render: (_: any, record: IBrandMappingRow) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Icons.Link component="button" onClick={() => save(record.key)} style={{ marginRight: 8 }}>
              Guardar
            </Icons.Link>
            <Dialog
              open={true}
              onClose={cancel}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
            >
              <DialogTitle id="alert-dialog-title">
                ¿Seguro que quiere cancelar?
              </DialogTitle>
              <DialogActions>
                <Button onClick={cancel}><>Cancelar</></Button>
                <Button onClick={cancel} autoFocus>
                  <>Confirmar</>
                </Button>
              </DialogActions>
            </Dialog>
          </span>
        ) : (
          <>
            <Icons.Link 
              component="button" 
              disabled={editingKey !== null} 
              onClick={() => edit(record)}
            >
              Editar
            </Icons.Link>
          </>
        );      },
    },
    {
        title: 'Eliminar',
        dataIndex: 'delete',
        width: '20%',
        render: (_, record: IBrandMappingRow) =>
            rows.length >= 1 ? (
                <Dialog
                    open={true}
                    onClose={() => {}}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">
                        ¿Seguro que desea eliminar?
                    </DialogTitle>
                    <DialogActions>
                        <Button onClick={() => {}}><>Cancelar</></Button>
                        <Button onClick={() => handleDelete(record.key)} autoFocus>
                            <>Confirmar</>
                        </Button>
                    </DialogActions>
                    <Icons.Delete style={{cursor: 'pointer'}} />
                </Dialog>
            ) : null,
    },
  ];

  const mergedCols = cols.map(col => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: IBrandMappingRow) => ({
        record,
        inputType: 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  const _rows: IBrandMappingRow[] = brand?.input_brand_mappings ? brand.input_brand_mappings.map((_mapping: BrandMappingResource, _index: number) => {
    return {
      key: _index,
      //editable:true,
      ..._mapping
    }
  }) : [];


  const [rows, setRows] = useState<IBrandMappingRow[]>(_rows);

  const processRowData = (rows:IBrandMappingRow[]) => {

    console.log(rows);

    replaceMetadataMappings(rows);
  }

  const handleAdd = () => {
    const newData: IBrandMappingRow = {
        key: count,
        text: "",
    };
    setRows([...rows, newData]);

    setCount(count + 1);
};

  return (<>
    <div style={{display: 'flex', position: 'relative', marginTop: '-34px'}}>
      <Button variant="contained" style={{ marginBottom: 16, marginLeft: 'auto' }} onClick={handleAdd} color="primary" aria-label="add">
        <Icons.Add />
        Agregar
      </Button>
    </div>
      <form onSubmit={handleSubmit(() => {})}>
        <Table
          sx={{
            '& .editable-row': {
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            },
          }}
          className="editable-row"
        >
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={row.key}>
                {mergedCols.map((column) => (
                  <TableCell key={column.dataIndex}>
                    {/*column.onCell ? (
                      <EditableCell {...column.onCell(row)} />
                    ) : (
                      column.render ? column.render(row[column.dataIndex], row) : row[column.dataIndex]
                    )*/}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </form>
  </>
  );
};const BrandMapperANTView: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {
  const brand: any = useRecordContext();
  const columns = [
    {
        title: 'Valor',
        dataIndex: 'text',
        key: 'name',
    }
  ]
  return (
      <>
        <Table component="div">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.key}>{column.title}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {brand?.input_brand_mappings?.map((row, index) => (
              <TableRow key={index} className="editable-row">
                <TableCell>{row.text}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </>
  )
}

const BrandMapperANT = ({ method, attribute,resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
  switch (method) {
      case "edit":
      case "create":
          return <BrandMapperANTEdit attribute={attribute} method={method} resourceConfig={resourceConfig} />
      case "view":
          return <BrandMapperANTView attribute={attribute} method={method} resourceConfig={resourceConfig} />
  }
}

export default BrandMapperANT;