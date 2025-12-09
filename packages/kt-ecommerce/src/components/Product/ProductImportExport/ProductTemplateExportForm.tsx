import * as Icons from '@mui/icons-material';
import { useGetList } from 'react-admin';
import { FC, useEffect, useState } from "react";
//import { Select } from "antd";
import { ISelectedExportColumn } from "./Interfaces";
import { Autocomplete, Button, Chip, TextField } from '@mui/material';
import { useController, useFormContext } from 'react-hook-form';
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
//import { Button } from 'react-admin';
import { Loading } from 'react-admin';
import { useRecordContext } from 'react-admin';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import React from 'react';


//const { Option } = Select;


const processMenuItems = (ele, selectedkeysArray) => {
  return selectedkeysArray.find(sk => sk.key === ele.attribute) ? {
    ...ele,
    key: ele.id,
    className: "disabled",
    name: ele.name,
    label: ele.name
  }
    : {
      ...ele,
      key: ele.id,
      className: "enabled",
      name: ele.name,
      label: ele.name
    }
}

const processMenuItemsFromRecord = (columns) => {
  return columns.map(col => {
    return {
      ...col,
      key: col.id,
      className: "enabled",
      name: col.name,
      label: col.name
    }
  })
}


const ProductTemplateExportForm: FC<IDashAutoAdminCustomFieldComponent> = ({ method, ...props }) => {

  const record = useRecordContext();
  const resource = "ecommerce/product_template";

  const { setValue } = useFormContext();

  const selectedColumnsField = useController({ name: 'selectedColumns' });

  const { data: availableTemplateColumns, isLoading: availableTemplateColumnsLoading, error: availableTemplateError } = useGetList(
    resource + "/availableProductColumns",
    {
      pagination: { page: 1, perPage: 1000 }
    },
    { refetchOnWindowFocus: false }
  );

  const [globalMenuItems, setGlobalMenuItems] = useState([]);
  const [globalSelectedColumns, setGlobalSelectedColumns] = useState([]);

  useEffect(() => {
    if (record && record.productTemplateColumns) {
      setGlobalSelectedColumns(processMenuItemsFromRecord(record.productTemplateColumns));
    }
  }, [record])

  useEffect(() => {
    setValue("selectedColumns", globalSelectedColumns);
  }, [globalSelectedColumns])

  useEffect(() => {
    if (availableTemplateColumns && !availableTemplateColumnsLoading) {
      let menuItems = availableTemplateColumns.map((ele) => {
        return {
          ...ele,
          className: "enabled",
          key: ele.id,
          name: ele.name,
          label: ele.name,
        }
      }
      );
      setGlobalMenuItems(menuItems);
    }
  }, [availableTemplateColumns, availableTemplateColumnsLoading])

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const reordered = reorder(
      globalSelectedColumns,
      result.source.index,
      result.destination.index
    );

    setGlobalSelectedColumns(reordered)

  }

  const onClickDelete = (ele) => {
    console.log('element', ele)
    console.log(globalSelectedColumns.filter(item => item.key !== ele.key))
    setGlobalSelectedColumns(globalSelectedColumns.filter(item => item.key !== ele.key))
  }

  const [dropabelID, setDropabelID] = useState('dropabel');
  const [draggabelID, setDraggabelID] = useState('dragabel');

  useEffect(() => {
    setDropabelID('eldroppabel')
    setDropabelID('eldraggabel')
  }, [])

  const DropDownMenu = ({ ...props }) => {

    const removeOption = (ele) => {

      let newSelectedColumns = [...globalSelectedColumns];
      let selectedkeysArray = newSelectedColumns

      let menuItems = availableTemplateColumns.map((ele) => {
        return processMenuItems(ele, selectedkeysArray)
      })
      setGlobalMenuItems(menuItems);
      return;
    }

    const selectTemplateColumn = (value) => {
      let selectedColumn: any = value;

      let newSelectedColumns = [...globalSelectedColumns]
      if (!globalSelectedColumns.find(item => item.attribute === selectedColumn.attribute)) {
        newSelectedColumns = [...globalSelectedColumns, selectedColumn]
      }

      setGlobalSelectedColumns(newSelectedColumns);

      let selectedkeysArray = newSelectedColumns

      let menuItems = availableTemplateColumns.map((ele) => {
        return processMenuItems(ele, selectedkeysArray);
      })
      setGlobalMenuItems(menuItems);
    };

    const deselectTemplateColumn = () => {
      let newSelectedColumns = [...globalSelectedColumns];
      setGlobalSelectedColumns(newSelectedColumns);
      let selectedkeysArray = newSelectedColumns
      let menuItems = availableTemplateColumns.map((ele) => {
        return processMenuItems(ele, selectedkeysArray)
      })
      setGlobalMenuItems(menuItems);
    }

    let remove: any = { className: 'enabled', key: 'remove', label: <><Icons.Delete /> Remover</>, danger: true, icon: <Icons.Delete /> };

    const agregarTodas = () => {

      let newSelectedColumns = [...globalSelectedColumns]
      console.log(globalMenuItems)
      globalMenuItems.forEach(item => {
        let selectedColumn: ISelectedExportColumn = {
          ...item,
          className: "enabled",
          key: item.id,
          name: item.name,
          label: item.name,
        }
        console.log('found', selectedColumn)
        if (!globalSelectedColumns.find(item => item.attribute === selectedColumn.attribute)) {
          newSelectedColumns.push(selectedColumn)
        }
      })

      setGlobalSelectedColumns(newSelectedColumns);

      let selectedkeysArray = newSelectedColumns

      let menuItems = availableTemplateColumns.map((ele) => {
        return processMenuItems(ele, selectedkeysArray);
      })
      setGlobalMenuItems(menuItems);

    }

    const select_ops = [...globalMenuItems.map((ele) => {
      return { id: ele.id, label: ele.label, ...ele }
    })];


    return <>

      <Button type='button' onClick={agregarTodas}><>Agregar todas las columnas</></Button>

      <Autocomplete
        fullWidth
        disablePortal
        options={select_ops}
        sx={{ width: 300 }}
        renderInput={(params) => <TextField {...params} label="Columnas" />}
        disableClearable={true}
        onChange={(event, newValue) => selectTemplateColumn(newValue)}
      />

    </>

  }

  if (availableTemplateColumnsLoading) return <Loading />
  return <>

    <DropDownMenu />

    {globalSelectedColumns && <>

      <div style={{ marginTop: 20, width: "100%", overflowX: 'auto' }}>
        <ul
          style={{ listStyleType: "'☰'" }}
        >
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId={dropabelID}>
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {globalSelectedColumns.map((item, index) => (


                    <Draggable key={item.attribute} draggableId={draggabelID + item.attribute} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <li>

                            <Chip
                              avatar={<Icons.Delete onClick={() => onClickDelete(item)} />}
                              label={item.label}
                              variant="outlined"
                            /></li>
                        </div>
                      )}
                    </Draggable>

                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </ul>
      </div></>}

  </>

}


export default ProductTemplateExportForm;
