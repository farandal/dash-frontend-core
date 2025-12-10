import React, { FC, useEffect, useRef, useState } from 'react'
import { Form, Input } from 'antd'
import { useForm } from 'antd/lib/form/Form';
/*
@Deprecated
COMPONENTE EN DESARROLLO 
*/
const EditableContext = React.createContext({});

export const EditableFormRow = ({ ...props }) => {
  
  const [form] = Form.useForm();

  return form ? <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider> : <></>
}

//export const | = Form.create()(EditableRow);
interface IRenderCell {
  dataIndex: number,
  record: any,
  title: string,
  handleSave: any,
  children?: React.ReactNode
}

const RenderCell:FC<IRenderCell> = ({dataIndex, record, title,handleSave,children,...props}) => {

  const [form] = Form.useForm();
  const inputRef = useRef(null);
  const [editing, setEditing] = useState<boolean>(false);

  useEffect(() => {
    if (editing) {
      inputRef.current.focus();
    }
  }, [editing, inputRef])

  const toggleEdit = () => {

    setEditing(!editing);
  }
   
  const save = (e, _form) => {
   
    _form.validateFields((error, values) => {

      if (error && error[e.currentTarget.id]) {
        return;
      }
      toggleEdit();
      handleSave({ ...record, ...values });
    });
  };

  console.log("rendering cell", form, props);
  return editing ? (
    <Form.Item style={{ margin: 0 }}>
        { /* @ts-ignore */}
      {form.getFieldDecorator(dataIndex, {
        rules: [
          {
            required: true,
            message: `${title} is required.`,
          },
        ],
        initialValue: record[dataIndex],
      })(<Input ref={inputRef} onPressEnter={(e) => save(e, form)} onBlur={(e) => save(e, form)} />)}
    </Form.Item>
  ) : (
    <div
      className="editable-cell-value-wrap"
      style={{ paddingRight: 24, minHeight: 32 }}
      onClick={toggleEdit}
    >
     {children} 
    </div>
  );
};

export interface IEditableCell {
  editable: boolean,
  dataIndex: number,
  title: string,
  record: any,
  index: number,
  handleSave: any,
  children: React.ReactNode
  [x:string]: any
}
export const EditableCell:FC<IEditableCell> = ({ ...props }) => {

  const {
    editable,
    dataIndex,
    title,
    record,
    index,
    handleSave,
    children,
    ...rest
  } = props;

  return (
    <td {...rest}>
      {editable ? (
        <RenderCell dataIndex={dataIndex} record={record} title={title} handleSave={handleSave} />
      ) : (
        children
      )}
    </td>
  );
  
}
