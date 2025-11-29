import * as React from 'react';
import { cloneElement, memo, FC, forwardRef } from 'react';
import { TableBody } from '@mui/material';

import {
    DatagridBody,
    DatagridBodyProps,
    DatagridRow,
    PureDatagridRow,
} from 'react-admin';

import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export interface ISortableDatagridBodyProps extends DatagridBodyProps {
    onOrderUpdate?: (data: any[]) => void;
}

const defaultChildren = <DatagridRow />;
const defaultData = [];


const SortableDatagridBody: FC<ISortableDatagridBodyProps> = forwardRef(
    (
        {
            children,
            className,
            data = defaultData,
            expand,
            hasBulkActions = false,
            hover,
            onToggleItem,
            resource,
            row = defaultChildren,
            rowClick,
            rowStyle,
            selectedIds,
            isRowSelectable,
            onOrderUpdate,
            ...rest
        },
        _ref,
    ) => {
        React.useEffect(() => {
            console.log('data has been updated');
        }, [data]);

        const [orderedData, setOrderedData] = React.useState(data);

        /*const updateOrderedData = (data) => {
      onOrderUpdate && onOrderUpdate(orderedData);
      setOrderedData(data);
    };*/

        const reorder = (list, startIndex, endIndex) => {
            const result = Array.from(list);
            const [removed] = result.splice(startIndex, 1);
            result.splice(endIndex, 0, removed);

            return result;
        };

        const getItemStyle = (isDragging, draggableStyle) => ({
            border: isDragging ? '1px dashed #ccc' : 'none',
            ...draggableStyle,
        });

        const onDragEnd = (result) => {
            if (!result.destination) {
                return;
            }

            const movedItems = reorder(
                orderedData,
                result.source.index,
                result.destination.index,
            );
            setOrderedData(movedItems);
            if (onOrderUpdate) { onOrderUpdate(movedItems); }
        };

        return (
         (<DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId='droppable'>
              {(provided) => (
                  /* @ts-ignore Expected KnownIssue1 */
                  (<TableBody
                      ref={provided.innerRef}
                      className={'datagrid-body'}
                      {...rest}
                  >
                   {orderedData.map((record, rowIndex) => {
                       return (
                           <Draggable
                               key={record.id}
                               draggableId={'q-' + record.id}
                               index={rowIndex}
                           >
                               {(p, snapshot) => {
                                   const defaultStyles = rowStyle
                                       ? rowStyle(record, rowIndex)
                                       : {};
                                   return cloneElement(
                                       row,
                                       {
                                           ref: p.innerRef,
                                           ...p.draggableProps,
                                           ...p.dragHandleProps,

                                           /*className: clsx(DatagridClasses.row, {
                   [DatagridClasses.rowEven]: rowIndex % 2 === 0,
                   [DatagridClasses.rowOdd]: rowIndex % 2 !== 0,
                 }),*/
                                           expand,
                                           hasBulkActions: hasBulkActions && !!selectedIds,
                                           hover,
                                           id: record.id ?? `row${rowIndex}`,
                                           key: record.id ?? `row${rowIndex}`,
                                           onToggleItem,
                                           record,
                                           resource,
                                           rowClick,
                                           selectable:
                                               !isRowSelectable || isRowSelectable(record),
                                           selected: selectedIds?.includes(record.id),
                                           style: {
                                               ...defaultStyles,
                                               ...getItemStyle(
                                                   snapshot.isDragging,
                                                   p.draggableProps.style,
                                               ),
                                           },
                                       },
                                       children,
                                   );
                               }}
                           </Draggable>
                       );
                   })}
                  </TableBody>)
              )}
          </Droppable>
         </DragDropContext>)
        );
    },
);



// @ts-ignore Trick Material UI Table into thinking this is one of the child type it supports.
SortableDatagridBody.muiName = 'TableBody';

export const PureSortableDatagridBody = memo(
    (props) => <SortableDatagridBody row={<PureDatagridRow />} {...props} />,
    () => true,
); // Memo the sortable table, to avoid data updates.

// @ts-ignore Trick Material UI Table into thinking this is one of the child type it supports
PureSortableDatagridBody.muiName = 'TableBody';

export default PureSortableDatagridBody;


/* KnownIssue1 = No overload matches this call.
  Overload 1 of 2, '(props: { component: ElementType<any>; } & TableBodyOwnProps & CommonProps & Omit<any, "className" | "style" | "classes" | "children" | "sx">): Element', gave the following error.
    Type '{ children: Element[]; record?: RaRecord<Identifier>; rowSx?: (record: RaRecord<Identifier>, index: number) => SxProps; ... 262 more ...; className: string; }' is not assignable to type '{ component: ElementType<any>; }'.
      Property 'component' is optional in type '{ children: Element[]; record?: RaRecord<Identifier>; rowSx?: (record: RaRecord<Identifier>, index: number) => SxProps; ... 262 more ...; className: string; }' but required in type '{ component: ElementType<any>; }'.
  Overload 2 of 2, '(props: DefaultComponentProps<TableBodyTypeMap<{}, "tbody">>): Element', gave the following error.
    Types of property 'sx' are incompatible.
      Type 'import("/node_modules/@mui/system/styleFunctionSx/styleFunctionSx").SxProps<import("/node_modules/react-admin/node_modules/@mui/material/styles/createTheme").Theme>' is not assignable to type 'import("/node_modules/@mui/system/styleFunctionSx/styleFunctionSx").SxProps<import("/node_modules/@mui/material/styles/createTheme").Theme>'.
        Type 'SystemCssProperties<Theme>' is not assignable to type 'SxProps<Theme>'.
          Type 'SystemCssProperties<Theme>' is not assignable to type 'CSSSelectorObjectOrCssVariables<Theme>'.
            Property 'clipPath' is incompatible with index signature.
              Type 'SystemStyleObject<Theme> | ResponsiveStyleValue<ClipPath | string[]> | ((theme: Theme) => ResponsiveStyleValue<ClipPath | string[]>)' is not assignable to type 'CssVariableType | SystemStyleObject<Theme> | ((theme: Theme) => string | number | SystemStyleObject<Theme>)'.
                Type 'SystemCssProperties<Theme>' is not assignable to type 'CssVariableType | SystemStyleObject<Theme> | ((theme: Theme) => string | number | SystemStyleObject<Theme>)'.ts(2769)
*/
