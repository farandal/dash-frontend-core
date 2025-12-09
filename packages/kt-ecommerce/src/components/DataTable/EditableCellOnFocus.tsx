import { Form, FormInstance, Input, InputRef, Table } from "antd";
import React, { useEffect } from "react";
import { useContext, useRef, useState } from "react";


const EditableContext = React.createContext<FormInstance<any> | null>(null);

interface EditableRowProps {
    index: number;
}


export type EditableTableProps = Parameters<typeof Table>[0];

export type ColumnTypes = Exclude<EditableTableProps['columns'], undefined>;


export const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
    const [form] = Form.useForm();
    return (
        <Form form={form} component={false}>
            <EditableContext.Provider value={form}>
                <tr {...props} />
            </EditableContext.Provider>
        </Form>
    );
};


export interface EditableCellOnFocusProps {
    title: React.ReactNode;
    editable: boolean;
    children: React.ReactNode;
    //dataIndex: keyof IMetadataMappingRow;
    //record: IMetadataMappingRow;
    //handleSave: (record: IMetadataMappingRow) => void;
    [x:string] : any
}

const EditableCellOnFocus = <T extends EditableCellOnFocusProps>(props: T) => {

/*const EditableCellOnFocus: React.FC<EditableCellOnFocusProps> = ({
    title,
    editable,
    children,
    dataIndex,
    record,
    handleSave,
    ...restProps
}) => {*/

    const {
        title,
        editable,
        children,
        dataIndex,
        record,
        handleSave,
        ...restProps
    } = props;

    const [editing, setEditing] = useState(false);
    const inputRef = useRef<InputRef>(null);
    const form = useContext(EditableContext)!;

    useEffect(() => {
        if (editing) {
            inputRef.current!.focus();
        }
    }, [editing]);

    const toggleEdit = () => {
        setEditing(!editing);
        form.setFieldsValue({ [dataIndex]: record[dataIndex] });
    };

    const save = async () => {
        try {
            const values = await form.validateFields();

            toggleEdit();
            handleSave({ ...record, ...values });
        } catch (errInfo) {
            console.log('Save failed:', errInfo);
        }
    };

    let childNode = children;

    if (editable) {
        childNode = editing ? (
            <Form.Item
                style={{ margin: 0 }}
                name={dataIndex}
                rules={[
                    {
                        required: true,
                        message: `${title} is required.`,
                    },
                ]}
            >
                <Input ref={inputRef} onPressEnter={save} onBlur={save} />
            </Form.Item>
        ) : (
            <div className="editable-cell-value-wrap" style={{ minWidth: 100, minHeight: 20, marginLeft: 18, marginRight: 18, paddingLeft: 28, paddingRight: 28 }} onClick={toggleEdit}>
                {children}
            </div>
        );
    }

    return <td {...restProps}>{childNode}</td>;
};

export default EditableCellOnFocus;