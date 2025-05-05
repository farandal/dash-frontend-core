/* eslint-disable @typescript-eslint/no-unused-vars */
import autoFiltersGenerator from './DashAutoFiltersGenerator';
import { PaginationProps, useUnselectAll } from 'react-admin/src';

import { List } from 'react-admin';

import IDashAutoAdminResourceConfig from './interfaces/IDashAutoAdminResourceConfig';
import { FC, JSX, useEffect, useState } from 'react';
import ExtendedPagination from './mui/components/ExtendedPagination';

import DashAutoListDefaultListActionsWrapper from './list/DashAutoListDefaultActionsWrapper';
import DashAutoListDataGridWrapper from './list/DashAutoListDatagridWrapper';
import DashAutoListActions from './list/DashAutoListActions';

export interface IDashAutoList {

	resourceConfig: IDashAutoAdminResourceConfig;
	customToolbarElements?: (props: any) => JSX.Element;
	beforeSubmit?: (data: any) => any;
	onSubmit?: (data: any) => any;
	onError?: (error: any) => any;
	dataGridProps?: any;
	children?: any;
	Pagination?: FC<PaginationProps>;
	stickyHeader?: boolean;
}

const DashAutoList: React.FC<IDashAutoList> = ({
	resourceConfig,
	customToolbarElements,
	beforeSubmit,
	onSubmit,
	onError,
	Pagination,
	children,
	// eslint-disable-next-line no-unused-vars
	stickyHeader = false,
	dataGridProps,
	...listProps
}) => {
	const { exporter } = resourceConfig;

	if (customToolbarElements) {
		resourceConfig.customToolbarElements = customToolbarElements;
	}
	const autoFilters = autoFiltersGenerator(resourceConfig);

	const unselectAll = useUnselectAll(
		resourceConfig.listProps?.storeKey || resourceConfig.model,
	);

	//const { dataGridProps } = listProps;
	const _dataGridProps = { ...resourceConfig.dataGridProps, ...dataGridProps };

	const [, setHandleLoading] = useState<boolean>(false);

	useEffect(() => {
		window.addEventListener('ra-auto-global-loader', (e: any) => {
			if (resourceConfig.model === e.data.resource)
				setHandleLoading(e.data.value);
		});
		return () => {
			window.removeEventListener('ra-auto-global-loader', (e: any) => {
				if (resourceConfig.model === e.data.resource)
					setHandleLoading(e.data.value);
			});
		};
	}, []);

	const ListActionsWrapper =
		resourceConfig.listActionsWrapper || DashAutoListDefaultListActionsWrapper;

	useEffect(() => {
		if (resourceConfig.resetSelectedIdsOnLoad) {
			//unselectAll();
			unselectAll();
		}
	}, []);

	//const location = useLocation();
	//const [currentLocation, setCurrentLocation] = useState(location.pathname);

	// No need to pass any filters to the list anymore, as the <PostFilterForm> component will display them.
	//const [finalListProps, setFinalListProps] = useState(null);
	const finalListProps = 
{
	/* default storeKey */
    sort: { field: 'id', order: 'ASC' },
	storeKey: resourceConfig?.model,
	...listProps,
	...(resourceConfig.listProps && resourceConfig.listProps),
	/** If resourceConfig toolbar disabled, then disable the default react-admin toolbar by setting actions:null */
	...(resourceConfig.toolbar === false || ((autoFilters && autoFilters.length < 1) && !resourceConfig.toolbar === true)
		? { actions: null }
		: {
			actions: (
				<ListActionsWrapper
					autoFilters={autoFilters}
					resourceConfig={resourceConfig}
				>
					<DashAutoListActions
						filters={autoFilters}
						resourceConfig={resourceConfig}
						autoFilters={autoFilters}
						listProps={listProps}
					/>
				</ListActionsWrapper>
			) }),
	pagination: Pagination ? <Pagination {...resourceConfig.paginationProps} /> : <ExtendedPagination {...resourceConfig.paginationProps} />,
	...(exporter && { exporter: exporter }),

	//bulkActionButtons: BulkActions || DefaultBulkActions,
};


	if (!finalListProps) return <></>;
	return resourceConfig.listComponent ? (
		resourceConfig.listComponent(resourceConfig, onSubmit, onError)
	) : (
		<List  {...finalListProps}>
			{resourceConfig.dataGridComponent ? (
				<resourceConfig.dataGridComponent
					resourceConfig={resourceConfig}
					dataGridProps={_dataGridProps}
				/>
			) : (
				<DashAutoListDataGridWrapper
					resourceConfig={resourceConfig}
					dataGridProps={_dataGridProps}
				/>
			)}
		</List>
	);
};

export default DashAutoList;
