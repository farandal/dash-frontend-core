import { FC } from 'react';
import { DeleteButton } from 'react-admin';
import DashAutoAdminSaveButton from '../../DashAutoAdminSaveButton';
import { DeleteWithConfirmButton } from 'react-admin';
import { WithRecord } from 'react-admin';
import { SaveButton } from 'react-admin';
import IToolbarButton from '../../interfaces/IToolbarButton';

/**
 * Renders a save button in the bottom toolbar of the admin interface. The button's behavior is controlled by the `resourceConfig.bottomToolbarSaveButton` configuration.
 *
 * @param props - The component props, including the `resourceConfig` object.
 * @returns A save button component, either the default `SaveButton` or a custom component specified in the `resourceConfig`.
 */
export const BottomToolbarSaveButton:FC<IToolbarButton> = (props) => {
	const { resourceConfig } = props;
	if (!resourceConfig) return <SaveButton/>;
	if (resourceConfig.bottomToolbarSaveButton) {
		if (resourceConfig.bottomToolbarSaveButton?.enabled) {
			const buttonProps = {
				...(resourceConfig.bottomToolbarSaveButton?.props || {}),
				alwaysEnable: resourceConfig?.saveButtonAlwaysEnabled === true ? true : false,
			};
			return resourceConfig.bottomToolbarSaveButton?.component ? <resourceConfig.bottomToolbarSaveButton.component {...buttonProps} />  : <DashAutoAdminSaveButton {...buttonProps} />;
		} else {
			return null;
		}
	}
	return <SaveButton/>;
};


/**
 * Renders a delete button in the bottom toolbar of the admin interface. The button's behavior is controlled by the `resourceConfig.bottomToolbarDeleteButton` configuration.
 * 
 * @param props - The component props, including the `resourceConfig` object.
 * @returns A delete button component, either the default `DeleteButton` or a custom component specified in the `resourceConfig`.
 */
export const BottomToolbarDeleteButton:FC<IToolbarButton> = (props) => {
	const { resourceConfig } = props;
	if (!resourceConfig) return  <DeleteButton/>;
	
	if (!!(resourceConfig?.delete !== false) && !!resourceConfig?.bottomToolbarDeleteButton) {
		return <DeleteButton/>;
	} else if (!!resourceConfig?.bottomToolbarDeleteButton && !!(resourceConfig?.bottomToolbarDeleteButton.enabled !== false)) {
		if (!!resourceConfig.bottomToolbarDeleteButton?.props && resourceConfig.bottomToolbarDeleteButton.props?.confirm) {
			return <WithRecord
				render={(record) => (
					<DeleteWithConfirmButton record={record} />
				)}
			/>;
		}
		return resourceConfig.bottomToolbarDeleteButton?.component ? <resourceConfig.bottomToolbarDeleteButton.component {...resourceConfig.bottomToolbarDeleteButton?.props || {}} />  : <DeleteButton {...resourceConfig.bottomToolbarDeleteButton?.props || {}} />;
	}

	return null;
};
