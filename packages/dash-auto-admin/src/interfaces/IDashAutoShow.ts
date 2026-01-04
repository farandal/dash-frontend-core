import IDashAutoAdminResourceConfig from './IDashAutoAdminResourceConfig';

export default interface IAutoShow {
	/** */
	resourceConfig: IDashAutoAdminResourceConfig;
	/** */
	id?: React.Key;
	/** */
	isDrawer?: boolean;
	/** */
	locale?: string;
}
