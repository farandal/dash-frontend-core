import { JSX, ReactNode } from 'react';

import IDashAutoAdminCustomFieldComponent from './IDashAutoAdminCustomFieldComponent';
import IRecord from './IRecord';

/**
 * Interface for defining attributes and behavior of auto-admin fields.
 * This interface provides a way to configure various aspects of form fields,
 * such as their type, label, layout, and visibility in different views.
 */
export default interface IDashAutoAdminAttribute {
	/** Model attribute name, must match with the json endpoint */
	attribute: string;
	/** Label for the field */
	label?: string;
	/** Flag to indicate if this is a custom field (deprecated - use type: "component" instead) */
	custom?: boolean;
	/**
	 * Type definition for the attribute that determines how it's rendered
	 * Can be a component, function component, string, array, object, or constructor
	 * For paths like '/api/category/{id}/resource.name', wrap params in '{}'.
	 * type logic is at the core of AttributeToInput and AttributeToField component.
	 * Allows certain literals to resolve specific components.
	 * Specific case: e.g: '/api/category/{id}/resource.name'
	 * when a string is provided with a custom component literal such as AutoCompleteInput,
	 * it is possible to wrap a react router param name to the resource path '{}'
	 */
	type:
	| 'component'
	| React.FC<IRecord>
	| string
	| string[]
	| Object
	| DateConstructor
	| NumberConstructor
	| StringConstructor
	| IDashAutoAdminAttribute[];
	/** Position order of the field */
	position?: number;
	/** Layout position key for the field */
	layoutPosition?: React.Key;
	/** Input component configuration */
	input?: /*IntrinsicAttributes &*/ IDashAutoAdminCustomFieldComponent & {
		/** */
		children?: ReactNode;
	};
	/** Attribute name in the model */
	modelAttribute?: string;
	/** Variant style or type */
	variant?: any;
	/** Tab name where this field should appear */
	tab?: string;
	/** Whether to show in list view */
	inList?: boolean;
	/** Whether to show in drawer view */
	inDrawer?: boolean;
	/** Whether to show in show view */
	inShow?: boolean;
	/** Whether to show in edit view */
	inEdit?: boolean;
	/** Whether to show in create view */
	inCreate?: boolean;
	/** Whether to display the label */
	showLabel?: boolean;
	/** Whether field is extended */
	extended?: boolean;
	/** Whether field is read-only */
	readOnly?: boolean;
	/** Whether field is a password input */
	isPassword?: boolean;
	/** Additional field options */
	fieldOptions?: any;
	/** Action for the field : ReactNode | React.FC<IRecord> | ActionCallback;*/
	action?: any;
	/** Additional props for the component */
	componentProps?: any;
	/** Validation function for the field */
	validate?: (value: any, allValues: any) => void;
    /** Some components handle by default the react-hook-form error, use this prop to hide the DASH Auto default error message */
    hideErrorMessage?: boolean; 
	/** Whether to enable pagination */
	pagination?: boolean;
	/** Whether multiple values are allowed */
	multiple?: boolean;
	/** Whether field is sortable */
	sortable?: boolean;
	/** Custom component for rendering the field */
	component?: React.FC<IDashAutoAdminCustomFieldComponent> | ((props:IDashAutoAdminCustomFieldComponent) => JSX.Element);
	/** Field to use for search functionality */
	searchField?: string;
	/** Attribute to use for list display */
	listAttribute?: string;
	/** Whether field is a data form */
	isDataForm?: boolean;
	/** Processor type for the field */
	processor?: 'Blob' | 'RawFile' | 'Boolean' | 'Null' | string;
	/** When true, forces use of default schema show field even with custom component */
	useCustomShowField?: boolean;
}