import AutoTabbedForm from './DashAutoTabbedForm';
import IAutoForm from './interfaces/IDashAutoForm';
import React from 'react';
import { Create, TopToolbar, ListButton, Toolbar } from 'react-admin';
import evalActionPermission from './utils/evalActionPermission';
import AutoTitle from './common/DashAutoTitle';

import DashAutoAdminSaveButton from './DashAutoAdminSaveButton';
import { Portal } from '@mui/material';

const DashAutoCreate: React.FC<IAutoForm> = ({
	resourceConfig,
	toolbar,
	actions,
	onSubmit,
	onError,
	beforeSubmit,
	isDrawer /*, showActions, */,
}) => {
	const CreateActions: React.FC = ({ ...props }) => {
		const _showListwbutton: boolean =
			resourceConfig.drawer === true
				? false
				: resourceConfig.toolbarListButton
					? true
					: false;

		const hasToolbar:boolean = !!resourceConfig?.AutoEditTopToolbarElements || _showListwbutton;
		
		if (!hasToolbar) return null;
		return (
			<TopToolbar sx={{ mb:2 }} {...props}>
				{_showListwbutton && <ListButton />}
				{resourceConfig?.AutoEditTopToolbarElements ? (
					resourceConfig.AutoCreateTopToolbarElements(resourceConfig)
				) : (
					<></>
				)}
			</TopToolbar>
		);
	};

	const CreateToolbar: React.FC = ({ ...props }) => {
		const SaveComponent =
			resourceConfig.toolbarSaveButton &&
			resourceConfig.toolbarSaveButton.component
				? resourceConfig.toolbarSaveButton.component
				: DashAutoAdminSaveButton;
	
return  <Toolbar {...props}>
				{evalActionPermission(
					resourceConfig,
					resourceConfig.toolbarSaveButton,
				) && (
					<SaveComponent
						resourceConfig={resourceConfig}
						onSubmit={onSubmit}
						{...(resourceConfig.toolbarSaveButton &&
								resourceConfig.toolbarSaveButton?.props)}
					/>
				)}
				{resourceConfig?.AutoEditBottomToolbarElements ? (
					resourceConfig.AutoCreateBottomToolbarElements(resourceConfig)
				) : (
					<></>
				)}
			</Toolbar>
	

		return <Portal /*container={document.querySelector("div.dash-app-layout")}*/>
			<Toolbar {...props}>
				{evalActionPermission(
					resourceConfig,
					resourceConfig.toolbarSaveButton,
				) && (
					<SaveComponent
						resourceConfig={resourceConfig}
						onSubmit={onSubmit}
						{...(resourceConfig.toolbarSaveButton &&
								resourceConfig.toolbarSaveButton?.props)}
					/>
				)}
				{resourceConfig?.AutoEditBottomToolbarElements ? (
					resourceConfig.AutoCreateBottomToolbarElements(resourceConfig)
				) : (
					<></>
				)}
			</Toolbar>
		</Portal>;
        
	};

	return (
		<Create
			actions={actions || <CreateActions />}
			mutationMode={resourceConfig.mutationMode}
			title={<AutoTitle resourceConfig={resourceConfig} />}
		>
			<AutoTabbedForm
				mode='create'
				resourceConfig={resourceConfig}
				toolbar={toolbar || <CreateToolbar />}
				onSubmit={onSubmit}
				onError={onError}
				beforeSubmit={beforeSubmit}
				isDrawer={isDrawer}
			/>
		</Create>
	);
};
export default DashAutoCreate;
