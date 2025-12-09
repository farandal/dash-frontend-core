import { Form, Input, InputNumber } from "antd";

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
    editing: boolean;
    dataIndex: string;
    title: any;
    inputType: 'number' | 'text';
    record: any; // overwrite this!
    index: number;
    children: React.ReactNode;
    [x:string]: any;
}

const EditableCell = <T extends EditableCellProps>(props: T) => {

/*const EditableCell: React.FC<T> = ({
    editing,
    dataIndex,
    title,
    inputType,
    record,
    index,
    children,
    ...restProps
  }) => {*/

  const {
    editing,
    dataIndex,
    title,
    inputType,
    record,
    index,
    children,
    ...restProps
  } = props;

    const inputNode = inputType === 'number' ? <InputNumber /> : <Input />;
  
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item
            name={dataIndex}
            style={{ margin: 0 }}
            rules={[
              {
                required: true,
                message: `Please Input ${title}!`,
              },
            ]}
          >
            {inputNode}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };

  export default EditableCell;