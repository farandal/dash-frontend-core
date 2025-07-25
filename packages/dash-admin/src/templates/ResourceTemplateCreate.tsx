/* eslint-disable no-mixed-spaces-and-tabs */

import { useNotify } from 'react-admin';
import { useRedirect } from 'react-admin';
import { useRefresh } from 'react-admin';
import { FC } from 'react';
import { SimpleForm } from 'react-admin';
import { Create } from 'react-admin';
import {
	DashAutoDrawer,
	DashAutoCreate,
} from 'dash-auto-admin';
import { useDialog } from 'dash-dialog';
import React from 'react';
import ResourceLayout from '../layout/ResoureLayout';
import { IResourceTemplate } from './ResourceTemplate';
import { parseAxiosError } from '../helpers/parseAxiosError';
import { useDashResource } from '../contexts/DashResourceContext';

export const ResourceTemplateCreate: FC<IResourceTemplate> = (props) => {
	//const {resourceConfig} = useDashResource()};
    const {resourceConfig} = props;
	const notify = useNotify();
	const redirect = useRedirect();
	const refresh = useRefresh();
	//console.log("CREATE", resourceConfig)
	const dialog = useDialog();

	const _showNotifyAfterSubmit =
		resourceConfig?.showNotifyAfterSubmit === false ? false : true;
	const _showDialogAfterSubmit =
		resourceConfig?.showDialogAfterSubmit === false ? false : true;

	const getRedirectPath = (path: string) => {
		const currentAppPath = localStorage.getItem('currentAppPath');
		return currentAppPath 
			? `/${currentAppPath}/${path}`.replace(/\/+/g, '/')
			: `/${path}`.replace(/\/+/g, '/');
	};

	const onCreate = (data: any) => {



		if (_showNotifyAfterSubmit) {
			notify('Recurso Creado', { type: 'success' });
		}
		if (_showDialogAfterSubmit) {
			dialog({
				variant: 'info',
				title: 'Recurso Creado',
				content: 'Se ha creado el recurso  ' + resourceConfig.label,
				onConfirm: () => {
					switch (resourceConfig?.redirectAfterCreate) {
						case false:
							return;
						case 'create':
							redirect(getRedirectPath(`${resourceConfig.model}/create`));
							break;
						case 'view':
							redirect(getRedirectPath(`${resourceConfig.model}/${data.id}/show`));
							break;
						case 'edit':
							redirect(getRedirectPath(`${resourceConfig.model}/${data.id}`));
							break;
						case 'list':
						default:
							redirect(getRedirectPath(resourceConfig.model));
							break;
					}
				},
				onClose: () => {},
			});
		}

		if (!_showDialogAfterSubmit && resourceConfig.redirectAfterCreate) {
			switch (resourceConfig?.redirectAfterCreate) {
				case 'create':
					redirect(getRedirectPath(`${resourceConfig.model}/create`));
					break;
				case 'view':
					redirect(getRedirectPath(`${resourceConfig.model}/${data.id}/show`));
					break;
				case 'edit':
					redirect(getRedirectPath(`${resourceConfig.model}/${data.id}`));
					break;
				case 'list':
				default:
					redirect(getRedirectPath(resourceConfig.model));
					break;
			}
		}

		if (resourceConfig.refreshAfter) {
			refresh();
		}
	};

    const onError = (_error: any) => {
        
		if (resourceConfig.onError) {
			resourceConfig.onError('create', _error);
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
	const onBeforeSubmit = (values: any) => {
		return resourceConfig.beforeSubmit
			? resourceConfig.beforeSubmit(values)
			: values;
	};

	/*const ToolBar = () => (
		<Toolbar>
			<DashAutoAdminSaveButton
				resourceConfig={resourceConfig}
				onSubmit={onCreate}
			/>
		</Toolbar>
	);*/

	return resourceConfig.createComponent ? (
		<ResourceLayout resourceConfig={resourceConfig}>
			<Create>
				<SimpleForm>
					{resourceConfig.createComponent(resourceConfig)}
				</SimpleForm>
			</Create>
			{resourceConfig.drawer && (
				<DashAutoDrawer
					resourceConfig={resourceConfig}
					{...(resourceConfig.drawerProps && {
						...resourceConfig.drawerProps,
					})}
				/>
			)}
		</ResourceLayout>
	) : (
		<ResourceLayout resourceConfig={resourceConfig}>
			<DashAutoCreate
				//toolbar={<ToolBar />}
				onError={onError}
				onSubmit={onCreate}
				beforeSubmit={onBeforeSubmit}
				resourceConfig={resourceConfig}
			/>
			{resourceConfig.drawer && (
				<DashAutoDrawer
					resourceConfig={resourceConfig}
					{...(resourceConfig.drawerProps && {
						...resourceConfig.drawerProps,
					})}
				/>
			)}
		</ResourceLayout>
	);
};
