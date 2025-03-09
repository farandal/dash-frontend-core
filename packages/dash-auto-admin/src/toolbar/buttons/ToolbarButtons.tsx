import { CreateButton } from 'react-admin';
import { FC } from 'react';
import { ExportButton } from 'react-admin';
import { ListButton } from 'react-admin';
import { EditButton } from 'react-admin';
import { DeleteButton } from 'react-admin';
import DashAutoAdminSaveButton from '../../DashAutoAdminSaveButton';
import { DeleteWithConfirmButton } from 'react-admin';
import { WithRecord } from 'react-admin';
import { SaveButton } from 'react-admin';
import IToolbarButton from '../../interfaces/IToolbarButton';
import IAutoGridButton from '../../interfaces/IDashAutoGridButton';

/**
 * Checks if the current mode enables the display of a button.
 *
 * @param modes - An optional object that specifies which modes should enable the button.
 * @param mode - The current mode of the application.
 * @returns `true` if the button should be displayed, `false` otherwise.
 */
const checkIfModeEnablesButton = (modes?:IAutoGridButton['modes'], mode?:IToolbarButton['mode']) => {
	if (!modes) return true;
	if (!mode) return true;
	if (modes[mode] === false) return false;
	return true;
};


/**
 * Renders a toolbar save button based on the provided resource configuration.
 * 
 * The button is only rendered if the `toolbarSaveButton` property is defined and enabled.
 * The button is further conditionally rendered based on the current mode and the `modes` property of the `toolbarSaveButton`.
 * 
 * If the `toolbarSaveButton` is enabled and the current mode allows it, the button can either be a custom component or a default `AutoAdminSaveButton` component.
 *
 * @param props - The component props, including the `resourceConfig` and the current `mode`.
 * @returns The rendered toolbar save button or `null` if the button should not be rendered.
 */
export const ToolbarSaveButton:FC<IToolbarButton> = (props) => {
	const { resourceConfig, mode } = props;
	if (!resourceConfig) return <SaveButton/>;
	if (resourceConfig.toolbarSaveButton) {
		if (resourceConfig.toolbarSaveButton?.enabled) {
			if (checkIfModeEnablesButton(resourceConfig.toolbarSaveButton.modes, mode)) {
				const buttonProps = {
					...(resourceConfig.toolbarSaveButton?.props || {}),
					alwaysEnable: resourceConfig?.saveButtonAlwaysEnabled === true ? true : false,
				};
				return resourceConfig.toolbarSaveButton?.component ? <resourceConfig.toolbarSaveButton.component {...buttonProps} />  : <DashAutoAdminSaveButton {...buttonProps} />;
			}
		}
	}
	return null;
};

/**
 * Renders a toolbar list button based on the provided resource configuration.
 * 
 * The button is only rendered if the `list` property in the resource configuration is not `false` and the `toolbarListButton` property is defined.
 * The button is further conditionally rendered based on the current mode and the `modes` property of the `toolbarListButton`.
 * 
 * If the `toolbarListButton` is enabled and the current mode allows it, the button can either be a custom component or a default `ListButton` component.
 *
 * @param props - The component props, including the `resourceConfig` and the current `mode`.
 * @returns The rendered toolbar list button or `null` if the button should not be rendered.
 */
export const ToolbarListButton:FC<IToolbarButton> = (props) => {
	const { resourceConfig, mode } = props;
	if (!resourceConfig) return <ListButton/>;
	if (!!(resourceConfig?.list !== false) && (resourceConfig?.toolbarListButton && !!(resourceConfig?.toolbarListButton.enabled !== false))) {
		return checkIfModeEnablesButton(resourceConfig.toolbarListButton.modes, mode) ? <ListButton/> : null;
	} else if (resourceConfig.toolbarListButton?.enabled) {
		if (checkIfModeEnablesButton(resourceConfig.toolbarEditButton.modes, mode)) {
			return resourceConfig.toolbarListButton?.component ? <resourceConfig.toolbarListButton.component {...resourceConfig.toolbarListButton?.props || {}} />  : <ListButton {...resourceConfig.toolbarListButton?.props || {}} />;
		}
	}
	return null;
};

/**
 * Renders a toolbar edit button based on the provided resource configuration.
 * 
 * The button is only rendered if the `edit` property in the resource configuration is not `false` and the `toolbarEditButton` property is defined.
 * The button is further conditionally rendered based on the current mode and the `modes` property of the `toolbarEditButton`.
 * 
 * If the `toolbarEditButton` is enabled and the current mode allows it, the button can either be a custom component or a default `EditButton` component.
 *
 * @param props - The component props, including the `resourceConfig` and the current `mode`.
 * @returns The rendered toolbar edit button or `null` if the button should not be rendered.
 */
export const ToolbarEditButton:FC<IToolbarButton> = (props) => {
	const { resourceConfig, mode } = props;
	if (!resourceConfig) return <EditButton/>;
	if (!!(resourceConfig?.edit !== false) && (resourceConfig?.toolbarEditButton && !!(resourceConfig?.toolbarEditButton.enabled !== false))) {
		return checkIfModeEnablesButton(resourceConfig.toolbarEditButton.modes, mode) ? <EditButton/> : null;
	} else if (resourceConfig.toolbarEditButton?.enabled) {
		if (checkIfModeEnablesButton(resourceConfig.toolbarEditButton.modes, mode)) {
			return resourceConfig.toolbarEditButton?.component ? <resourceConfig.toolbarEditButton.component {...resourceConfig.toolbarEditButton?.props || {}} />  : <EditButton {...resourceConfig.toolbarEditButton?.props || {}} />;
		}
	}
	return null;
};

/**
 * Renders a toolbar create button based on the provided resource configuration.
 * 
 * The button is only rendered if the `create` property in the resource configuration is not `false` and the `toolbarCreateButton` property is defined.
 * The button is further conditionally rendered based on the current mode and the `modes` property of the `toolbarCreateButton`.
 * 
 * If the `toolbarCreateButton` is enabled and the current mode allows it, the button can either be a custom component or a default `CreateButton` component.
 *
 * @param props - The component props, including the `resourceConfig` and the current `mode`.
 * @returns The rendered toolbar create button or `null` if the button should not be rendered.
 */
export const ToolbarCreateButton:FC<IToolbarButton> = (props) => {
	const { resourceConfig, mode } = props;
	if (!resourceConfig) return <CreateButton/>;
	if (!!(resourceConfig?.create !== false) && (resourceConfig?.toolbarCreateButton && !!(resourceConfig?.toolbarCreateButton.enabled !== false))) {
		return checkIfModeEnablesButton(resourceConfig.toolbarCreateButton.modes, mode) ? <CreateButton/> : null;
	} else if (resourceConfig.toolbarCreateButton?.enabled) {
		if (checkIfModeEnablesButton(resourceConfig.toolbarCreateButton.modes, mode)) {
			return resourceConfig.toolbarCreateButton?.component ? <resourceConfig.toolbarCreateButton.component {...resourceConfig.toolbarCreateButton?.props || {}} />  : <CreateButton {...resourceConfig.toolbarCreateButton?.props || {}} />;
		}
	}
	return null;
};

/**
 * Renders a toolbar delete button based on the provided resource configuration.
 * 
 * The button is only rendered if the `delete` property in the resource configuration is not `false` and the `toolbarDeleteButton` property is defined.
 * The button is further conditionally rendered based on the current mode and the `modes` property of the `toolbarDeleteButton`.
 * 
 * If the `toolbarDeleteButton` is enabled and the current mode allows it, the button can either be a custom component or a default `DeleteButton` component.
 * If the `toolbarDeleteButton` has a `confirm` property, the button will be rendered with a confirmation dialog.
 * 
 * @param props - The component props, including the `resourceConfig` and the current `mode`.
 * @returns The rendered toolbar delete button or `null` if the button should not be rendered.
 */
export const ToolbarDeleteButton:FC<IToolbarButton> = (props) => {
	const { resourceConfig, mode } = props;
	if (!resourceConfig) return  <DeleteButton/>;
	if (!!(resourceConfig?.delete !== false) && !!resourceConfig?.toolbarDeleteButton) {
		return checkIfModeEnablesButton(resourceConfig.toolbarDeleteButton.modes, mode) ? <DeleteButton/> : null;
	} else if (!!resourceConfig?.toolbarDeleteButton && !!(resourceConfig?.toolbarDeleteButton.enabled !== false)) {
		if (checkIfModeEnablesButton(resourceConfig.toolbarCreateButton.modes, mode)) {
			if (!!resourceConfig.toolbarDeleteButton?.props && resourceConfig.toolbarDeleteButton.props?.confirm) {
				return <WithRecord
					render={(record) => (
						<DeleteWithConfirmButton record={record} />
					)}
				/>;
			}
		}
		return resourceConfig.toolbarDeleteButton?.component ? <resourceConfig.toolbarDeleteButton.component {...resourceConfig.toolbarDeleteButton?.props || {}} />  : <DeleteButton {...resourceConfig.toolbarDeleteButton?.props || {}} />;
	}
	return null;
};

/**
 * Renders a toolbar export button based on the provided resource configuration.
 * 
 * The button is only rendered if the `exporter` property in the resource configuration is not `false` and the `toolbarExportButton` property is defined.
 * The button is further conditionally rendered based on the current mode and the `modes` property of the `toolbarExportButton`.
 * 
 * If the `toolbarExportButton` is enabled and the current mode allows it, the button can either be a custom component or a default `ExportButton` component.
 * 
 * @param props - The component props, including the `resourceConfig` and the current `mode`.
 * @returns The rendered toolbar export button or `null` if the button should not be rendered.
 */
export const ToolbarExportButton:FC<IToolbarButton> = (props) => {
	const { resourceConfig, mode } = props;
	if (!resourceConfig) return <ExportButton/>;
	if (!!(resourceConfig?.exporter !== false) && (resourceConfig?.toolbarExportButton && !!(resourceConfig?.toolbarExportButton.enabled !== false))) {
		return checkIfModeEnablesButton(resourceConfig.toolbarExportButton.modes, mode) ? <ExportButton/> : null;
	} else if (resourceConfig.toolbarExportButton?.enabled) {
		if (checkIfModeEnablesButton(resourceConfig.toolbarExportButton.modes, mode)) {
			return resourceConfig.toolbarExportButton?.component ? <resourceConfig.toolbarExportButton.component {...resourceConfig.toolbarExportButton?.props || {}} />  : <ExportButton {...resourceConfig.toolbarExportButton?.props || {}} />;
		}
	}
	return null;
};