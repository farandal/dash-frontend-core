import { FC } from "react";
import { useRecordContext } from "react-admin";
import MultiLevelTable from "../MultiLevelTable";
import React from "react";
import { IProductTemplate } from "../../interfaces";

interface IProductTemplateShow {
  record?: IProductTemplate
}

const ProductTemplateShow: FC<IProductTemplateShow> = ({ record }) => {

  const _record: IProductTemplate = record || useRecordContext();

  //https://www.npmjs.com/package/@dsinnovators/multi-level-table
  const structure =
  {
    name: "Columnas",
    children: [
      {
        field: "name",
        display: "Nombre"
      },
      {
        field: "file",
        display: "Archivo"
      },
      {
        field: "skip_rows",
        display: "Filas omitidas"
      }],
    array: {
      name: "productTemplateColumns",
      children: [{
        field: "name",
        display: "Columna"
      },
      {
        field: "data_index",
        display: "DataIndex"
      }]
    },
  };

  const classNames = {
    table: 'ant-table ant-table-middle ant-table-bordered ant-table-ping-right ant-table-fixed-header ant-table-fixed-column ant-table-scroll-horizontal ant-table-has-fix-left ant-table-has-fix-right',
    head: 'ant-table-header',
    body: 'ant-table-body',
    headCell: 'ant-table-cell',
    bodyRow: 'ant-table-row',

  }

  return (
    <>
      {_record && _record?.productTemplateColumns && _record.productTemplateColumns.length ?
        <div className="ant-table product-table">
          <div className="ant-table-container">
            <div className="ant-table-content">
              <MultiLevelTable
                data={[_record]}
                structure={structure}
                //actions={actions} //optional
                //actionLabel="Manage" //optional
                className={classNames} //optional
              />
            </div>
          </div>
        </div>
        : <>No Hay información</>}
    </>
  );

}

export default ProductTemplateShow;