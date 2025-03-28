import React, { useEffect, useRef, useState } from 'react';

export interface IMultiLevelTableAction {
  name: string;
  callback: () => any;
}
export interface IMultiLevelTable {
  data: any;
  structure: any;
  actionLabel?: string;
  actions?: IMultiLevelTableAction[];
  className?: {
    table?: string;
    head?: string;
    body?: string;
  };
}

const getFields = (structure) => [
  ...structure.children.map((child) => child.display),
  ...(structure.array ? getFields(structure.array) : []),
];

const addSelfToFirstChild = (childRows, structure, row) => {
  childRows[0] = [
    ...structure.children.map((child) => ({
      text: row[child.field],
      span: childRows.length,
    })),
    ...childRows[0],
  ];
};

const dropdown =
  (getChain, actions, actionLabel) =>
    ({ indices }) => {
      const [show, setShow] = useState<boolean>(false);
      const ref = useRef<HTMLElement>(null);

      useEffect(() => {
        const listener = (event) => {
          if (!ref.current) return;
          if (ref.current.contains(event.target)) return;
          setShow(false);
        };

        document.addEventListener('click', listener);

        return () => {
          document.removeEventListener('click', listener);
        };
      }, [ref]);

      const getClickHandler = (action) => () => {
        action.callback(getChain(indices));
        setShow(false);
      };

      return (
        <span ref={ref}>
          <span
            onClick={(_) => setShow(!show)}
            className='flex flex-row items-center justify-center cursor-pointer'
          >
            {actionLabel}
            {show ? <span>↑</span> : <span>↓</span>}
          </span>
          {show && (
            <div className='flex flex-col absolute right-0 bg-white rounded-md shadow-md gap-2 p-2 whitespace-nowrap border border-gray-300'>
              {actions &&
                actions.map((action) => (
                  <span
                    key={action.name}
                    onClick={getClickHandler(action)}
                    className='flex flex-row items-center cursor-pointer text-md hover:bg-gray-300 p-2 rounded-md'
                  >
                    {action.name}
                  </span>
                ))}
            </div>
          )}
        </span>
      );
    };
const createGetColumns = (getChain, actions, actionLabel) => {

  const Dropdown = dropdown(getChain, actions, actionLabel);
  return (structure, data, indices) => [
    ...structure.children.map((child) => ({
      text: data[child.field],
      span: 1,
    })),
    ...(actions.length
      ? [
        {
          text: <Dropdown indices={indices} />,
          span: 1,
        },
      ]
      : []),
  ];
};

const createGetRows = (getColumns) => {
  const getRows = (structure, rows, memoizedIndices) =>
    rows && !structure.array
      ? rows.map((row, i) =>
        getColumns(structure, row, [...memoizedIndices, i]),
      )
      : rows
        ? rows.flatMap((row, i) => {
          const childRows = getRows(
            structure.array,
            row[structure.array.name],
            [...memoizedIndices, i], // Use a linked list of a wrapper to optimise this
          );
          childRows && addSelfToFirstChild(childRows, structure, row);
          return childRows;
        })
        : null;

  return getRows;
};

const getChain = (indices, structure, data) => {
  const chain = {};
  indices.forEach((i) => {
    chain[structure.name] = data[i];
    structure = structure.array;
    data = structure && data[i][structure.name];
  });
  return chain;
};

const createGetChain = (structure, data) => (indices) =>
  getChain(indices, structure, data);

const TableHeader = ({ classNames, fields }) => (
  <thead className={classNames?.head}>
    <tr>
      {fields.map((name) => (
        <th className={classNames?.headCell + ' p-2 py-3'} key={name}>
          {name}
        </th>
      ))}
    </tr>
  </thead>
);

const TableBody = ({ classNames, rows }) => (
  <tbody className={classNames?.tableBody}>
    {rows &&
      rows.map((row, i) => (
        <tr className={classNames?.tableRow} key={i}>
          {row &&
            row.map((col, j) => (
              <td key={j} rowSpan={col.span}>
                {col.text}
              </td>
            ))}
        </tr>
      ))}
  </tbody>
);

const MultiLevelTable: React.FC<IMultiLevelTable> = ({
  data,
  structure,
  actions,
  actionLabel,
  className,
}) => {


  const _actions = actions || [];
  const _actionLabel = actionLabel || 'Action';


  const getChain = createGetChain(structure, data);
  const getColumns = createGetColumns(getChain, _actions, _actionLabel);
  const getRows = createGetRows(getColumns);

  const rows = getRows(structure, data, []);
  const fields = [
    ...getFields(structure),
    ...(_actions.length ? [_actionLabel] : []),
  ];

  return (
    rows && (
      <table className={className?.table}>
        <TableHeader fields={fields} classNames={className} />
        <TableBody rows={rows} classNames={className} />
      </table>
    )
  );
};

export default MultiLevelTable;

/*
MultiLevelTable.propTypes = {
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
    structure: PropTypes.object.isRequired,
    actionLabel: PropTypes.string,
    actions: PropTypes.arrayOf(
        PropTypes.exact({
            name: PropTypes.string.isRequired,
            callback: PropTypes.func.isRequired
        })
    ),
    className: PropTypes.exact({
        table: PropTypes.string,
        head: PropTypes.string,
        body: PropTypes.string
    })
}
*/
/*
MultiLevelTable.defaultProps = {
  actionLabel: 'Action',
  actions: [],
  className: {
    table: 'w-full shadow-sm overflow-hidden rounded-lg text-center',
    head: 'text-white bg-gray-700 text-center',
    body: 'p-2 border-solid border border-light-blue-300',
  },
};
*/