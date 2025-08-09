/* eslint-disable no-mixed-spaces-and-tabs */
import { useNotify } from 'react-admin';
import { useRedirect } from 'react-admin';
import { useRefresh } from 'react-admin';
import { Toolbar } from 'react-admin';
import { FC } from 'react';
import { SimpleForm } from 'react-admin';
import { Edit } from 'react-admin';
import {
	DashAutoDrawer,
	DashAutoEdit,
} from 'dash-auto-admin';
import { useDialog } from 'dash-dialog';
import DashAutoAdminSaveButton from 'dash-auto-admin/src/DashAutoAdminSaveButton';
import React from 'react';
import ResourceLayout from '../layout/ResoureLayout';
import { IResourceTemplate } from './ResourceTemplate';
import { parseAxiosError } from '../helpers/parseAxiosError';
import { useDashResource } from '../contexts/DashResourceContext';


export const ResourceTemplateEdit: FC<IResourceTemplate> = (props) => {
	const {resourceConfig} = props;
	const notify = useNotify();

	const redirect = useRedirect();

	const dialog = useDialog();

	const refresh = useRefresh();

	const getRedirectPath = (path: string) => {
		const currentAppPath = localStorage.getItem('currentAppPath');
		return currentAppPath 
			? `/${currentAppPath}/${path}`.replace(/\/+/g, '/')
			: `/${path}`.replace(/\/+/g, '/');
	};

	//const location = useLocation();

	const _showNotifyAfterSubmit =
		resourceConfig?.showNotifyAfterSubmit === false ? false : true;
	const _showDialogAfterSubmit =
		resourceConfig?.showDialogAfterSubmit === false ? false : true;

	const onEdit = (data: any) => {

		if (_showNotifyAfterSubmit) {
			notify('Recurso Editado', { type: 'success' });
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

		if (!_showDialogAfterSubmit && resourceConfig.redirectAfterUpdate) {
			switch (resourceConfig.redirectAfterUpdate) {
				case 'view':
					redirect(getRedirectPath(`${resourceConfig.model}/${data.id}/show`));
					break;
				case 'edit':
					redirect(getRedirectPath(`${resourceConfig.model}/${data.id}`));
					break;
				case 'list':
					redirect(getRedirectPath(resourceConfig.model));
					break;
				default:
					break;
			}
		}


		if (resourceConfig?.refreshAfter !== false) {
			refresh();
		}
	};

    const onError = (_error: any) => {
       
        const _errorParser = resourceConfig.errorParser || parseAxiosError
        
		if (resourceConfig.onError) {
			resourceConfig.onError('edit', _error);
            return;
		} 
       
        dialog({
            variant: 'danger',
            title: `${resourceConfig.label} Error`,
            content: _errorParser(_error),
            onConfirm: () => {},
            onClose: () => {},
        });

	};

	const onBeforeSubmit = (values: any) => {
       
		return resourceConfig.beforeSubmit
			? resourceConfig.beforeSubmit(values)
			: values;
	};

	const ToolBar = () => (
		<Toolbar>
           
			<DashAutoAdminSaveButton resourceConfig={resourceConfig} />
		</Toolbar>
	);
   
	return resourceConfig.editComponent ? (
		<ResourceLayout resourceConfig={resourceConfig}>
			<Edit>
				<SimpleForm  reValidateMode="onBlur" toolbar={<ToolBar />}>
					{resourceConfig.editComponent(resourceConfig)}
				</SimpleForm>
			</Edit>
			{resourceConfig.drawer && (
				<DashAutoDrawer
					onError={onError}
					onSubmit={onEdit}
					resourceConfig={resourceConfig}
					{...(resourceConfig.drawerProps && {
						...resourceConfig.drawerProps,
					})}
				/>
			)}
		</ResourceLayout>
	) : (
		<ResourceLayout resourceConfig={resourceConfig}>
            
			<DashAutoEdit
				//toolbar={<ToolBar />}
				onError={onError}
				onSubmit={onEdit}
				beforeSubmit={onBeforeSubmit}
				resourceConfig={resourceConfig}
			/>
			{resourceConfig.drawer && (
				<DashAutoDrawer
					onError={onError}
					onSubmit={onEdit}
					resourceConfig={resourceConfig}
					{...(resourceConfig.drawerProps && {
						...resourceConfig.drawerProps,
					})}
				/>
			)}
		</ResourceLayout>
	);
};
