/* eslint-disable no-mixed-spaces-and-tabs */
import { useNotify } from 'react-admin';
import { useRedirect } from 'react-admin';
import { useRefresh } from 'react-admin';
import { FC } from 'react';
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

export const ResourceTemplateList: FC<IResourceTemplate> = (props) => {
  
	const {resourceConfig} = useDashResource()
	const notify = useNotify();
	const redirect = useRedirect();
	const dialog = useDialog();
	const refresh = useRefresh();

	const _showNotifyAfterSubmit =
		resourceConfig?.showNotifyAfterSubmit === false ? false : true;
	const _showDialogAfterSubmit =
		resourceConfig?.showDialogAfterSubmit === false ? false : true;

	const onSubmit = (data: any) => {

		if (_showNotifyAfterSubmit) {
			notify('Recurso Actualizado', { type: 'success' });
		}

		if (_showDialogAfterSubmit) {
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

		if (!_showDialogAfterSubmit && resourceConfig.redirectAfterUpdate) {
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
	};
	
    const onError = (_error: any) => {

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

	};

	return (
		<ResourceLayout resourceConfig={resourceConfig}>
			<DashAutoList
				resourceConfig={resourceConfig}
				onSubmit={onSubmit}
				onError={onError}
				//stickyHeader={true}
				{...(resourceConfig.Pagination && {
					Pagination: resourceConfig.Pagination,
				})}
			/>

			{resourceConfig.drawer && (
				<DashAutoDrawer
					onSubmit={onSubmit}
					onError={onError}
					resourceConfig={resourceConfig}
					{...(resourceConfig.drawerProps && {
						...resourceConfig.drawerProps,
					})}
				/>
			)}
		</ResourceLayout>
	);
};
