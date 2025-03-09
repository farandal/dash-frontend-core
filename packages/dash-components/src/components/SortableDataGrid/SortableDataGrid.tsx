import {
	FC,
	PropsWithChildren,
	memo,
	useRef,
} from 'react';

import { Datagrid } from 'react-admin';
import { DatagridProps } from 'react-admin/src';
import SortableDatagridBody from './SortableDataGridBody';
import { SortableDatagridHeader } from './SortableDataGridHeader';
import SortableDatagridRow from './SortableDataGridRow';
import React from 'react';

interface ISortableDatagrid extends DatagridProps, PropsWithChildren {
	onOrderUpdate?: (data: any) => void;
}

const SortableDatagrid: FC<ISortableDatagrid> = (props) => {
	const { children, onOrderUpdate, ...rest } = props;
	const bodyRef = React.useRef(null);
	//const [tableEl, setTableEl] = useState(null);

	const _onOrderUpdate = (d: any[]) => {
		if (onOrderUpdate) { onOrderUpdate(d); }
	};

	const SortableRootDatagrid = (p) => (
		<Datagrid
			{...p}
			header={<SortableDatagridHeader />}
			body={
				<SortableDatagridBody
					/* @ts-ignore : Expected */
					onOrderUpdate={_onOrderUpdate}
					ref={bodyRef}
					//{...props}
					row={<SortableDatagridRow />}
				/>
			}
		/>
	);

	const SortableRootDatagridPure = memo(
		SortableRootDatagrid,
		() => true,
	);

	return (
		<div id='sortable-list'>
			<SortableRootDatagridPure {...rest}>{children}</SortableRootDatagridPure>
		</div>
	);
};

export default SortableDatagrid;
