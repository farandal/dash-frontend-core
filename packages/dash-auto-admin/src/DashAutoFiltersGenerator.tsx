import React from 'react';
import IReferenceFilter from './interfaces/IReferenceFilter';

import { TextInput, ReferenceInput, SelectInput, DateInput } from 'react-admin';

import IDashAutoAdminResourceConfig from './interfaces/IDashAutoAdminResourceConfig';

import { SelectArrayInput } from 'react-admin';

export const generateFilter = (
	r: IReferenceFilter,
	idx: React.Key,
): JSX.Element => {
	const {
		label,
		source,
		reference,
		optionText,
		alwaysOn = true,
		referenceComponent,
		fieldOptions = { fullWidth: true },
		inputOptions = {},
		multiple = false,
		date = false,
	} = r;

	// If not reference provided uses SelectArrayInput if multiple, or SelectInput if not.
	let ReferenceComponent = referenceComponent || SelectInput;

	if (reference && typeof reference === 'object') {
		if (multiple && !referenceComponent) {
			ReferenceComponent = SelectArrayInput;
		}

		return (
			<ReferenceComponent
				choices={reference}
				label={label}
				source={source}
				alwaysOn={alwaysOn}
				{...fieldOptions}
			/>
		);
	}

	if (!reference && referenceComponent) {
		return (
			<ReferenceComponent
				choices={reference}
				label={label}
				source={source}
				alwaysOn={alwaysOn}
				{...fieldOptions}
			/>
		);
	}

	if (reference) {
		return (
			<ReferenceInput
				key={idx}
				label={label}
				source={source}
				reference={reference}
				allowEmpty
				alwaysOn={alwaysOn}
				{...inputOptions}
			>
				<ReferenceComponent
					label={label}
					optionText={optionText}
					{...fieldOptions}
				/>
			</ReferenceInput>
		);
	}

	if (date) {
		return (
			<DateInput
				placeholder='Date'
				label={label}
				source={source}
				alwaysOn={alwaysOn}
				{...fieldOptions}
			/>
		);
	}

	return (
		<TextInput
			label={label}
			source={source}
			alwaysOn={alwaysOn}
			{...fieldOptions}
		/>
	);
};

const dashAutoFiltersGenerator = (
	resourceConfig: IDashAutoAdminResourceConfig,
): JSX.Element[] => {
	const referenceFilters: IReferenceFilter[] =
		resourceConfig?.referenceFilters || [];
	const filters: JSX.Element[] = [];

	if (referenceFilters && referenceFilters.length > 0) {
		referenceFilters.forEach((r, idx) => {
			filters.push(generateFilter(r, idx));
		});
	}

	return filters;
};

export default dashAutoFiltersGenerator;
