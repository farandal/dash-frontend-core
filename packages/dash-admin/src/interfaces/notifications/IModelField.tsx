export default interface IModelField {
	key: string;
	label: string;
	attributes: { [key: string]: any };
	access: string[];
	value: any;
	parsed: any;
}
