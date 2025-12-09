
import DictionaryContext from "dash-admin/src/contexts/dictionary/DictionaryContext";
import React, { FC } from "react";

export interface ISimpleAntAttrTable {
    tableData: any;
    ignore?: string[]
    include?: string[]
}

const NotificationAttributesTable: FC<ISimpleAntAttrTable> = ({ tableData, ignore, include }) => {

    const DICT = React.useContext(DictionaryContext);

    if (!ignore) ignore = [];
    if (!include) include = [];

    let column = tableData ? Object.keys(tableData) : [];
    if (include.length) column = column.filter(key => include.includes(key))
    if (ignore.length) column = column.filter(key => !ignore.includes(key))

    const tdData = () => {
      
        return column.map((attr) => (
            <tr key={attr}>
                <td>{DICT.get(attr)}</td>
                <td>{typeof tableData[attr] !== 'object' ? DICT.get(tableData[attr]) : tableData[attr]}</td>
            </tr>
        ))
    }

    return (
        <table className='table'>
            {/*<thead>
                <tr>
                    <th>Campo</th>
                    <th>Valor</th>
                </tr>
            </thead>*/}
            <tbody>{tdData()}</tbody>
        </table>
    );
};
export default NotificationAttributesTable;

