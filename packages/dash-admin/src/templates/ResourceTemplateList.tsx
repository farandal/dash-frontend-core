/* eslint-disable no-mixed-spaces-and-tabs */
import { useNotify } from 'react-admin';
import { useRedirect } from 'react-admin';
import { useRefresh } from 'react-admin';
import { FC, useCallback, useMemo } from 'react';
import {
	DashAutoList,
	DashAutoDrawer,
} from 'dash-auto-admin';
import { useDialog } from 'dash-dialog';
import React from 'react';
import ResourceLayout from '../layout/ResoureLayout';
import { IResourceTemplate } from './ResourceTemplate';
import { parseAxiosError } from '../helpers/parseAxiosError';
import { useDashResource } from '../contexts/DashResourceContext';

// Memoized DashAutoDrawer wrapper
const MemoizedDashAutoDrawer = React.memo(({
	drawerProps
}: {
	drawerProps: any;
}) => (
	<DashAutoDrawer {...drawerProps} />
), (prevProps, nextProps) => {
	return JSON.stringify(prevProps.drawerProps) === JSON.stringify(nextProps.drawerProps);
});

const ResourceTemplateListComponent: FC<IResourceTemplate> = (props) => {
	//const { resourceConfig } = useDashResource();
      const {resourceConfig} = props;
	const notify = useNotify();
	const redirect = useRedirect();
	const dialog = useDialog();
	const refresh = useRefresh();

	// Memoize these boolean values to prevent unnecessary re-renders
	const showNotifyAfterSubmit = useMemo(() => 
		resourceConfig?.showNotifyAfterSubmit !== false, 
		[resourceConfig?.showNotifyAfterSubmit]
	);
	
	const showDialogAfterSubmit = useMemo(() => 
		resourceConfig?.showDialogAfterSubmit !== false, 
		[resourceConfig?.showDialogAfterSubmit]
	);

	// Memoize the onSubmit function with proper dependencies
	const onSubmit = useCallback((data: any) => {
		if (showNotifyAfterSubmit) {
			notify('Recurso Actualizado', { type: 'success' });
		}

		if (showDialogAfterSubmit) {
			dialog({
				variant: 'info',
				title: 'Recurso Actualizado',
				content: 'Se ha actualizado el recurso  ' + resourceConfig.label,
				onConfirm: () => {
					//resourceConfig.refreshAfter && refresh();
					switch (resourceConfig.redirectAfterUpdate) {
						case false:
							return;
						case 'view':
							redirect('/' + resourceConfig.model + '/' + data.id + '/show');
							break;
						case 'edit':
							redirect('/' + resourceConfig.model + '/' + data.id);
							break;
						case 'list':
						default:
							redirect('/' + resourceConfig.model);
							break;
					}
				},
				onClose: () => {},
			});
		}

		if (!showDialogAfterSubmit && resourceConfig.redirectAfterUpdate) {
			switch (resourceConfig?.redirectAfterUpdate) {
				case 'view':
					redirect('/' + resourceConfig.model + '/' + data.id + '/show');
					break;
				case 'edit':
					redirect('/' + resourceConfig.model + '/' + data.id);
					break;
				case 'list':
				default:
					redirect('/' + resourceConfig.model);
					break;
			}
		}

		if (resourceConfig?.refreshAfter !== false) {
			refresh();
		}
	}, [
		showNotifyAfterSubmit,
		showDialogAfterSubmit,
		notify,
		dialog,
		redirect,
		refresh,
		resourceConfig.label,
		resourceConfig.model,
		resourceConfig.redirectAfterUpdate,
		resourceConfig.refreshAfter
	]);
	
	// Memoize the onError function with proper dependencies
	const onError = useCallback((_error: any) => {
		if (resourceConfig.onError) {
			resourceConfig.onError('list', _error);
			return;
		} 

		dialog({
			variant: 'danger',
			title: `${resourceConfig.label} Error`,
			content: `${parseAxiosError(_error)}`,
			onConfirm: () => {},
			onClose: () => {},
		});
	}, [
		resourceConfig.onError,
		resourceConfig.label,
		dialog
	]);

	// Memoize the drawer props to prevent unnecessary re-renders
	const drawerProps = useMemo(() => ({
		onSubmit,
		onError,
		resourceConfig,
		...(resourceConfig.drawerProps && {
			...resourceConfig.drawerProps,
		}),
	}), [onSubmit, onError, resourceConfig]);

	// Memoize the pagination props
	const paginationProps = useMemo(() => 
		resourceConfig.Pagination ? { Pagination: resourceConfig.Pagination } : {},
		[resourceConfig.Pagination]
	);

	// Remove mainContent useMemo and directly return the components
	return (
		<ResourceLayout resourceConfig={resourceConfig}>
			<DashAutoList
				resourceConfig={resourceConfig}
				onSubmit={onSubmit}
				onError={onError}
				{...paginationProps}
			/>

			{resourceConfig.drawer && (
				<MemoizedDashAutoDrawer drawerProps={drawerProps} />
			)}
		</ResourceLayout>
	);
};

// Memoize the entire component based on resourceConfig
export const ResourceTemplateList = React.memo(
	ResourceTemplateListComponent,
	(prevProps, nextProps) => {
		// Since we're using useDashResource() hook, we need to compare the context
		// But the main comparison should be based on the resourceConfig from context
		// This is a bit tricky because we can't access the hook result in the comparison function
		
		// For now, we'll do a simple props comparison
		// The real optimization comes from the memoized sub-components
		const propsEqual = prevProps === nextProps;
		
		if (!propsEqual) {
			console.log('ResourceTemplateList re-rendering - props changed');
		} else {
			console.log('ResourceTemplateList skipping re-render - props equal');
		}
		
		return propsEqual;
	}
);

// Modify the ResourceTemplateListWithConfig component
export const ResourceTemplateListWithConfig = React.memo(({
	resourceConfig
}: {
	resourceConfig: any;
}) => {
	const notify = useNotify();
	const redirect = useRedirect();
	const dialog = useDialog();
	const refresh = useRefresh();

	// Memoize these boolean values to prevent unnecessary re-renders
	const showNotifyAfterSubmit = useMemo(() => 
		resourceConfig?.showNotifyAfterSubmit !== false, 
		[resourceConfig?.showNotifyAfterSubmit]
	);
	
	const showDialogAfterSubmit = useMemo(() => 
		resourceConfig?.showDialogAfterSubmit !== false, 
		[resourceConfig?.showDialogAfterSubmit]
	);

	// Memoize the onSubmit function with proper dependencies
	const onSubmit = useCallback((data: any) => {
		if (showNotifyAfterSubmit) {
			notify('Recurso Actualizado', { type: 'success' });
		}

		if (showDialogAfterSubmit) {
			dialog({
				variant: 'info',
				title: 'Recurso Actualizado',
				content: 'Se ha actualizado el recurso  ' + resourceConfig.label,
				onConfirm: () => {
					switch (resourceConfig.redirectAfterUpdate) {
						case false:
							return;
						case 'view':
							redirect('/' + resourceConfig.model + '/' + data.id + '/show');
							break;
						case 'edit':
							redirect('/' + resourceConfig.model + '/' + data.id);
							break;
						case 'list':
						default:
							redirect('/' + resourceConfig.model);
							break;
					}
				},
				onClose: () => {},
			});
		}

		if (!showDialogAfterSubmit && resourceConfig.redirectAfterUpdate) {
			switch (resourceConfig?.redirectAfterUpdate) {
				case 'view':
					redirect('/' + resourceConfig.model + '/' + data.id + '/show');
					break;
				case 'edit':
					redirect('/' + resourceConfig.model + '/' + data.id);
					break;
				case 'list':
				default:
					redirect('/' + resourceConfig.model);
					break;
			}
		}

		if (resourceConfig?.refreshAfter !== false) {
			refresh();
		}
	}, [
		showNotifyAfterSubmit,
		showDialogAfterSubmit,
		notify,
		dialog,
		redirect,
		refresh,
		resourceConfig.label,
		resourceConfig.model,
		resourceConfig.redirectAfterUpdate,
		resourceConfig.refreshAfter
	]);
	
	// Memoize the onError function with proper dependencies
	const onError = useCallback((_error: any) => {
		if (resourceConfig.onError) {
			resourceConfig.onError('list', _error);
			return;
		} 

		dialog({
			variant: 'danger',
			title: `${resourceConfig.label} Error`,
			content: `${parseAxiosError(_error)}`,
			onConfirm: () => {},
			onClose: () => {},
		});
	}, [
		resourceConfig.onError,
		resourceConfig.label,
		dialog
	]);

	// Memoize the drawer props to prevent unnecessary re-renders
	const drawerProps = useMemo(() => ({
		onSubmit,
		onError,
		resourceConfig,
		...(resourceConfig.drawerProps && {
			...resourceConfig.drawerProps,
		}),
	}), [onSubmit, onError, resourceConfig]);

	// Memoize the pagination props
	const paginationProps = useMemo(() => 
		resourceConfig.Pagination ? { Pagination: resourceConfig.Pagination } : {},
		[resourceConfig.Pagination]
	);

	return (
		<ResourceLayout resourceConfig={resourceConfig}>
			<DashAutoList
				resourceConfig={resourceConfig}
				onSubmit={onSubmit}
				onError={onError}
				{...paginationProps}
			/>

			{resourceConfig.drawer && (
				<MemoizedDashAutoDrawer drawerProps={drawerProps} />
			)}
		</ResourceLayout>
	);
}, (prevProps, nextProps) => {
	const resourceConfigEqual = prevProps.resourceConfig === nextProps.resourceConfig;
	
	if (!resourceConfigEqual) {
		console.log('ResourceTemplateListWithConfig re-rendering - resourceConfig changed:', {
			prevModel: prevProps.resourceConfig?.model,
			nextModel: nextProps.resourceConfig?.model
		});
	} else {
		console.log('ResourceTemplateListWithConfig skipping re-render - resourceConfig equal');
	}
	
	return resourceConfigEqual;
});

export default ResourceTemplateList;
