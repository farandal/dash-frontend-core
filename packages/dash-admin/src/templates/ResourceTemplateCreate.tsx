/* eslint-disable no-mixed-spaces-and-tabs */

import { useNotify, useTranslate } from 'react-admin';
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
    const {resourceConfig, locale} = props;
	const notify = useNotify();
	const translate = useTranslate();
	const redirect = useRedirect();
	const refresh = useRefresh();
	//console.log("CREATE", resourceConfig)
	const dialog = useDialog();

	const _showNotifyAfterSubmit =
		resourceConfig?.showNotifyAfterSubmit === false ? false : true;
	const _showDialogAfterSubmit =
		resourceConfig?.showDialogAfterSubmit === false ? false : true;

	// @deprecated - removed currentAppPath logic that caused path duplication
	const getRedirectPath = (path: string) => {
		return `/${path}`.replace(/\/+/g, '/');
	};

	const onCreate = (data: any) => {

		const translatedLabel = translate(resourceConfig.label, { _: resourceConfig.label });

		if (_showNotifyAfterSubmit) {
			notify('dash.resource.created', { type: 'success' });
		}
		if (_showDialogAfterSubmit) {
			// A resource may override the success dialog to surface values the
			// API returns exactly once (e.g. a generated secret that is never
			// recoverable afterwards).
			const successOverride = resourceConfig?.createSuccessDialog?.(data);

			// A string title is treated as a translation key (with itself as
			// fallback), matching how labels and menu titles behave elsewhere.
			// JSX titles are rendered as-is.
			const overrideTitle =
				typeof successOverride?.title === 'string'
					? translate(successOverride.title, { _: successOverride.title })
					: successOverride?.title;

			dialog({
				variant: 'info',
				title: overrideTitle ?? translate('dash.resource.created'),
				content:
					successOverride?.content ??
					translate('dash.resource.created_message', { label: translatedLabel }),
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

		if (resourceConfig?.refreshAfter !== false) {
			refresh();
		}
	};

    const onError = (_error: any) => {
        
		if (resourceConfig.onError) {
			resourceConfig.onError('create', _error);
            return;
		} 

        const translatedLabel = translate(resourceConfig.label, { _: resourceConfig.label });

        dialog({
            variant: 'danger',
            title: translate('dash.resource.error', { label: translatedLabel }),
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

	// A resource's own `create` route is react-router's exact match for
	// .../create - guaranteed to mount, unlike the old redirect-to-list
	// scheme this replaced (which bounced through a hash DashAutoDrawer had
	// to re-parse after navigating away; see DashAutoDrawer's `forceMode`
	// doc). drawerOptions.create === false keeps the original full-form
	// behaviour below instead of ever rendering the drawer here.
	const _showDrawer = resourceConfig.drawer && resourceConfig.drawerOptions?.create !== false;

	return resourceConfig.createComponent ? (
		<ResourceLayout resourceConfig={resourceConfig} locale={locale}>
			{_showDrawer ? (
				<DashAutoDrawer
					resourceConfig={resourceConfig}
					forceMode="create"
					{...(resourceConfig.drawerProps && {
						...resourceConfig.drawerProps,
					})}
				/>
			) : (
				<Create>
					<SimpleForm>
						{resourceConfig.createComponent(resourceConfig)}
					</SimpleForm>
				</Create>
			)}
		</ResourceLayout>
	) : (
		<ResourceLayout resourceConfig={resourceConfig} locale={locale}>
			{_showDrawer ? (
				<DashAutoDrawer
					resourceConfig={resourceConfig}
					forceMode="create"
					{...(resourceConfig.drawerProps && {
						...resourceConfig.drawerProps,
					})}
				/>
			) : (
				<DashAutoCreate
					//toolbar={<ToolBar />}
					onError={onError}
					onSubmit={onCreate}
					beforeSubmit={onBeforeSubmit}
					resourceConfig={resourceConfig}
					locale={locale}
				/>
			)}
		</ResourceLayout>
	);
};
