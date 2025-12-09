// in posts.js
import * as Icons from '@mui/icons-material';
import { useGetList } from 'react-admin';
import { FC, useCallback, useEffect, useRef, useState } from "react";
import React from 'react';
import { Col, InputNumber, Row, Select, Space } from "antd";
import { Table, Upload } from "antd";
import { ExcelRenderer } from "react-excel-renderer";
import { ColumnType } from "antd/lib/table";
//import { DataIndex } from "rc-table/lib/interface";
import { ColumnsType } from "antd/lib/table/interface";
import { useNavigate, useParams } from "react-router";
import { Box, Button, Paper, TextField } from '@mui/material';
import { useController } from 'react-hook-form';
import { RcFile } from 'antd/lib/upload';
import { SimpleForm, Form } from 'react-admin';
import { Toolbar } from 'react-admin';
import { SaveButton } from 'react-admin';
import { useNotify } from 'react-admin';
import { useUpdate } from 'react-admin';
import { useCreate } from 'react-admin';

import { useResourceContext } from 'react-admin';
import { useRecordContext } from 'react-admin';
import { useRefresh } from 'react-admin';
import { Link } from 'react-router-dom';
import { DASHAdminSystemConstants } from 'dash-constants';
import { useDialog } from 'dash-dialog';


const { Option } = Select;
const { Dragger } = Upload;

const MAX_COLS = 60;
const DEFAULT_SKIP_ROWS = 5;

export interface IAssociateProductsRow {
    name: string
    key: string
    title: string
    dataIndex: number
}

export interface ISelectedColumn {
    attribute: string
    dataIndex: string | number
    editable: boolean
}


const AssociateProductsForm: FC = ({ ...props }) => {

    const skipHeadersField = useController({ name: 'skip_headers' });
    const fileField = useController({ name: 'products_file' });


    const dragAndDropText = "Haga click aquí o arrastre el archivo aquí"
    const dragAndDropHint = "Se permiten sólo archivos XLS"

    //const contentRef = useRef(null);

    const [cols, setCols] = useState<ColumnsType<IAssociateProductsRow>>(null);
    const [rows, setRows] = useState<IAssociateProductsRow[]>(null);

    const [errorMessage, setErrorMessage] = useState<string>(
        null
    );


    const fileHandler = (file: RcFile, fileList: RcFile[], skipRows: number) => {

        console.log("fileList", fileList);
        let fileObj = file;
        if (!fileObj) {
            setErrorMessage("No file uploaded!");
            return false;
        }
        console.log("fileObj.type:", fileObj.type);
        if (
            !(
                fileObj.type === "application/vnd.ms-excel" ||
                fileObj.type ===
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            )
        ) {
            setErrorMessage("Unknown file format. Only Excel files are uploaded!");
            return false;
        }
        //just pass the fileObj as parameter
        ExcelRenderer(fileObj, (err, resp) => {
            if (err) {

                console.log(err);

            } else {

                let newRows = [];

                resp.rows.slice(skipRows).map((row, index) => {
                    if (row && row !== "undefined") {
                        newRows.push({
                            key: index,
                            ...row
                        });
                    }
                });

                let slice = resp.cols.length < MAX_COLS ? resp.cols.length : MAX_COLS;
                let newCols: ColumnsType<IAssociateProductsRow> = [];
                resp.cols.slice(0, slice).map((col, index) => {
                    if (col && col !== "undefined") {
                        newCols.push({
                            ...col,
                            title: col.name,
                            dataIndex: col.key
                        });
                    }
                });

                if (newRows.length === 0) {

                    setErrorMessage("No data found in file!");
                    return false;

                } else {

                    //const [pcols,prows] = addTemplateInputs(newCols,newRows);
                    setCols(addTemplateCols(newCols));
                    setRows(addTemplateRows(newRows));
                    setErrorMessage(null);

                }
            }
        });
        return false;
    };

    const addTemplateCols = (c: ColumnsType<IAssociateProductsRow>): ColumnsType<IAssociateProductsRow> => {
        return c.map(col => {
            //col = { ...col, ...getColumnSearchProps(col.key) };
            return col;
        });
    }

    const addTemplateRows = (r: IAssociateProductsRow[]): IAssociateProductsRow[] => {
        return [...r];
    }

    /*const handleSubmit = async () => {
        console.log("submitting: ", rows);

        //submit to API
        //if successful, banigate and clear the data
        //setState({ ...state, rows: [] })
    };*/

    /*const handleDelete = key => {
        setRows(rows.filter(item => item.key !== key));
    };*/
   

   return <>
   
   <Button target="_blank" href={`${DASHAdminSystemConstants.system.API_URL}/actualiza_productos_campaña_ejemplo.xls`} type='button'>Descargar Excel Ejemplo</Button>
   
   <TextField
    label={'Cantidad de filas de cabecera a saltar en la lectura de productos'}
    fullWidth
    inputProps={{ type: 'number', max: 100, min: 0, inputMode: 'numeric', pattern: '[0-9]*' }}
    {...skipHeadersField.field}
    defaultValue={0}
/>


<div className='template-import-form-dragndrop'>
    <Dragger

        {...fileField.field}
        beforeUpload={(file: RcFile, fileList: RcFile[]) => fileHandler(file, fileList, skipHeadersField.field.value)}
        onRemove={() => setRows(null)}
        multiple={false}
        maxCount={1}
    >
        <p className="ant-upload-drag-icon">
            <Icons.AddBox fontSize={'large'} />
        </p>
        <p className="ant-upload-text">{dragAndDropText}</p>
        <p className="ant-upload-hint">{dragAndDropHint}</p>
    </Dragger>
</div>


{cols && rows &&

    <div style={{ marginTop: 20, width: "100%", overflowX: 'auto' }}>
        <Table
            dataSource={rows}
            columns={cols}
            /*pagination={{
                pageSize: 100, // Number of rows per page
                showSizeChanger: true, // Allow changing the page size
                pageSizeOptions: ['10', '20', '50', '100'], // Available page sizes
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`, // Show total count
                position: ['bottomRight'], // Position of the pagination controls
                // You can add more pagination props as needed
            }}*/
        />
    </div>

}
</>
}


const AssociateProducts: FC = ({ ...props }) => {

    //const formRef = React.useRef();
    //const skipHeadersRef = React.useRef<number>(DEFAULT_SKIP_ROWS);

    const notify = useNotify();
    const [create] = useCreate();
    const [update] = useUpdate();
    const refresh = useRefresh();
    const dialog = useDialog();
    const resourceName = "campaign";
    const resource = useResourceContext({resource:resourceName});
    const record = useRecordContext();
    const { id } = useParams();

    const onSubmit = async (data) => {
       
        const object = {
            skip_headers: data.skip_headers,
            products_file: data.products_file.file,
            isFormData: true
        }

        try {
           
            await update(
                `campaign/${id}/products/import`, //????
                {
                   id: id, data: object, meta: {method: "POST"}
                },
                {
                    onSuccess: () => { notify('Datos de producto actualizados.') },
                    onError: (error:any) => {
                        console.log(error);
                        notify(`Error al guardar los datos del producto. ${error?.body?.message || ''} ${error?.message || ''}`)
                    },
                    returnPromise: true
                }
            )
        } catch (error) {
            console.error(error);
        } finally {
            refresh();
        }
    };

    const validateFn = (values) => {
        const errors = {};
        return errors
    };


    const CustomToolbar = (props) => {
        return (
            <Toolbar {...props} >
                <SaveButton alwaysEnable={true} />
            </Toolbar>
        )
    };

    return (
        <SimpleForm toolbar={<CustomToolbar/>} onSubmit={onSubmit}  >
           <AssociateProductsForm/>
        </SimpleForm>
    );
};


export default AssociateProducts;
