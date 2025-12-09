import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';;
import React, { useEffect, useState } from 'react'
import { useRecordContext } from "react-admin";

import { FileInput } from 'react-admin';
import { Confirm } from 'react-admin';
import { FileField } from 'react-admin';

import Table, { ColumnsType } from 'antd/lib/table';
import { ExcelRenderer } from "react-excel-renderer";
import { useWatch } from 'react-hook-form';
import { IProductTemplateColumn, Product } from '../interfaces/Product';
import { IProductImportTemplateRow } from '../Product/ProductImportExport/Interfaces';
import { Alert, Typography } from '@mui/material';

const deleteText = "¿Está seguro de eliminar este registro?"
const onlyExcel = "You can only upload Excel file!"
const maxSizeMessage = "File must be smaller than 2MB!"
const maxSize = 5; //MB
const noFileMessage = "No file uploaded!"
const unknownFileTypeMessage = "Unknown file format. Only Excel files are uploaded!"
const noDataMessage = "No data found in file!"
const defaultExcelRendererError = "Error reading excel File"

const ExcelUploadAndPreviewEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {

  const [removeFile, setRemoveFile] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [cols, setCols] = useState<ColumnsType<IProductImportTemplateRow>>(null);
  const [rows, setRows] = useState<IProductImportTemplateRow[]>(null);
  const [file, setFile] = useState<File>();

  const selectedTemplate = useWatch({ name: 'product_template' });
  const importType = useWatch({ name: 'import_type', defaultValue: 'normalized' });

  const addTemplateRows = (r: IProductImportTemplateRow[]): IProductImportTemplateRow[] => {
    return [...r];
  }

  const [errorMessage, setErrorMessage] = useState<string>(null);

  const fileHandler = fileList => {

    let fileObj = fileList[0];
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
        // For normalized imports, use first row as headers, skip template-specific logic
        const skipRows = importType === 'normalized' ? 1 : (selectedTemplate?.skip_rows || 5);
        
        resp.rows.slice(skipRows).map((row, index) => {
          if (row && row !== "undefined") {
            newRows.push({
              key: index,
              ...row
            });
          }
        });

        if (newRows.length === 0) {
          setErrorMessage(noDataMessage);
          return false;
        } else {
          setRows(addTemplateRows(newRows));
          setErrorMessage(null);
        }
      }
    });
    return false;
  };

  useEffect(() => {
    if (importType === 'normalized' && rows && rows.length) {
      // For normalized imports, create basic columns from the first few cells
      // This is a simplified preview - the actual import will handle the full normalized format
      const normalizedCols = [
        { title: 'SKU', dataIndex: 0, editable: false },
        { title: 'Name', dataIndex: 1, editable: false },
        { title: 'Description', dataIndex: 2, editable: false },
        { title: 'Price', dataIndex: 3, editable: false },
        { title: 'Stock', dataIndex: 4, editable: false },
        { title: '...', dataIndex: 5, editable: false },
      ];
      setCols(normalizedCols);
    } else if (selectedTemplate && rows && rows.length) {
      // Template-based column mapping
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
      setCols(newCols);
    }
  }, [rows, selectedTemplate, importType])

  const canShowPreview = importType === 'normalized' || selectedTemplate;

  return (
    <>
      {!canShowPreview && importType === 'template' && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Debe seleccionar una plantilla antes de subir el archivo
        </Alert>
      )}

      {importType === 'normalized' && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Formato Normalizado:</strong> Su archivo debe seguir el formato estándar con columnas como: 
            sku, name, description, price_*, stock_*, category_name, brand_name, images, etc.
          </Typography>
        </Alert>
      )}

      <FileInput
        options={{ onDropAccepted: fileHandler, multiple: false }}
        source={attribute.attribute}
        label={attribute.label}
        {...attribute.componentProps}
        validateFileRemoval={(file, _record) => {
          const promise = new Promise((_resolve, reject) => {
            setRemoveFile({
              fileName: `File ID: ${file?.rawFile?.title}`,
              delete: async (result) => {
                setRows(null);
                return _resolve(result);
              },
              cancel: reject,
            });
          });
          setShowModal(true);
          return promise.then((result) => {
            console.log('Archivo eliminado!');
          });
        }}
      >
        <FileField source="src" title="title" />
      </FileInput>

      <Confirm
        isOpen={showModal}
        title="Eliminar archivo"
        content={`${removeFile?.rawFile?.title ?? ''} será eliminado`}
        onConfirm={() => {
          setShowModal(false);
          removeFile && removeFile.delete();
        }}
        onClose={() => {
          setShowModal(false);
          removeFile && removeFile.cancel();
        }}
      />

      {cols && rows && rows && (
        <div style={{ marginTop: 20, width: "100%", overflowX: 'auto' }}>
          <Table
            columns={cols}
            dataSource={rows}
            pagination={{ pageSize: 10 }}
            scroll={{ x: true }}
          />
        </div>
      )}

      {errorMessage && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {errorMessage}
        </Alert>
      )}
    </>
  )
}

const ExcelUploadAndPreviewView: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {
  const product: Product = useRecordContext();
  return (
    <></>
  )
}

const ExcelUploadAndPreview = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
  switch (method) {
    case "edit":
    case "create":
      return <ExcelUploadAndPreviewEdit attribute={attribute} method={method} resourceConfig={resourceConfig} />
    case "view":
      return <ExcelUploadAndPreviewView attribute={attribute} method={method} resourceConfig={resourceConfig} />
    case "list":
      return <ExcelUploadAndPreviewView attribute={attribute} method={method} resourceConfig={resourceConfig} />
  }
}

export default ExcelUploadAndPreview;