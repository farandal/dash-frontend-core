import IDashAutoAdminResourceConfig from './IDashAutoAdminResourceConfig';

export interface IToolbarButton {
	/** */
	resourceConfig: IDashAutoAdminResourceConfig;
	/** */
	mode?: 'edit' | 'show' | 'list' | 'create'
}

export default IToolbarButton;