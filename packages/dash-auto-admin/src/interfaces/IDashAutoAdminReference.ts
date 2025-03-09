import IDashAutoAdminAttribute from './IDashAutoAdminAttribute';

export interface IDashAutoAdminReference {
	/** */
	reference: string;
	/** */
	target: string;
	/** */
	type?: 'ReferenceArrayField' | 'ReferenceManyField';
	/** */
	tab?: string;
	/** */
	schema: IDashAutoAdminAttribute[];
	/** */
	BulkActions?: any;
}
