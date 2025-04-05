import { IDashAutoAdminSaveButton } from '../DashAutoAdminSaveButton';
import IDashAutoAdminResourceConfig from './IDashAutoAdminResourceConfig';

export interface IToolbarButton extends IDashAutoAdminSaveButton {
	/** */
	//resourceConfig: IDashAutoAdminResourceConfig;
	/** */
	mode?: 'edit' | 'show' | 'list' | 'create'
}

export default IToolbarButton;