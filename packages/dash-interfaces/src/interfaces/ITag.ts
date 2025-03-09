export enum TagTypeColors {
	'rgba' = 'rgba',
	'rgb' = 'rgb',
	'hex' = 'hex',
}
export interface ITag {
	/** */
	id: number;
	/** */
	name: string;
	/** */
	description?: string;
	/** */
	color: string;
	/** */
	type_color: keyof typeof TagTypeColors;
	/** */
	client: boolean;
	/** */
	status: 'active' | 'inactive';
	/** */
	icon?: string;
	/** */
	prefix_icon?: string;
	/** */
	created_at?: string;
	/** */
	updated_at?: string;
	/** */
	driver: boolean;
}
