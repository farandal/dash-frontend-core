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

	// DEBUG: Log the resource configuration
	useEffect(() => {
		console.log('📋 DashAutoList DEBUG - Component initialized (fieldProps standardized):', {
			resourceModel: resourceConfig.model,
			hasReferenceFilters: !!(resourceConfig.referenceFilters && resourceConfig.referenceFilters.length > 0),
			referenceFiltersCount: resourceConfig.referenceFilters?.length || 0,
			referenceFilters: resourceConfig.referenceFilters?.map(f => ({
				id: f.id,
				source: f.source,
				label: f.label,
				hasReferenceComponent: !!f.referenceComponent,
				fieldProps: f.fieldProps, // Only fieldProps now
			})) || [],
			timestamp: new Date().toISOString()
		});
	}, [resourceConfig]);

	if (customToolbarElements) {
		resourceConfig.customToolbarElements = customToolbarElements;
	}

	// DEBUG: Log before generating filters
	console.log('🔧 DashAutoList DEBUG - About to generate filters (fieldProps only):', {
		resourceModel: resourceConfig.model,
		referenceFilters: resourceConfig.referenceFilters,
		timestamp: new Date().toISOString()
	});

	const autoFilters = autoFiltersGenerator(resourceConfig);

	// DEBUG: Log generated filters
	console.log('✅ DashAutoList DEBUG - Filters generated (fieldProps standardized):', {
		resourceModel: resourceConfig.model,
		filtersCount: autoFilters.length,
		filters: autoFilters.map((filter, idx) => ({
			index: idx,
			key: filter.key,
			type: filter.type?.name || 'unknown',
			props: filter.props,
		})),
		timestamp: new Date().toISOString()
	});

	const unselectAll = useUnselectAll(
		resourceConfig.listProps?.storeKey || resourceConfig.model,
	);

	const _dataGridProps = { ...resourceConfig.dataGridProps, ...dataGridProps };

	const [, setHandleLoading] = useState<boolean>(false);

	useEffect(() => {
		const handleGlobalLoader = (e: any) => {
			if (resourceConfig.model === e.data.resource)
				setHandleLoading(e.data.value);
		};

		window.addEventListener('dash-global-loader', handleGlobalLoader);
		return () => {
			window.removeEventListener('dash-global-loader', handleGlobalLoader);
		};
	}, [resourceConfig.model]);

	const ListActionsWrapper = resourceConfig.listActionsWrapper || DashAutoListDefaultListActionsWrapper;

	useEffect(() => {
		if (resourceConfig.resetSelectedIdsOnLoad) {
			unselectAll();
		}
	}, [resourceConfig.resetSelectedIdsOnLoad, unselectAll]);

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

		// DEBUG: Log actions rendering
		console.log('🎬 DashAutoList DEBUG - Rendering actions (fieldProps standardized):', {
			resourceModel: resourceConfig.model,
			autoFiltersCount: autoFilters.length,
			hasCustomToolbarElements: !!resourceConfig.customToolbarElements,
			timestamp: new Date().toISOString()
		});

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

	// DEBUG: Log final list props
	console.log('🚀 DashAutoList DEBUG - Final list props (fieldProps standardized):', {
		resourceModel: resourceConfig.model,
		finalListProps: {
			...finalListProps,
			actions: !!finalListProps.actions ? 'rendered' : 'null',
		},
		timestamp: new Date().toISOString()
	});

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
