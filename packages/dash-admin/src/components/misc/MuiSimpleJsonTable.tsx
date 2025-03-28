import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';

import React, { FC, JSX } from 'react';
import isComponent from '../../utils/isComponent';

interface IDictEntry {
  [x: string]: any;
}
export interface MUISimpleJsonTable {
  tableData: any;
  vertical: boolean;
  ignore?: string[];
  include?: string[];
  dict?: IDictEntry;
  showKey?: boolean;
}

function isJSXElement(value: any): value is JSX.Element {
  return (
    value &&
    typeof value === "object" &&
    value.$$typeof === Symbol.for("react.element")
  );
}

function isReactNode(value: any): value is React.ReactNode {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    value instanceof React.Component ||
    value instanceof React.Fragment ||
    Array.isArray(value) && value.every((item) => isReactNode(item))
  );
}

function isReactNodeArrayOrJSXElementArray(value: any): boolean {
  return (
    Array.isArray(value) &&
    (value.every((item) => isReactNode(item)) ||
      value.every((item) => isJSXElement(item)))
  );
}

// Todo: Typescript ignore, debe ser arreglo
// Todo: incluir diccionario
const MUISimpleJsonTable: FC<MUISimpleJsonTable> = ({
  tableData,
  vertical,
  ignore,
  include,
  dict,
  showKey,
}) => {
  if (!ignore) ignore = [];
  if (!include) include = [];
  if (!dict) dict = {};

  let column = tableData ? Object.keys(tableData) : [];
  if (include.length) column = column.filter((key) => include.includes(key));
  if (ignore.length) column = column.filter((key) => !ignore.includes(key));

  const parseValue = (value: any) => {
    if (typeof value !== 'object') {
      if (dict.hasOwnProperty(value)) {
        return dict[value];
      }
      return value;
    }

    if (
      isComponent(value)
      || isReactNodeArrayOrJSXElementArray
      // TODO: WARNING: the $$typeof checking fails several tests, we rely on isComponent.
      /*||
      (value.$$typeof !== undefined && value.$$typeof.toString() === 'Symbol(react.element)')*/
    ) {
      return value;
    }

    if (Array.isArray(value)) {
      return JSON.stringify(value);
    }



    return <MUISimpleJsonTable tableData={value} vertical={true} />;
  };

  const ThData = () => {
    return (
      column &&
      column.map((data, key) => (
        <TableCell key={key}>{parseValue(data)}</TableCell>
      ))
    );
  };

  const tdData = () => {
    return vertical ? (
      column &&
      column.map((v, key) => {
        return (
          <TableRow key={key}>
            {showKey && <TableCell>{parseValue(v)}</TableCell>}
            <TableCell>{parseValue(tableData[v])}</TableCell>
          </TableRow>
        );
      })
    ) : (
      <TableRow>
        {column &&
          column.map((v, key) => {
            return <TableCell key={key}>{parseValue(tableData[v])}</TableCell>;
          })}
      </TableRow>
    );
  };

  return vertical ? (
    <TableContainer component={Paper}>
      <Table>
        <TableBody>{tdData()}</TableBody>
      </Table>
    </TableContainer>
  ) : (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>{ThData()}</TableRow>
        </TableHead>
        <TableBody>{tdData()}</TableBody>
      </Table>
    </TableContainer>
  );
};

export default MUISimpleJsonTable;
