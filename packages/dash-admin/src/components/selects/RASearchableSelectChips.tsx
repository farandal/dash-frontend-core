/**
 * ISearchableSelect for AutoAdmin for ReactAdmin
 * @author  Franisco Aranda <francisco.aranda@dash.cl> <faranda@gmail.com>
 * @author  Omar Muñoz <omar.munoz@dash.cl>
 */

import {
	Autocomplete,
	Box,
	Chip,
	CircularProgress,
	InputLabel,
	TextField,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useController } from 'react-hook-form';
import { useGetList } from 'react-admin';
import { IDashAutoAdminCustomFieldComponent } from 'panel/dash-auto-admin/src';
import { useRecordContext } from 'react-admin';
import { Loading } from 'react-admin';
import { isArray } from 'lodash';
import { LoadingIndicator } from 'react-admin';

interface ISearchableSelectChipsControl {
	name?: string;
	resource?: string;
	selectLabel?: string;
	title?: string;
	renderText: (option: any, caller: string) => any;
	transformData?: (val: any) => any; // onChange transformData from the search result item object to the field value (it usually needs to store the id)
	defaultValues?: any;
	isMultiple?: boolean;
	//pagination?: boolean,
	minSearch?: number;
	searchResults?: number;
	timerSearch?: number;
	isEmpty?: boolean;
	filter?: { [x: string]: any };
	queryFilter?: string;
	isOptionEqualToValue: (option: any, value: any) => boolean;
	//_transformOptionEqualToValue?:  (option: any, value: any) => boolean
	viewAttribute: string;
	valueKeyId?: string;
	useBaseAttributeName?: boolean;
	useListAttributeForController?: boolean;
	transformOption?: (
		option: any,
		parsedOptions: any[],
		caller?: string,
	) => boolean;
}

const getDescendantProp = (obj, desc) => {
	var arr = desc.split('.');
	while (arr.length && (obj = obj[arr.shift()]));
	return obj;
};

export const SearchableSelectChipsControl: React.FC<
	ISearchableSelectChipsControl & IDashAutoAdminCustomFieldComponent
> = ({
	method,
	attribute,
	isMultiple = false,
	//pagination = true,
	searchResults = 50,
	minSearch = 3,
	timerSearch = 500,
	resource,
	selectLabel,
	renderText,
	transformData = (val: any) => val,
	queryFilter = 'q',
	defaultValues = undefined,
	isEmpty = false,
	filter,
	isOptionEqualToValue = undefined,
	viewAttribute = null,
	valueKeyId = 'id',
	useBaseAttributeName = false,
	useListAttributeForController = false,
	transformOption,
}) => {
	// React Admin record
	//console.log("useListAttributeForController", useListAttributeForController);
	let attributeName = useListAttributeForController
		? attribute.listAttribute
		: attribute.attribute;
	attributeName = useBaseAttributeName
		? attributeName.split('.')[0]
		: attributeName;
	//console.log("attributeName", attributeName);
	const record = useRecordContext();
	const recordAttributeValue = useBaseAttributeName
		? attributeName.split('.')[0]
		: attributeName;
	//console.log("RECORD VALUE", recordAttributeValue, record[recordAttributeValue]);
	// sets the initial state of the select dropdown
	const [open, setOpen] = useState(false);
	// parsedOptions: stores the postprocessed list of elements returned from the search query
	const [parsedOptions, setParsedOptions] = useState(null);
	// q; the search query
	const [q, setQ] = useState('');
	// field, checks if the current record contains associated values to the attribute in which this control is associated
	//console.log("USE CONTROLLER name", attributeName, attribute.attribute, record[recordAttributeValue]);
	const _transformOption = (option: any, caller: string) => {
		return typeof transformOption === 'function'
			? transformOption(option, parsedOptions, caller)
			: option;
	};

	const _processFieldValue = (value: any) => {
		return value
			? isMultiple && Array.isArray(value)
				? value.map((valItem) =>
						_transformOption(valItem, '_processFieldValue'),
				  )
				: _transformOption(value, '_processFieldValue')
			: isMultiple
			? []
			: null;
	};

	const _defaultValues = defaultValues
		? _processFieldValue(defaultValues)
		: record && getDescendantProp(record, recordAttributeValue)
		? _processFieldValue(getDescendantProp(record, recordAttributeValue))
		: isMultiple
		? []
		: null;

	const field = useController({ name: attributeName /*, defaultValue*/ });
	// Includes, sends an array of the current selected items of the select, the backend sends those items in the first position of the list.
	let _inc =
		record && getDescendantProp(record, recordAttributeValue)
			? getDescendantProp(record, recordAttributeValue)
			: [];
	_inc = isArray(_inc) ? _inc : [_inc[valueKeyId]];

	const includes = _inc
		.filter((element) => element)
		.map((element) =>
			element.hasOwnProperty(valueKeyId) ? element[valueKeyId] : element,
		);

	// React Admin useGetList, to perform the search

	const {
		data: resourceSearchResults,
		total: totalSearchResults,
		isLoading: isResourceSearchLoading,
		error: isResourceSearchErrored,
	} = useGetList(resource, {
		meta: { removeSortFilters: true },
		filter: { [queryFilter]: q, ...filter, includes: includes },
	});

	useEffect(() => {
		if (resourceSearchResults /*&& !isResourceSearchLoading*/) {
            const resultsArray = Array.isArray(resourceSearchResults) 
      ? resourceSearchResults 
      : Object.values(resourceSearchResults);
    
    const _parsedOptions = resultsArray.map((ele) => {
      return { ...ele, key: "option" + ele.id };
    });
			setParsedOptions(_parsedOptions);
			//updateFieldValue(_parsedOptions);
		}
		// on component unload, set parsedOptions to []
	}, [resourceSearchResults /*, isResourceSearchLoading*/]);

	// search timeout
	const [timeOutSearch, setTimeOutSearch] = useState(undefined);
	// search debounde
	const debounce = (fn: Function, delay = 500) => {
		clearTimeout(timeOutSearch);
		setTimeOutSearch(
			setTimeout(() => {
				fn();
			}, delay),
		);
	};

	const updateFieldValue = (value) => {
		const val = _processFieldValue(value);
		//console.log("UPDATE FIELD VALUES", val)
		field.field.onChange(val);
	};

	/* useEffect(() => {
          if (field && field.field && parsedOptions) { 
              updateFieldValue(record[recordAttributeValue]); 
          }
      }, [parsedOptions])*/

	return (
		<>
			{parsedOptions ? (
				<Autocomplete
					key={'autocomplete-' + attribute.attribute}
					multiple={isMultiple}
					loading={isResourceSearchLoading /*&& open*/}
					fullWidth
					freeSolo={true}
					options={parsedOptions}
					open={open}
					onOpen={() => setOpen(true)}
					onClose={() => setOpen(false)}
					defaultValue={_defaultValues}
					isOptionEqualToValue={isOptionEqualToValue}
					autoHighlight
					getOptionLabel={(option: any) =>
						renderText(_transformOption(option, 'optionlabel'), 'optionlabel')
					}
					renderOption={(props, option: any) => {
						const { key, ...newProps } = props as any;
						return (
							<Box
								key={option.key}
								component='li'
								sx={{ '& > img': { mr: 2, flexShrink: 0 } }}
								{...newProps}
							>
								{renderText(_transformOption(option, 'option'), 'option')}
							</Box>
						);
					}}
					onChange={(event: any, rawValue) => {
						setOpen(false);
						updateFieldValue(rawValue);
					}}
					renderInput={(params) => {
						return (
							<TextField
								key={params.id}
								{...params}
								label={selectLabel}
								variant='outlined'
								onChange={(ev) => {
									let searchValue = ev.target.value;
									if (
										searchValue &&
										searchValue !== '' &&
										searchValue.length >= minSearch
									)
										debounce(() => setQ(searchValue), timerSearch);
								}}
								InputProps={{
									...params.InputProps,
									autoComplete: 'new-password',
									endAdornment: (
										<>
											{isResourceSearchLoading ? (
												<CircularProgress color='inherit' size={20} />
											) : null}
											{params.InputProps.endAdornment}
										</>
									),
								}}
							/>
						);
					}}
				/>
			) : (
				<LoadingIndicator />
			)}

			{!isMultiple && parsedOptions && _defaultValues && (
				<>
					<Chip
						label={renderText(_transformOption(_defaultValues, 'chip'), 'chip')}
					/>
				</>
			)}
		</>
	);
};

const RASearchableSelectChips: React.FC<
	IDashAutoAdminCustomFieldComponent & ISearchableSelectChipsControl
> = ({ method, attribute, ...props }) => {
	switch (method) {
		case 'edit':
		case 'create':
			return (
				<SearchableSelectChipsControl
					attribute={attribute}
					method={method}
					{...props}
				/>
			);
		case 'view':
			return (
				<SearchableSelectChipsControl
					attribute={attribute}
					method={method}
					{...props}
				/>
			);
	}
};

export default RASearchableSelectChips;
