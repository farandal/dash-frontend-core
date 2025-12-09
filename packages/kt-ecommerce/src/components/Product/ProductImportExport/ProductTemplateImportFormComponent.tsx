import { ExcelRenderer } from "react-excel-renderer";
import { Select, Space } from "antd";
import { Table, Upload } from "antd";
import { ColumnType } from "antd/lib/table";
import { ColumnsType } from "antd/lib/table/interface";
import { RcFile } from "antd/lib/upload";
import { getCookie } from "dash-admin/src/utils/cookies";
import { IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";
import React, { FC, useState, useEffect, memo, useRef } from "react";
import { useRecordContext, useGetList } from "react-admin";
import { useFormContext, useController } from "react-hook-form";

import { IProductImportTemplateRow, ISelectedColumn } from "./Interfaces";
import { TextField } from "@mui/material";
import { dashStorage } from "dash-utils";

const { Option } = Select;
const { Dragger } = Upload;

const MAX_COLS = 60;
const DEFAULT_SKIP_ROWS = 0;

const processMenuItems = (ele, selectedkeysArray) => {
  return selectedkeysArray.find((sk) => sk.key === ele.attribute)
    ? {
      ...ele,
      key: ele.id,
      className: "disabled",
      name: ele.name,
      label: ele.name,
    }
    : {
      ...ele,
      key: ele.id,
      className: "enabled",
      name: ele.name,
      label: ele.name,
    };
};

/*const processMenuItemsFromRecord = (columns) => {
    return columns.map(col => {
        return {
            ...col,
            key: col.id,
            className: "enabled",
            name: col.name,
            label: col.name
        }
    })
}*/

const ProductTemplateImportFormComponent: FC<IDashAutoAdminCustomFieldComponent> = ({
  ...props
}) => {
  //const formRef = React.useRef();
  //const skipHeadersRef = React.useRef<number>(DEFAULT_SKIP_ROWS);

  const dragAndDropText = "Haga click aquí o arrastre el archivo aquí";
  const dragAndDropHint = "Se permiten sólo archivox XLS";

  const resource = "ecommerce/product_template";

  const record = useRecordContext();
  const { setValue, getValues, register, watch } = useFormContext();


  /*
  register("availableTemplateColumns");
  register("name");
  register("selectedColumns");
  register("previewRows");
  register("previewCols");
  */
  // Register the field explicitly
  useEffect(() => {
    register("availableTemplateColumns");
  }, [register]);
  const globalAvailableTemplateColumsRef = useRef(null);

  const {
    data: availableTemplateColumns,
    isLoading: availableTemplateColumnsLoading,
    error: availableTemplateError,
  } = useGetList(
    resource + "/availableProductColumns",
    {
      //pagination: false,
    },
    { refetchOnWindowFocus: false }
  );

  /*const [globalSkipHeaders, setGlobalSkipHeaders] = useStore("skipRows", DEFAULT_SKIP_ROWS);
  const [globalMenuItems, setGlobalMenuItems] = useStore("menuItems", []);
  const [globalSelectedColumns, setGlobalSelectedColumns] = useStore("selectedColumns", []);
  const [globalAvailableTemplateColums, setGlobalAvailableTemplateColumns] = useStore("availableTemplateColumns", []);*/

  const [globalSkipHeaders, setGlobalSkipHeaders] =
    useState(DEFAULT_SKIP_ROWS);
  const [globalMenuItems, setGlobalMenuItems] = useState([]);
  const [globalSelectedColumns, setGlobalSelectedColumns] = useState([]);
  const [globalAvailableTemplateColums, setGlobalAvailableTemplateColumns] =
    useState([]);

  const skipHeadersChange = (value: number) => {
    setGlobalSkipHeaders(value);
  };

  const [cols, setCols] =
    useState<ColumnsType<IProductImportTemplateRow>>(null);
  const [rows, setRows] = useState<IProductImportTemplateRow[]>(null);

  useEffect(() => {
    if (record && record.productTemplateColumns) {
      setGlobalSkipHeaders(record.skip_rows);
      skipHeadersField.field.onChange(record.skip_rows);
      setGlobalSelectedColumns(
        record.productTemplateColumns.map((ele) => {
          return { ...ele, dataIndex: ele.data_index };
        })
      );

      setCols(addTemplateCols(record.preview_cols));
      setRows(record.preview_rows);
    }
  }, [record]);

  const [errorMessage, setErrorMessage] = useState<string>(null);

  /*const handleSave = row => {
      const newData = [...rows];
      const index = newData.findIndex(item => row.key === item.key);
      const item = newData[index];
      newData.splice(index, 1, {
          ...item,
          ...row
      });
      setRows(newData)
  };*/

  /*const checkFile = (file) => {
      let errorMessage = "";
      if (!file || !file[0]) {
          return;
      }
      const isExcel =
          file[0].type === "application/vnd.ms-excel" ||
          file[0].type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      if (!isExcel) {
          errorMessage = "You can only upload Excel file!";
      }
      console.log("file", file[0].type);
      const isLt2M = file[0].size / 1024 / 1024 < 2;
      if (!isLt2M) {
          errorMessage = "File must be smaller than 2MB!";
      }
      console.log("errorMessage", errorMessage);
      return errorMessage;
  }*/

  const fileHandler = (
    file: RcFile,
    fileList: RcFile[],
    skipRows: number
  ) => {
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
      setErrorMessage(
        "Unknown file format. Only Excel files are uploaded!"
      );
      return false;
    }
    //just pass the fileObj as parameter
    ExcelRenderer(fileObj, (err, resp) => {
      if (err) {
        console.error(err);
      } else {
        let newRows = [];

        resp.rows /*.slice(skipRows)*/
          .map((row, index) => {
            if (row && row !== "undefined") {
              newRows.push({
                key: index,
                ...row,
              });
            }
          });

        let slice =
          resp.cols.length < MAX_COLS ? resp.cols.length : MAX_COLS;
        let newCols: ColumnsType<IProductImportTemplateRow> = [];
        resp.cols.slice(0, slice).map((col, index) => {
          if (col && col !== "undefined") {
            newCols.push({
              ...col,
              title: col.name,
              dataIndex: col.key,
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

  useEffect(() => {
    // this will re render the colums when the selected columsn are updated, this is required to update the selected columns in the Memoized component.
    if (cols) {
      setCols(addTemplateCols(cols));
    }
  }, [globalSelectedColumns]);

  useEffect(() => {
    if (availableTemplateColumns && !availableTemplateColumnsLoading) {
      let menuItems = availableTemplateColumns.map((ele) => {
        return {
          className: "enabled",
          key: ele.id,
          label: ele.name,
          icon: "FilterCenterFocusOutlined" /*<Icons.FilterCenterFocusOutlined fontSize="small" />*/,
        };
      });
      setGlobalMenuItems(menuItems);

      setGlobalAvailableTemplateColumns(availableTemplateColumns);
      globalAvailableTemplateColumsRef.current = availableTemplateColumns;

      setValue("availableTemplateColumns", availableTemplateColumns);

      //menuItemsRef.current = menuItems;
    }
  }, [availableTemplateColumns, availableTemplateColumnsLoading]);

  const selectTemplateColumn = (value, dataIndex) => {
    // console.log("globalSelectedColumns",globalSelectedColumns);
    // console.log("globalAvailableTemplateColums",globalAvailableTemplateColums);

    if (value === "remove") {
      let newSelectedColumns = [
        ...globalSelectedColumns.filter(
          (ele) => ele.dataIndex !== dataIndex
        ),
      ];
      setGlobalSelectedColumns(newSelectedColumns);
      let selectedkeysArray = newSelectedColumns.map((ele) => {
        return ele.attribute;
      });

      let menuItems = globalAvailableTemplateColums.map((ele) => {
        return processMenuItems(ele, selectedkeysArray);
      });

      setGlobalMenuItems(menuItems);
      return;
    }

    let option = globalAvailableTemplateColums.find(
      (ele) => ele.id === value
    );

    let selectedColumn: ISelectedColumn = {
      attribute: value,
      option,
      dataIndex: dataIndex,
      editable: true, // TODO
    };

    let newSelectedColumns = [
      ...globalSelectedColumns.filter(
        (ele) => ele.dataIndex !== dataIndex
      ),
      selectedColumn,
    ];
    setGlobalSelectedColumns(newSelectedColumns);
    let selectedkeysArray = newSelectedColumns.map((ele) => {
      return ele.attribute;
    });

    let menuItems = globalAvailableTemplateColums.map((ele) => {
      return processMenuItems(ele, selectedkeysArray);
    });

    setGlobalMenuItems(menuItems);
  };

  const deselectTemplateColumn = (dataIndex) => {
    let newSelectedColumns = [
      ...globalSelectedColumns.filter(
        (ele) => ele.dataIndex !== dataIndex
      ),
    ];
    setGlobalSelectedColumns(newSelectedColumns);
    let selectedkeysArray = newSelectedColumns.map((ele) => {
      return ele.attribute;
    });

    let menuItems = globalAvailableTemplateColums.map((ele) => {
      return processMenuItems(ele, selectedkeysArray);
    });

    setGlobalMenuItems(menuItems);
  };

  const DropDownMenu = ({ dataIndex, selectedColumns, ...props }) => {
    //const [globalSkipHeaders, setGlobalSkipHeaders] = useStore("skipRows", DEFAULT_SKIP_ROWS);
    /*const [globalMenuItems, setGlobalMenuItems] = useStore("menuItems", []);
const [globalSelectedColumns, setGlobalSelectedColumns] = useStore("selectedColumns", []);
const [globalAvailableTemplateColums, setGlobalAvailableTemplateColumns] = useStore("availableTemplateColumns", []);*/

    const findSelectDefaultValue =
      selectedColumns.find((ele) => ele.dataIndex === dataIndex) || null;
    const defaultValue = findSelectDefaultValue?.attribute || null;

    let remove: any = {
      className: "enabled",
      key: "remove",
      label: (
        <>
          Delete
        </>
      ),
      danger: true,
      icon: <>[x]</>,
    };

    const select_ops = [
      ...globalMenuItems.map((ele) => {
        return (
          <Option
            disabled={ele.className === "disabled" ? true : false}
            key={ele.key}
            value={ele.id}
            label={ele.label}
          >
            {ele.className === "disabled" ? (
              <>
                <>[-]</>{" "}
                {ele.label}
              </>
            ) : (
              <>
                <>[o]</>{" "}
                {ele.label}
              </>
            )}
          </Option>
        );
      }),
    ];

    return (
      <Select
        key={`select-${dataIndex}`}
        showSearch
        allowClear={true}
        defaultOpen={true}
        style={{ width: 500 }}
        defaultValue={defaultValue}
        onSelect={(val) => {
          selectTemplateColumn(val, dataIndex);
        }}
        onClear={() => {
          deselectTemplateColumn(dataIndex);
        }}
        filterOption={(input, option) => {
          return ((option?.label || option?.key) as string)
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .includes(
              input
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
            );
        }}
      >
        {select_ops}
      </Select>
    );
  };

  const dropDownPropsAreEqual = (oldProps, newProps) => {
    return oldProps.selectedColumns === newProps.selectedColumns;
  };

  const MemoizedDropDownMenu = memo(DropDownMenu, dropDownPropsAreEqual);

  const getColumnSearchProps = (
    dataIndex
  ): ColumnType<IProductImportTemplateRow> => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => {
      return (
        <div style={{ padding: 8 }}>
          <Space>
            {/*dataIndex*/}
            <MemoizedDropDownMenu
              selectedColumns={globalSelectedColumns}
              dataIndex={dataIndex}
            />
          </Space>
        </div>
      );
    },
    filterIcon: (filtered: boolean) => <div style={{ color: filtered ? "#1890ff" : undefined }}>⚙</div>,
    onFilter: (value, record) => { return false; },
  });

  const addTemplateCols = (
    c: ColumnsType<IProductImportTemplateRow>
  ): ColumnsType<IProductImportTemplateRow> => {
    if (!c) return [];
    return c.map((col) => {
      col = { ...col, ...getColumnSearchProps(col.key) };
      return col;
    });
  };

  const addTemplateRows = (
    r: IProductImportTemplateRow[]
  ): IProductImportTemplateRow[] => {
    return [...r];
  };

  const tenant_id = dashStorage.getItem('tenant_id');
  const skipHeadersField = useController({ name: "skipHeaders" });
  const fileField = useController({ name: "fileField" });

  /*
   const tenantIdField = useController({
     name: "tenant_id",
     defaultValue: tenant_id,
   });
 
   const name = useController({ name: "name" });
 
   const selectedColumnsField = useController({
     name: "selectedColumns" //defaultValue:globalSelectedColumns,
   });
   const availableColumnsField = useController({
     name: "availableTemplateColumns" //defaultValue:globalAvailableTemplateColums
   });
   const previewRows = useController({
     name: "previewRows" //defaultValue:globalAvailableTemplateColums
   });
   const previewCols = useController({
     name: "previewCols" //defaultValue:globalAvailableTemplateColums
   });
 */


  useEffect(() => {
    setValue("selectedColumns", globalSelectedColumns);
  }, [globalSelectedColumns]);


  useEffect(() => {
    setValue("skipHeaders", globalSkipHeaders);
  }, [globalSkipHeaders]);

  useEffect(() => {
    if (rows && cols) {
      //previewRows.field.onChange(rows.slice(0, 50));
      setValue("previewRows", rows.slice(0, 50));
      setValue("previewCols", cols);
      //previewCols.field.onChange(cols);
    }
  }, [rows, cols]);



  useEffect(() => {
    const subscription = watch((value, { name, type }) => {

      if (type) {
        console.log('Form value changed:', value);
        console.log('Changed field:', name);
        console.log('Type of change:', type);

        // Ensure availableTemplateColumns is always set
        //if (name && name !== 'availableTemplateColumns' && globalAvailableTemplateColums) {

        setValue('availableTemplateColumns', globalAvailableTemplateColumsRef.current);
      }
      //}
    });

    // Clean up subscription
    return () => subscription.unsubscribe();
  }, [watch, setValue, globalAvailableTemplateColumsRef.current]);



  return (
    <>

      <TextField
        label={
          "Cantidad de filas de cabecera a saltar en la lectura de productos"
        }

        slotProps={{
          htmlInput: {
            type: "number",
            max: 100,
            min: 0,
            inputMode: "numeric",
            pattern: "[0-9]*",
          }
        }}


        //onChange={(e) => skipHeadersChange(parseInt((e.target as HTMLInputElement).value))}
        {...skipHeadersField.field}
        // Ensure value is always defined
        value={skipHeadersField.field.value || null}
        onChange={(e) => {
          const value = parseInt(e.target.value) || null;
          skipHeadersChange(value);
          skipHeadersField.field.onChange(value);
        }}
      //defaultValue={globalSkipHeaders}
      />

      <div className="template-import-form-dragndrop">
        <Dragger
          {...fileField.field}
          beforeUpload={(file: RcFile, fileList: RcFile[]) =>
            fileHandler(file, fileList, globalSkipHeaders)
          }
          onRemove={() => setRows(null)}
          multiple={false}
          maxCount={1}
        >
          <p className="ant-upload-drag-icon">📎</p>
          <p className="ant-upload-text">{dragAndDropText}</p>
          <p className="ant-upload-hint">{dragAndDropHint}</p>
        </Dragger>
      </div>

      {globalSelectedColumns && (
        <div
          style={{ marginTop: 20, width: "100%", overflowX: "auto" }}
        >
          <ul>
            {globalSelectedColumns.map((ele) => {
              return (
                <li>
                  El atributo{" "}
                  {ele.option?.name || ele.attribute} de
                  productos, será mapeado con la columna{" "}
                  {ele.dataIndex} de la fuente de datos
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {cols && rows && (
        <div
          style={{ marginTop: 20, width: "100%", overflowX: "auto" }}
        >
          <Table dataSource={rows} columns={cols} />
        </div>
      )}


    </>
  );
};

export default ProductTemplateImportFormComponent;
