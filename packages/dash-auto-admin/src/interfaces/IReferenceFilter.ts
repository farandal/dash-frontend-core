import React, { FC } from 'react';
import {
	SelectInputProps,
	AutocompleteInputProps,
	SelectArrayInputProps,
	AutocompleteArrayInputProps,
} from 'react-admin';

/**
 * IReferenceFilter.
 *
 * @description
 *
 * Implemented in AutoFiltersGenerator.tsx
 * Used by the referenceFilter prop in IDashAutoAdminResourceConfig.
 */
export default interface IReferenceFilter {
	/** Id. */
	id: React.Key;
	/** Filter label. */
	label: string;
	/** Name of the field in the form. */
	source: string;
	/** Model that references or Array with option values. */
	reference: string | Array<Partial<{ /** */
		id: React.Key; /** */
		name: string }>>; // model that references or Enum
	/** */
	optionText: string;
	/** */
	date?: boolean;
	/** Always on feature from react-admin. */
	alwaysOn?: boolean;
	/** Allow to specify a reference component;  by default <SelectInput> | <SelectArrayInput/>, any other react admin component literal or even custom FC<any>. */
	referenceComponent?:
	| FC<AutocompleteInputProps>
	| FC<SelectInputProps>
	| FC<SelectArrayInputProps>
	| FC<AutocompleteArrayInputProps>
	| FC<any>;
	/**
	 * Props for the reference component, by default <SelectInput/> | <SelectArrayInput/> for single o multiple select filter.
	 * This includes props for custom components when using referenceComponent.
	 */
	fieldProps?: any;
    slotProps?: any;
	/**
	 * TODO: rename to referenceInputProps
	 * props for the reference input component <ReferenceInput/>.
	 */
	inputOptions?: any;
	/** Specify if the selection is multiple or single. */
	multiple?: boolean;

}
