import React, { JSX } from 'react';
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
		fieldProps = {},
        slotProps = {},
		inputOptions = {},
		multiple = false,
		date = false,
	} = r;

	// DEBUG: Log the filter configuration
	console.log('🔧 DashAutoFiltersGenerator DEBUG - generateFilter called:', {
		idx,
		label,
		source,
		reference,
		hasReferenceComponent: !!referenceComponent,
		fieldProps,
		timestamp: new Date().toISOString()
	});

	if (referenceComponent && !reference) {
		console.log('🔧 DashAutoFiltersGenerator DEBUG - Rendering with reference component (no reference):', {
			idx,
			source,
			label,
			referenceComponent: referenceComponent.name,
			fieldProps,
			timestamp: new Date().toISOString()
		});
		
		const ReferenceComponent = referenceComponent;
		
		// Use only fieldProps for all component props
		const finalProps = {
			source,
			label,
			alwaysOn,
			...fieldProps, // fieldProps contains all component-specific props
		};

		console.log('🔧 DashAutoFiltersGenerator DEBUG - Final props for reference component (DETAILED):', {
			idx,
			source,
			label,
			finalProps,
			fieldPropsResource: fieldProps?.resource,
			timestamp: new Date().toISOString()
		});
		
		return (
			<ReferenceComponent
				key={idx}
				{...finalProps}
			/>
		);
	}

	// If not reference provided uses SelectArrayInput if multiple, or SelectInput if not.
	let ReferenceComponent = referenceComponent || SelectInput;

	if (reference && typeof reference === 'object') {
		if (multiple && !referenceComponent) {
			ReferenceComponent = SelectArrayInput;
		}

		console.log('🔗 DashAutoFiltersGenerator DEBUG - Rendering with object reference:', {
			idx,
			source,
			label,
			reference,
			ReferenceComponent: ReferenceComponent.name,
			timestamp: new Date().toISOString()
		});

		return (
			<ReferenceComponent
				key={idx}
				choices={reference}
				label={label}
				source={source}
				alwaysOn={alwaysOn}
				{...fieldProps}
			/>
		);
	}

	if (reference) {
		console.log('🔗 DashAutoFiltersGenerator DEBUG - Rendering ReferenceInput:', {
			idx,
			source,
			label,
			reference,
			ReferenceComponent: ReferenceComponent.name,
			inputOptions,
			fieldProps,
			timestamp: new Date().toISOString()
		});
		
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
					{...fieldProps}
				/>
			</ReferenceInput>
		);
	}

	if (date) {
		console.log('📅 DashAutoFiltersGenerator DEBUG - Rendering DateInput:', {
			idx,
			source,
			label,
			fieldProps,
			timestamp: new Date().toISOString()
		});
		
		return (
			<DateInput
				key={idx}
				placeholder='Date'
				label={label}
				source={source}
				alwaysOn={alwaysOn}
				{...fieldProps}
			/>
		);
	}

	console.log('📝 DashAutoFiltersGenerator DEBUG - Rendering TextInput (default):', {
		idx,
		source,
		label,
		fieldProps,
		slotProps,
		timestamp: new Date().toISOString()
	});

	return (
		<TextInput
			key={idx}
			label={label}
			source={source}
			alwaysOn={alwaysOn}
			{...fieldProps}
            {...(slotProps ? { slotProps: slotProps } : {})}
		/>
	);
};

const dashAutoFiltersGenerator = (
	resourceConfig: IDashAutoAdminResourceConfig,
	locale?: string,
): JSX.Element[] => {
	const referenceFilters: IReferenceFilter[] =
		resourceConfig?.referenceFilters || [];
	const filters: JSX.Element[] = [];

	console.log('🏭 DashAutoFiltersGenerator DEBUG - dashAutoFiltersGenerator called:', {
		resourceConfig: resourceConfig?.model || 'unknown',
		filtersCount: referenceFilters.length,
		filters: referenceFilters.map(f => ({
			id: f.id,
			source: f.source,
			label: f.label,
			hasReferenceComponent: !!f.referenceComponent,
			fieldProps: f.fieldProps
		})),
		timestamp: new Date().toISOString()
	});

	if (referenceFilters && referenceFilters.length > 0) {
		referenceFilters.forEach((r, idx) => {
			filters.push(generateFilter(r, idx));
		});
	}

	return filters;
};

export default dashAutoFiltersGenerator;
