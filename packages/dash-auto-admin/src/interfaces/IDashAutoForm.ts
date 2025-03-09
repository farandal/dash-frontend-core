import IDashAutoAdminResourceConfig from './IDashAutoAdminResourceConfig';

export default interface IAutoForm {
	/** */
	id?: number;
	/** */
	resourceConfig: IDashAutoAdminResourceConfig;
	/** */
	onSubmit?: (values: any) => any;
	/** */
	onError?: (error: any) => any;
	/** */
	onCancel?: () => any;
	/** */
	beforeSubmit?: (values: any) => any;
	/** */
	toolbar?: React.ReactElement;
	/** */
	actions?: React.ReactElement;
	/** */
	isDrawer?: boolean;
}
