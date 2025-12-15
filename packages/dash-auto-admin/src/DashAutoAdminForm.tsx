import { Box } from '@mui/material';
import { JSX } from 'react';
import {
	useResourceContext,
	useRecordContext,
	Toolbar,
	SimpleForm,
} from 'react-admin';

import IDashAutoAdminResourceConfig from './interfaces/IDashAutoAdminResourceConfig';

import React from 'react';
import validate from './utils/validate';
import { ToolbarCreateButton, ToolbarDeleteButton, ToolbarSaveButton } from './toolbar/buttons/ToolbarButtons';
import { useDataProvider } from 'react-admin';
import { DashAutoAdminFormProvider } from './context/DashAutoAdminFormContext';

export interface IDashAutoAdminForm {
	resourceConfig: IDashAutoAdminResourceConfig;
	//schema: IDashAutoAdminAttribute[];
	toolbar?: React.ReactElement<any>;
	onSubmit?: (values: any) => any;
	onError?: (error: any) => any;
	onCancel?: (error: any) => any;
	beforeSubmit?: (values: any) => any;
	mode: 'create' | 'edit';
	children?: JSX.Element;
	isDrawer?: boolean;
}

//only to consume externally:
const DashAutoAdminForm: React.FC<IDashAutoAdminForm> = ({
	resourceConfig,
	onSubmit,
	beforeSubmit,
	onError,
	//onCancel,
	toolbar,
	mode,
	children,
}) => {
	const resource = useResourceContext();
	const record = useRecordContext();
    const dataProvider = useDataProvider();
    const debug = false;

	const onCreateSave = 
		async (values) => {
			if (debug) console.log('onCreateSave called with values:', values);
			window.dispatchEvent(
				new MessageEvent('dash-global-loader', { data: true }),
			);
			try {
				if (beforeSubmit) {
					if (debug) console.log('beforeSubmit called with values:', values);
					values = beforeSubmit(values);
					if (debug) console.log('beforeSubmit returned values:', values);
				}

                const { data } = await dataProvider.create(resource, { 
                    data: values 
                });
				if (debug) console.log('dataProvider.create returned data:', data);

				if (onSubmit) {
					if (debug) console.log('onSubmit called with data:', data);
					onSubmit(data);
				}
			} catch (error) {
				if (onError) {
					if (debug) console.log('onError called with error:', error);
					onError(error);
				}
			} finally {
				window.dispatchEvent(
					new MessageEvent('dash-global-loader', { data: false }),
				);
			}
		};

	const onUpdateSave = 
		async (values) => {
			if (debug) console.log('onUpdateSave called with values:', values);
			window.dispatchEvent(
				new MessageEvent('dash-global-loader', { data: true }),
			);

			try {
				if (beforeSubmit) {
					if (debug) console.log('beforeSubmit called with values:', values);
					values = beforeSubmit(values);
					if (debug) console.log('beforeSubmit returned values:', values);
				}

                const { data } = await dataProvider.update(resource, { 
                    id: record?.id,
                    data: values,
                    previousData: record
                });
				if (debug) console.log('dataProvider.update returned data:', data);

				if (onSubmit) {
					if (debug) console.log('onSubmit called with data:', data);
					onSubmit(data);
				}
			} catch (error) {
				if (onError) {
					if (debug) console.log('onError called with error:', error);
					onError(error);
				}
			} finally {
				window.dispatchEvent(
					new MessageEvent('dash-global-loader', { data: false }),
				);
			}
		};

	let onSave = onCreateSave;

	switch (mode) {
		case 'edit':
			onSave = onUpdateSave;
			break;
		case 'create':
            
			onSave = onCreateSave;
			break;
	}

	const defaultToolbar = () => (
		<Toolbar>
			{mode === 'edit' && <ToolbarSaveButton resourceConfig={resourceConfig} />}
			{mode === 'create' && <ToolbarCreateButton resourceConfig={resourceConfig} />}
			<ToolbarDeleteButton resourceConfig={resourceConfig} />
		</Toolbar>
	);

	return (
		<DashAutoAdminFormProvider value={{ onSave, mode }}>
			<Box>
				<SimpleForm
					toolbar={toolbar || defaultToolbar()}
					onSubmit={onSave}
					validate={validate(resourceConfig.schema)}
					reValidateMode="onBlur"
				>
					{children}
				</SimpleForm>
			</Box>
		</DashAutoAdminFormProvider>
	);
};

export default DashAutoAdminForm;