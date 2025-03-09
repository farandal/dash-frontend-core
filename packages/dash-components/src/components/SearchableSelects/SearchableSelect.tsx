/**
 * React Auto Admin - SearchableSelect
 *
 * @author  Franisco Aranda <francisco.aranda@dash.cl> <faranda@gmail.com>
 * @author  Omar Muñoz <omar.munoz@dash.cl>
 */

import {
	Autocomplete,
	AutocompleteProps,
	Box,
	CircularProgress,
	TextField,
} from '@mui/material';
import React, { JSX, useEffect, useState } from 'react';
import { useController } from 'react-hook-form';
import { useGetList } from 'react-admin';
import { isArray } from 'lodash';

export interface ISearchableSelect<
	T,
	Multiple extends boolean | undefined,
	DisableClearable extends boolean | undefined,
	FreeSolo extends boolean | undefined = undefined,
> extends Omit<AutocompleteProps<T | string, Multiple, DisableClearable, FreeSolo>, 'renderInput' | 'options'> {
	/** Options are ingored because they are calculated within this component */
	/** renderInput is ignored because is implemented privately within this component */

	name: string;
	/** url path to the resource, a getList or getForSelect e.g: 'system/user'  */
	resource: string;
	/** label for the select */
	selectLabel: string;
	/** Optional function to parse the item and return a string or JSX.Element to show in the selector list*/
	renderText?: (object: any) => string | JSX.Element;
	/** Optional function will transform the item at the moment of field.onChange */
	transformData?: (val: any) => any;
	/** Optional defaultValue, or defaultValues array */
	defaultValues?: any;
	/** Specify if the component must handle multiple options */
	isMultiple?: boolean;
	/** @deprecated pagination, must be sent on filters */
	//pagination?: boolean,
	/** Min character input to perform search */
	minSearch?: number;
	/** @deprecated searchResults, must be sent on filters as perPage */
	//searchResults?: number;
	/** Search after x ms */
	timerSearch?: number;
	/** isEmpty - TODO: this flow is not tested. */
	isEmpty?: boolean;
	/** filter - optional parameters for the axios query */
	filter?: { [x: string]: any };
	/** name of the query parameter, usually just 'q' or 'search' */
	queryFilter?: string;
	/**
	 * The default function will compare the raw values equality
	 * the edge case is when a transformData is implemented, then the isOptionEqualToValue will have to compare to the transformation output.
	 * e.g: isOptionEqualToValue={(option, value) => value === option.id }
            transformData={(data) => data?.id || null}
	 */
	isOptionEqualToValue?: (option, value) => boolean;
	/**
	 * if not specified it will render the raw value for options
	 * if the response is not just a string or number array, you will have to specify which attribute from the option object you want to render
	 */
	renderAttribute?: string;
	/** elementKeyID, Advanced usage, by default id, specify the attribute from the option object representing the key or id */
	elementKeyId?: string;
	/** onChange */
	onChange?: (value: any) => void;
	/* renderInputTextFieldProps - Partial<TextFieldProps> */
	renderInputTextFieldProps?: any; // It should be: Partial<TextFieldProps>
}

const SearchableSelect = function WrappedAutoComplete<
	T,
	Multiple extends boolean | undefined = undefined,
	DisableClearable extends boolean | undefined = undefined,
	FreeSolo extends boolean | undefined = undefined,
>({ ...props }: ISearchableSelect<T, Multiple, DisableClearable, FreeSolo>) {
	const {
		isMultiple = false,
		//pagination = true,
		//searchResults = 50,
		minSearch = 3,
		timerSearch = 500,
		resource,
		selectLabel,
		renderText,
		transformData,
		queryFilter = 'q',
		defaultValues = undefined,
		elementKeyId = 'id',
		isEmpty = false,
		filter,
		isOptionEqualToValue = (option, value) => value === option,
		renderAttribute = null,
		name,
		onChange,
		renderInputTextFieldProps,
		//..._rest
	} = props;
	//const element_key = "system_marketplace_category_id";
	const [open, setOpen] = useState(false);
	/* parsedOptions se setea null, esto para que el control no aparezca hasta que se obtenga la data */
	const [parsedOptions, setParsedOptions] = useState(null);
	const [q, setQ] = useState('');

	const field = useController({
		name: name,
		defaultValue: defaultValues ? defaultValues : null,
	});
	const includes =
		defaultValues && isArray(defaultValues)
			? defaultValues.map((element) =>
				element[elementKeyId]
					? element[elementKeyId]
					: element)
			: defaultValues;

	const {
		data: resourceData,
		isLoading,
	} = useGetList(
		resource,
		{
			filter: { [queryFilter]: q, ...filter, includes: includes },
		},
		{ refetchOnWindowFocus: false },
	);

	useEffect(() => {
		if (resourceData && !isLoading) {
			//Le agrega el key, para evitar el warning de react.
			//setParsedOptions([...parsedOptions,...resourceData.map(ele => { return {...ele,key:"option"+ele.id}})])
			if (parsedOptions)
				setParsedOptions([
					...parsedOptions,
					...resourceData.map((ele) => {
						return { ...ele, key: 'option' + ele.id };
					}),
				]);
			setParsedOptions(
				resourceData.map((ele) => {
					return { ...ele, key: 'option' + ele.id };
				}),
			);
		} /*else {
            // Setea la data a un arreglo vacío, ya que si es null, se ocultará el componente.
            //setParsedOptions([]);
       }*/
		return () => setParsedOptions([]);
		// TODO! reset callback, empty parsedOptions.
	}, [resourceData, isLoading]);

	const [timeOutSearch, setTimeOutSearch] = useState(undefined);

	const debounce = (fn: Function, delay = 500) => {
		clearTimeout(timeOutSearch);
		setTimeOutSearch(
			setTimeout(() => {
				fn();
			}, delay),
		);
	};

	const calculateDefaultValue = () => {
		let value = null;
		if (isMultiple) value = [];
		if (isMultiple && field.field.value && Array.isArray(field.field.value))
			value = field.field.value;
		if (isMultiple && field.field.value && !Array.isArray(field.field.value))
			value = [field.field.value];
		if (!isMultiple && field.field.value) value = field.field.value;
		return value;
	};

	const defaultValue = calculateDefaultValue();

	return (
		<>
			{isLoading && !parsedOptions ? (
				<CircularProgress color='inherit' size={20} />
			) : (
				<></>
			)}
			{parsedOptions && (
				<Autocomplete
					key={'autocomplete-' + name}
					multiple={isMultiple}
					loading={isLoading && open}
					//sx={{ width: 373 }}
					fullWidth
					freeSolo={true}
					//options={!resourceData ? [] : !defaultValues ? resourceData : resourceData}
					//options={resourceData ? resourceData.map(ele => { return {...ele,key:ele.id}} ) : []}
					options={parsedOptions}
					open={open}
					onOpen={() => setOpen(true)}
					onClose={() => setOpen(false)}
					/*defaultValue={field.field?.value && field.field.value.map(item => parsedOptions.find(
                    (element) => { 
                        
                        return element.id === item.id
                    }))}*/
					//value={isOptionEqualToValue && parsedOptions ? parsedOptions.find(ele => isOptionEqualToValue(ele,field.field.value))[renderAttribute] : field.field.value}

					defaultValue={defaultValue}
					//value={field.field.value}

					isOptionEqualToValue={isOptionEqualToValue}
					autoHighlight
					//{...(!isEmpty && { value: field.field.value })}
					//{...(isEmpty && { renderTags: (value, getTagProps) => <></> })}
					// 8

					getOptionLabel={(option: any) => {
						const _option = !Array.isArray(option) // si es un numero como 'id', busca la opción en los valores con isOptionEqualToValue, sino devuelve el objeto original.
							? parsedOptions &&
						parsedOptions.find((ele) =>
							isOptionEqualToValue(ele, field.field.value))
							: option;
						if (!_option) return q; //es posbile que no se haya encontrado en parsedOptions o que parsedOptions aún no esté definido.
						const r =
							renderAttribute && !renderText
								? _option[renderAttribute]
								: renderText(_option);
						/*console.log(
              "getOptionLabel",
              parsedOptions.find((ele) =>
                isOptionEqualToValue(ele, field.field.value)
              ),
              r
            );*/
						if (!r) return q;
						return r;
					}}
					//getOptionLabel={(option: any) => option}

					renderOption={(p, option: any) => {
						const { key, ...newProps } = p as any;

						return (
							<Box
								key={option.key}
								component='li'
								sx={{ '& > img': { mr: 2, flexShrink: 0 } }}
								{...newProps}
							>
								{renderAttribute && !renderText
									? option[renderAttribute]
									: renderText(option)}
							</Box>
						);
					}}
					onChange={(event: any, rawValue) => {
						//console.log("onChange", event, rawValue);
						let newValue = rawValue;

						if (Array.isArray(rawValue)) {
							newValue = isEmpty
								? [...rawValue, ...field.field.value]
								: [...new Map(newValue.map((v) => [v.id, v])).values()];
						}
						if (transformData) {
							field.field.onChange(transformData(newValue));
						} else {
							field.field.onChange(newValue);
						}

						if (onChange) { onChange(newValue); }
					}}
					renderInput={(params) => {
						//console.log("renderInput", params.id);
						return (
							<TextField
								key={params.id}
								{...params}
								label={selectLabel}
								variant='outlined'
								onChange={(ev) => {
									// dont fire API if the user delete or not entered anything
									const searchValue = ev.target.value;
									//onSearch={(searchValue) => {}

									if (
										searchValue &&
										searchValue !== '' &&
										searchValue.length >= minSearch
									)
										debounce(() => setQ(searchValue), timerSearch);

									/*if (ev.target.value !== "" || ev.target.value !== null) {
                                setQ(ev.target.value);
                            }*/
								}}
								//onBlur={() => setQ('')}
								InputProps={{
									...params.InputProps,
									autoComplete: 'new-password',
									endAdornment: (
										<>
											{isLoading ? (
												<CircularProgress color='inherit' size={20} />
											) : null}
											{params.InputProps.endAdornment}
										</>
									),
								}}
								{...renderInputTextFieldProps}
							/>
						);
					}}
				/>
			)}
		</>
	);
};

export default SearchableSelect;
