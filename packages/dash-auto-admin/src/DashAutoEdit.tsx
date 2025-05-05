import AutoTitle from './common/DashAutoTitle';
import IAutoForm from './interfaces/IDashAutoForm';
import AutoTabbedForm from './DashAutoTabbedForm';
import { TopToolbar, Edit, Toolbar } from 'react-admin';
import React from 'react';
import { ToolbarCreateButton, ToolbarDeleteButton, ToolbarEditButton, ToolbarExportButton, ToolbarListButton } from './toolbar/buttons/ToolbarButtons';
import { BottomToolbarDeleteButton, BottomToolbarSaveButton } from './toolbar/buttons/BottomToolbarButtons';

const DashAutoEdit: React.FC<IAutoForm> = ({
	id,
	resourceConfig,
	onSubmit,
	onError,
	onCancel,
	beforeSubmit,
	toolbar,
	actions,
	isDrawer = false,
}) => {
	const EditActions: React.FC = ({ ...props }) => {

		const _isDrawer = !!resourceConfig.drawer;

		return <TopToolbar sx={{ mb:2 }}  {...props}>
			{resourceConfig?.AutoEditTopToolbarElements ? (
				resourceConfig.AutoEditTopToolbarElements(resourceConfig)
			) : null}
			{!_isDrawer && <ToolbarListButton mode='edit' resourceConfig={resourceConfig}/>}
			{!_isDrawer && <ToolbarEditButton mode='edit' resourceConfig={resourceConfig}/>}
			{!_isDrawer && <ToolbarCreateButton mode='edit' resourceConfig={resourceConfig}/>}
			{!_isDrawer && <ToolbarDeleteButton mode='edit' resourceConfig={resourceConfig}/>}
			{!_isDrawer && <ToolbarExportButton mode='edit' resourceConfig={resourceConfig}/>}
		</TopToolbar>;
		
	};

	const EditToolbar: React.FC = ({ ...props }) => {

		return (
			<Toolbar {...props}>
				{/*evalActionPermission(
					resourceConfig,
					resourceConfig.toolbarSaveButton,
				) && (
					<SaveComponent
						resourceConfig={resourceConfig}
						{...(onSubmit && { onSubmit: onSubmit })}
						{...(resourceConfig.toolbarSaveButton &&
							resourceConfig.toolbarSaveButton?.props)}
					/>
				)*/}
				<BottomToolbarSaveButton mode='edit' resourceConfig={resourceConfig} onError={onError} onSubmit={onSubmit} />
				<BottomToolbarDeleteButton mode='edit' resourceConfig={resourceConfig} onError={onError} onSubmit={onSubmit} />
				{/*evalActionPermission(
					resourceConfig,
					resourceConfig.toolbarDeleteButton,
				) && (
					<DeleteComponent
						resourceConfig={resourceConfig}
						{...(resourceConfig.toolbarDeleteButton &&
							resourceConfig.toolbarDeleteButton?.props)}
					/>
				)*/}
				{resourceConfig?.AutoEditBottomToolbarElements ? (
					resourceConfig.AutoEditBottomToolbarElements(resourceConfig)
				) : (
					<></>
				)}
			</Toolbar>
		);
	};
   
	return (
		<Edit
            
			{...(id && { id })}
			actions={actions || <EditActions />}
			mutationMode={resourceConfig.mutationMode}
			title={<AutoTitle resourceConfig={resourceConfig} />}
		>
			<AutoTabbedForm
				isDrawer={isDrawer}
				mode='edit'
				resourceConfig={resourceConfig}
				//{...(_showToolbar && { toolbar: <EditToolbar /> })}
				toolbar={toolbar || <EditToolbar />}
				onSubmit={onSubmit}
				onError={onError}
				{...(beforeSubmit && { beforeSubmit: beforeSubmit })}
				onCancel={onCancel}
               
			/>
         
		</Edit>
	);
};

export default DashAutoEdit;
