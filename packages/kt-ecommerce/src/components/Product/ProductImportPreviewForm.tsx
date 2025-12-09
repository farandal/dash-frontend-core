import React, { useEffect, useImperativeHandle, useState } from 'react'
import * as Icons from '@mui/icons-material';

import { Table, Button, Popconfirm, Row, Col, Upload, Form, Steps } from "antd";
const Step = Steps.Step;

import { ExcelRenderer } from "react-excel-renderer";
import { useController, useWatch } from 'react-hook-form';

import { ColumnsType } from 'antd/lib/table';

import { Switch } from '@mui/material';
import { useDialog } from "../Dialog/DialogService";
import { IProductTemplate, IProductTemplateColumn } from '../interfaces/Product';
import { IProductImportTemplateRow } from './ProductImportExport/Interfaces';

export type TProductImportPreviewFormHandlers = {
  getOutput: () => IProductImportTemplateRow[]
  getFile: () => File
  getCreateCategoriesBoolean: () => boolean
};

export interface IProductImportPreviewFormProps {
  selectedTemplate: IProductTemplate
  preview: boolean
  children?: React.ReactNode
  [x: string]: any
}
// @TODO @BACKLOG Edición inline de la tabla @deprecated mientras se importe el excel y no JSON
// @TODO @BACKLOG manejar SHOW_ACTIONS en ProductImportForm.tsx depende si se permitirán editar inline los valores de la tabla. @deprecated mientras se cargue el excel
// @TODO @BACKLOG: manejar textos de ProductImportForm.tsx desde archivo de constantes ; i8ln

const deleteText = "¿Está seguro de eliminar este registro?"
const onlyExcel = "You can only upload Excel file!"
const maxSizeMessage = "File must be smaller than 2MB!"
const maxSize = 5; //MB
const noFileMessage = "No file uploaded!"
const unknownFileTypeMessage = "Unknown file format. Only Excel files are uploaded!"
const noDataMessage = "No data found in file!"
const defaultExcelRendererError = "Error reading excel File"

const ProductImportPreviewForm = React.forwardRef<
  TProductImportPreviewFormHandlers,
  IProductImportPreviewFormProps
>(({ selectedTemplate, preview, ...props }, ref) => {

  const [cols, setCols] = useState<ColumnsType<IProductImportTemplateRow>>(null);
  const [rows, setRows] = useState<IProductImportTemplateRow[]>(null);
  const [file, setFile] = useState<File>();
  const [createCategoriesBoolean, setCreateCategoriesBoolean] = useState<boolean>(false);

  const createCategoriesField = useController({
    name: 'create_new_categories',
    defaultValue: false,
    rules: { required: true }
  });
  const assignDefaultBrand = useController({
    name: 'assign_default_brand',
    defaultValue: false,
    rules: { required: true }
  });
  const assignDefaultCategory = useController({
    name: 'assign_default_category',
    defaultValue: false,
    rules: { required: true }
  });

  const dialog = useDialog();

  const SHOW_ACTIONS = false;

  useImperativeHandle(ref, () => {
    return {
      getOutput: handleSubmit,
      getFile: getFile,
      getCreateCategoriesBoolean: getCreateCategoriesBoolean,
    };
  });

  const [errorMessage, setErrorMessage] = useState<string>(null);

  useEffect(() => {
    if (errorMessage) {
      dialog({
        variant: "danger",
        title: "Error",
        content: errorMessage,
        onSubmit: () => {
        },
        onClose: () => { }
      });
    }

  }, [errorMessage])

  const handleSave = row => {
    const newData = [...rows];
    const index = newData.findIndex(item => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row
    });
    setRows(newData)
  };

  const checkFile = (file) => {
    let errorMessage = "";
    if (!file || !file[0]) {
      return;
    }
    const isExcel =
      file[0].type === "application/vnd.ms-excel" ||
      file[0].type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    if (!isExcel) {
      errorMessage = onlyExcel;
    }

    const isLt2M = file[0].size / 1024 / 1024 < maxSize;
    if (!isLt2M) {
      errorMessage = maxSizeMessage;
    }

    return errorMessage;
  }

  const addTemplateCols = (c: ColumnsType<IProductImportTemplateRow>): ColumnsType<IProductImportTemplateRow> => {
    return c.map(col => {
      col = { ...col };
      return col;
    });
  }

  const addTemplateRows = (r: IProductImportTemplateRow[]): IProductImportTemplateRow[] => {
    return [...r];
  }

  const fileHandler = fileList => {

    let fileObj = fileList;
    if (!fileObj) {
      setErrorMessage(noFileMessage);
      return false;
    }

    if (
      !(
        fileObj.type === "application/vnd.ms-excel" ||
        fileObj.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      )
    ) {
      setErrorMessage(unknownFileTypeMessage);
      return false;
    }
    //just pass the fileObj as parameter
    ExcelRenderer(fileObj, (err, resp) => {

      setFile(fileObj);
      if (err) {

        setErrorMessage(err.message ?? defaultExcelRendererError);

      } else {

        let newRows = [];
        // TODO: reemplazar 5 por selectedTemplate.skip_rows
        resp.rows.slice(5).map((row, index) => {
          if (row && row !== "undefined") {
            newRows.push({
              key: index,
              ...row
            });
          }
        });

        // Las columnas se manejan desde la data de la plantilla
        /*let newCols: ColumnsType<IProductImportTemplateRow> = [];
        resp.cols.map((col, index) => {
          if (col && col !== "undefined") {
            newCols.push({
              ...col,
              title: col.name,
              dataIndex: col.key
            });
          }
        });*/

        if (newRows.length === 0) {
          setErrorMessage(noDataMessage);

          return false;
        } else {
          //const [pcols,prows] = addTemplateInputs(newCols,newRows);
          //setCols(addTemplateCols(newCols));
          setRows(addTemplateRows(newRows));
          // set cols usa un useEffect the rows
          setErrorMessage(null);
        }
      }
    });
    return false;
  };

  useEffect(() => {
    if (rows && rows.length) {
      const newCols = [
        ...selectedTemplate.productTemplateColumns.map((templateColumn: IProductTemplateColumn) => {
          const col = {
            title: templateColumn.name,
            dataIndex: templateColumn.data_index,
            editable: templateColumn.editable
          };
          return col;
        })
      ];

      if (SHOW_ACTIONS) {
        newCols.push({
          title: "Action",
          dataIndex: "action", // TODO! dataIndex : number, pero typescript falla por el render method
          render: (text, record) =>
            rows.length >= 1 ? (
              <Popconfirm
                title={deleteText}
                onConfirm={() => handleDelete(record.key)}
              >
                <Icons.Delete
                  //type="delete"
                  //theme="filled"
                  style={{ color: "red", fontSize: "20px" }}
                />
              </Popconfirm>
            ) : null
        })
      }
      setCols(newCols);
    }

  }, [rows])

  const handleSubmit = (): IProductImportTemplateRow[] => {
    return rows;
  };

  const getFile = (): File => {
    return file;
  };

  const getCreateCategoriesBoolean = (): boolean => {
    return createCategoriesBoolean;
  };


  const handleDelete = (key) => {
    setRows(rows.filter(item => item.key !== key));
  };

  /**
   * @deprecated
   */
  const handleAdd = () => {
    /*const { count, rows } = state;
    const newData = {
      key: count,
      name: "User's name",
      age: "22",
      gender: "Female"
    };
    setState({
      ...state,
      rows: [newData, ...rows],
      count: count + 1
    });]*/
  };

  const template_id = useWatch({ name: 'product_template_id' });

  useEffect(() => {
    createCategoriesField.field.onChange(false);
    assignDefaultBrand.field.onChange(false);
    assignDefaultCategory.field.onChange(false);
  }, []);

  return (
    <>

      <div>
        <Upload
          name="file"
          beforeUpload={fileHandler}
          onRemove={() => setRows(null)}
          multiple={false}
        >
          <Button>
            <Icons.UploadFile type="upload" /> Subir Excel
          </Button>
        </Upload>
      </div>
      <div style={{ marginTop: 20 }}>


        {cols && rows && rows &&
          <Form >
            <div style={{ marginTop: 20, width: "100%", overflowX: 'auto' }}>
              <Table
                // @BACKLOG agregar edición inline
                /*components={{
                    body: {
                        row: EditableFormRow,
                        cell: EditableCell
                    }
                }}*/
                //rowClassName={() => "editable-row"}
                columns={cols}
                dataSource={rows}
              />
            </div>
          </Form>
        }

      </div>

      <Row gutter={16}>
        <Col span={8} style={{ display: "flex", justifyContent: "space-between" }} >
          {/*rows && rows && rows.length > 0 && ( 
            <>
              // @deprecated, se carga el excel, no se pueden agregar registros inline, a menos que sea import por JSON.
              <Button
                onClick={handleAdd}
                size="large"
                //type="info"
                type="default"
                style={{ marginBottom: 16 }}
              >
                <Icons.Add type="plus" />
              </Button>{" "}
              // @deprecated, el submit se hace desde los botones de pasos
              <Button
                onClick={handleSubmit}
                size="large"
                type="primary"
                style={{ marginBottom: 16, marginLeft: 10 }}
              >
                Confirmar data de importación
            </Button>
            </>
          )*/}
          <section>
            <label>Crear categorías inexistentes en Categoría Principal</label>
            <Switch  {...createCategoriesField.field} />
          </section>

          <section>
            <label>Asignar a marca default, productos que no coincidan con ningun mapeo de marca</label>
            <Switch  {...assignDefaultBrand.field} />
          </section>

          <section>
            <label>Asignar a categoría default</label>
            <Switch  {...assignDefaultCategory.field} />
          </section>

        </Col>
      </Row>
    </>
  );
});


export default ProductImportPreviewForm;