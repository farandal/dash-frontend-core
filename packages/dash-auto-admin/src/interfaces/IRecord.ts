import IDashAutoAdminAttribute from './IDashAutoAdminAttribute';

export default interface IRecord {
	/** */
	attribute?: IDashAutoAdminAttribute;
	[key: string]: any;
}
