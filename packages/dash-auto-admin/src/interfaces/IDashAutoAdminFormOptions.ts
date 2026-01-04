export default interface IDashAutoAdminFormOptions {
	/** */
	mode: 'list' | 'create' | 'edit' | 'view';
	/** */
	label?: string;
	/** */
	saveButtonProps?: any;
	/** */
	useReadOnlyInputAsTextField?: boolean;
	/** */
	readOnlyComponent?: any;
	/** */
	record?: any;
	/** */
	meta?: any;
	/** */
	isDrawer?: boolean;
    /** */
    handleChange?: (e:any) => void;
	/** */
	locale?: string;
}
