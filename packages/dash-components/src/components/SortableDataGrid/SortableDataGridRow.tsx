import React, {
    isValidElement,
    cloneElement,
    createElement,
    useState,
    useEffect,
    useCallback,
    memo,
    FC,
} from 'react';
import { isElement } from 'react-is';
import clsx from 'clsx';
import { TableCell, TableRow, Checkbox } from '@mui/material';
import {
    RecordContextProvider,
    shallowEqual,
    useExpanded,
    useResourceContext,
    useTranslate,
    useCreatePath,
    useRecordContext,
} from 'react-admin';
import { useNavigate } from 'react-router-dom';
import {
    DatagridCell,
    DatagridClasses,
    DatagridRow,
    DatagridRowProps,
    ExpandRowButton,
    useDatagridContext,
} from 'react-admin/src';
import MenuIcon from '@mui/icons-material/Menu';

const computeNbColumns = (expand, children, hasBulkActions) =>
    expand
        ? 1 + // show expand button
        (hasBulkActions ? 1 : 0) + // checkbox column
        React.Children.toArray(children).filter((child) => !!child).length // non-null children
        : 0; // we don't need to compute columns if there is no expand panel;

const SortableDatagridRow: FC<DatagridRowProps> = React.forwardRef(
    (props, ref) => {
        const {
            children,
            className,
            expand,
            hasBulkActions = false,
            hover = true,
            id,
            onToggleItem,
            record: recordOverride,
            rowClick,
            selected = false,
            style,
            selectable = true,
            ...rest
        } = props;

        const context = useDatagridContext();
        const translate = useTranslate();
        const record = useRecordContext(props);
        const expandable =
            (!context ||
                !context.isRowExpandable ||
                context.isRowExpandable(record)) &&
            expand;
        const resource = useResourceContext(props);
        const createPath = useCreatePath();
        const [expanded, toggleExpanded] = useExpanded(
            resource,
            id,
            context && context.expandSingle,
        );
        const [nbColumns, setNbColumns] = useState(() =>
            computeNbColumns(expandable, children, hasBulkActions),
        );
        useEffect(() => {
            // Fields can be hidden dynamically based on permissions;
            // The expand panel must span over the remaining columns
            // So we must recompute the number of columns to span on
            const newNbColumns = computeNbColumns(
                expandable,
                children,
                hasBulkActions,
            );
            if (newNbColumns !== nbColumns) {
                setNbColumns(newNbColumns);
            }
        }, [expandable, nbColumns, children, hasBulkActions]);

        const navigate = useNavigate();

        const handleToggleExpand = useCallback(
            (event) => {
                toggleExpanded();
                event.stopPropagation();
            },
            [toggleExpanded],
        );
        const handleToggleSelection = useCallback(
            (event) => {
                if (!selectable) return;
                onToggleItem(id, event);
                event.stopPropagation();
            },
            [id, onToggleItem, selectable],
        );
        const handleClick = useCallback(
            async (event) => {
                event.persist();
                const type =
                    typeof rowClick === 'function'
                        ? await rowClick(id, resource, record)
                        : rowClick;
                if (type === false || type === null) {
                    return;
                }
                if (['edit', 'show'].includes(type)) {
                    navigate(createPath({ resource, id, type }));
                    return;
                }
                if (type === 'expand') {
                    handleToggleExpand(event);
                    return;
                }
                if (type === 'toggleSelection') {
                    handleToggleSelection(event);
                    return;
                }
                navigate(type);
            },
            [
                rowClick,
                id,
                resource,
                record,
                navigate,
                createPath,
                handleToggleExpand,
                handleToggleSelection,
            ],
        );

        return (
            <RecordContextProvider value={record}>
                <TableRow
                    ref={ref}
                    className={clsx(className, {
                        [DatagridClasses.expandable]: expandable,
                        [DatagridClasses.selectable]: selectable,
                        [DatagridClasses.clickableRow]:
                            typeof rowClick === 'function' ? true : rowClick,
                    })}
                    key={id}
                    style={style}
                    hover={hover}
                    onClick={handleClick}
                    {...rest}
                >
                    <TableCell key={'drag'}>
                        <MenuIcon sx={{ cursor: 'pointer' }} className='handle' />
                    </TableCell>
                    {expand && (
                        <TableCell
                            padding='none'
                            className={DatagridClasses.expandIconCell}
                        >
                            {expandable && (
                                <ExpandRowButton
                                    className={clsx(DatagridClasses.expandIcon, {
                                        [DatagridClasses.expanded]: expanded,
                                    })}
                                    expanded={expanded}
                                    onClick={handleToggleExpand}
                                    expandContentId={`${id}-expand`}
                                />
                            )}
                        </TableCell>
                    )}
                    {hasBulkActions && (
                        <TableCell padding='checkbox'>
                            <Checkbox
                                aria-label={translate('ra.action.select_row', {
                                    _: 'Select this row',
                                })}
                                color='primary'
                                className={`select-item ${DatagridClasses.checkbox}`}
                                checked={selectable && selected}
                                onClick={handleToggleSelection}
                                disabled={!selectable}
                            />
                        </TableCell>
                    )}
                    {React.Children.map(children, (field, index) =>
                        isValidElement(field) ? (
                            <DatagridCell
                                key={`${id}-${(field.props as any).source || index}`}
                                className={clsx(
                                    `column-${(field.props as any).source}`,
                                    DatagridClasses.rowCell,
                                )}
                                record={record}
                                {...{ field, resource }}
                            />
                        ) : null,
                    )}
                </TableRow>
                {expandable && expanded && (
                    <TableRow
                        key={`${id}-expand`}
                        id={`${id}-expand`}
                        className={DatagridClasses.expandedPanel}
                    >
                        <TableCell colSpan={nbColumns}>
                            {isElement(expand)
                                ? cloneElement(expand, {
                                    record,
                                    resource,
                                    id: String(id),
                                })
                                : createElement(expand, {
                                    record,
                                    resource,
                                    id: String(id),
                                })}
                        </TableCell>
                    </TableRow>
                )}
            </RecordContextProvider>
        );
    },
);

const areEqual = (prevProps, nextProps) => {
    const { children: _1, expand: _2, ...prevPropsWithoutChildren } = prevProps;
    const { children: _3, expand: _4, ...nextPropsWithoutChildren } = nextProps;
    return shallowEqual(prevPropsWithoutChildren, nextPropsWithoutChildren);
};

export const PureDatagridRow = memo(DatagridRow, areEqual);

PureDatagridRow.displayName = 'PureDatagridRow';

export default SortableDatagridRow;
