import { JSX } from 'react';
import IDashAutoAdminAttribute from './IDashAutoAdminAttribute';
import IDashAutoAdminResourceConfig from './IDashAutoAdminResourceConfig';

export default interface IDashAutoAdminCustomFieldComponent {
    attribute: IDashAutoAdminAttribute; // TODO attribute must required?
    method: 'list' | 'view' | 'edit' | 'create';
    resourceConfig: IDashAutoAdminResourceConfig;
    record?: any;
   
	/** */
	children?: JSX.Element;
	[x: string]: any;
}


