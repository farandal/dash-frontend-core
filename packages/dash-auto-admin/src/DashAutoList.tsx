/* eslint-disable @typescript-eslint/no-unused-vars */
import autoFiltersGenerator from './DashAutoFiltersGenerator';
import { PaginationProps, useUnselectAll } from 'react-admin/src';

import { List } from 'react-admin';

import IDashAutoAdminResourceConfig from './interfaces/IDashAutoAdminResourceConfig';
import { FC, Fragment, JSX, useEffect, useState } from 'react';
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
	//stickyHeader?: boolean;
}
const DashAutoList: React.FC<IDashAutoList> = ({
	resourceConfig,
	customToolbarElements,
	beforeSubmit,
	onSubmit,
	onError,
	Pagination,
	children,
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

	const _dataGridProps = { ...resourceConfig.dataGridProps, ...dataGridProps };

	const [, setHandleLoading] = useState<boolean>(false);

	useEffect(() => {
		window.addEventListener('dash-global-loader', (e: any) => {
			if (resourceConfig.model === e.data.resource)
				setHandleLoading(e.data.value);
		});
		return () => {
			window.removeEventListener('dash-global-loader', (e: any) => {
				if (resourceConfig.model === e.data.resource)
					setHandleLoading(e.data.value);
			});
		};
	}, []);

	const ListActionsWrapper = resourceConfig.listActionsWrapper || DashAutoListDefaultListActionsWrapper;

	useEffect(() => {
		if (resourceConfig.resetSelectedIdsOnLoad) {
			unselectAll();
		}
	}, []);

	// Check if we should show actions
	const shouldShowActions = () => {
		if (resourceConfig.toolbar === false) {
			return false;
		}
		
		// Check if there are any actual toolbar items
		const hasToolbarItems = 
			(autoFilters && autoFilters.length > 0) ||
			resourceConfig.create ||
			resourceConfig.exporter ||
			resourceConfig.customToolbarElements;
			
		return hasToolbarItems;
	};

	const renderActions = () => {
		if (!shouldShowActions()) {
			return null; // Return null instead of false to avoid empty spans
		}

		return (
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
		);
	};

	const finalListProps = {
		/* default storeKey */
		sort: { field: 'id', order: 'ASC' },
		storeKey: resourceConfig?.model,

		...listProps,
		...(resourceConfig.listProps || {}),
		
		// Set actions to null if no actions should be shown, otherwise render actions
		actions: renderActions(),
		
		pagination: Pagination ? <Pagination {...resourceConfig.paginationProps} /> : <ExtendedPagination {...resourceConfig.paginationProps} />,
		...(exporter && { exporter: exporter }),
		...(resourceConfig.bulkActionButtons && { bulkActionButtons: resourceConfig.bulkActionButtons }),
	};

	if (!finalListProps) return <></>;
	
	return resourceConfig.listComponent ? (
		resourceConfig.listComponent(resourceConfig, onSubmit, onError)
	) : (
		<List {...finalListProps} >
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
