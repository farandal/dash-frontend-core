/**
 * React Auto Admin - SearchableSelect
 *
 * @author  Franisco Aranda <francisco.aranda@dash.cl> <faranda@gmail.com>
 */

import {
	Autocomplete,
	AutocompleteProps,
	Box,
	Checkbox,
	CircularProgress,
	TextField,
} from '@mui/material';
import React, { JSX, useEffect, useState } from 'react';
import { isArray } from 'lodash';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { useAxios } from 'dash-axios-hook';

export interface ISearchableSelect<
	T,
	//Multiple extends boolean | undefined = false,
	//DisableClearable extends boolean | undefined = false,
	//FreeSolo extends boolean | undefined = false,
> extends Omit<
	AutocompleteProps<T | string, boolean, boolean, boolean>,
	| 'renderInput'
	| 'options'
	| 'isOptionEqualToValue'
	| 'getOptionLabel'
	| 'renderOption'
	> {
	/** Options are ingored because they are calculated within this component */
	/** renderInput is ignored because is implemented privately within this component */

	name: string;
	/** url path to the resource, a getList or getForSelect e.g: 'system/user'  */
	resource: string;
	/** label for the select */
	selectLabel: string;
	/** Optional function to parse the item and return a string or JSX.Element to show in the selector list*/
	renderText?: (object: any) => string | JSX.Element;
	/** @deprecated Optional function will transform the item at the moment of field.onChange */
	transformData?: (val: any) => any;
	/** Optional defaultValue, or defaultValues array */
	defaultValues?: T | T[];

	/** @deprecated pagination, must be sent on filters */
	pagination?: boolean,
	/** Min character input to perform search */
	minSearch?: number;
	/** @deprecated searchResults, must be sent on filters as perPage */
	searchResults?: number;
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
	isOptionEqualToValue?: (option: T, value: T) => boolean;
	/**
	 * if not specified it will render the raw value for options
	 * if the response is not just a string or number array, you will have to specify which attribute from the option object you want to render
	 */
	renderAttribute?: string;
	/** elementKeyID, Advanced usage, by default id, specify the attribute from the option object representing the key or id */
	elementKeyId?: string;
	/** onChange */
	//onChange?: (value: T | T[]) => void;
	/* renderInputTextFieldProps - Partial<TextFieldProps> */
	renderInputTextFieldProps?: any; // It should be: Partial<TextFieldProps>
	checkboxes?: boolean;
	/**
	 * if its not possible to pass the default values according to the option interface, then set selectedIds, only works when multiple.
	 * once fetched the options and parsedOptions are available.
	 */
	selectedIds?: number[];
	useDefaultSearch?: boolean;
}

const icon = <CheckBoxOutlineBlankIcon fontSize='small' />;
const checkedIcon = <CheckBoxIcon fontSize='small' />;

const SearchableSelectCheckboxes = function WrappedAutoComplete<
	T,
>({ ...props }: ISearchableSelect<T>) {
	const {
		multiple,
		freeSolo,
		minSearch = 3,
		timerSearch = 500,
		checkboxes = false,
		resource,
		selectLabel,
		renderText,
		queryFilter = 'q',
		defaultValues = null,
		elementKeyId = 'id',
		isEmpty = false,
		filter,
		isOptionEqualToValue = (option, value) => value === option,
		renderAttribute = null,
		name,
		onChange,
		renderInputTextFieldProps,
		selectedIds,
		useDefaultSearch = false,
		...rest
	} = props;

	const [open, setOpen] = useState(false);
	const [parsedOptions, setParsedOptions] = useState<T[]>(null);
	const [q, setQ] = useState(null);

	const [resourceData, setResourceData] = useState(null);
	const [isLoading, setIsLoading] = useState(false);

	const [initialSelectedIds, setInitalSelectedIds] = useState(null);

	const initialIncludes =
	defaultValues && Array.isArray(defaultValues)
		? defaultValues.map((element: any) =>
			element[elementKeyId]
				? element[elementKeyId]
				: element)
		: multiple && initialSelectedIds
			? initialSelectedIds
			: defaultValues;


	const [includes, setIncludes] = useState(initialIncludes);

	const [controlledValue, setControlledValue] = useState<T | T[]>(null);
	const axios = useAxios();

	useEffect(() => {
		setInitalSelectedIds(selectedIds);
	}, []);

	const updateControlledValue = (val: T | T[], origin?: string) => {
		if (Array.isArray(val)) {
			setControlledValue(val as T[]);
			if ( origin === 'onChange') { setIncludes(val.map((v: any) => v[elementKeyId])); }
		} else {
			setControlledValue(val as T);
			if ( origin === 'onChange') { setIncludes((val as any)[elementKeyId]); }
		}
	};

	const search = async () => {
		setIsLoading(true);

		try {
			const params = { [queryFilter]: q, ...filter, includes: includes };

			const { data } = await axios.get(resource, {
				params,
			});

			setResourceData(data.data);
		} catch (e: any) {
			console.error(e);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		search();
	}, []);

	useEffect(() => {
		if (q && q !== '' && !useDefaultSearch) {
			search();
		}
	}, [q]);

	useEffect(() => {
		if (resourceData && !isLoading) {
			if (parsedOptions)
				setParsedOptions([
					...parsedOptions,
					...resourceData.map((ele: any) => {
						return { ...ele, key: 'option' + ele.id };
					}),
				]);
			setParsedOptions(
				resourceData.map((ele: any) => {
					return { ...ele, key: 'option' + ele.id };
				}),
			);
		}
		return () => setParsedOptions([]);
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

	const checkboxRenderOptions = (p, option, { selected }) => {
		const { key, ...r } = p as any;
		return (
			<li key={option.key} {...r}>
				<Checkbox
					icon={icon}
					checkedIcon={checkedIcon}
					style={{ marginRight: 8 }}
					checked={selected}
				/>

				{renderAttribute && !renderText
					? option[renderAttribute]
					: renderText(option)}
			</li>
		);
	};

	const boxRenderOptions = (p, option: any) => {
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
	};

	const _renderOption = checkboxes ? checkboxRenderOptions : boxRenderOptions;

	useEffect(() => {
		if (multiple && parsedOptions && initialSelectedIds) {
			const values = parsedOptions.filter((option: any) =>
				initialSelectedIds.includes(option[elementKeyId]),
			);
			updateControlledValue(values, 'selectedIds');
		}
	}, [parsedOptions, initialSelectedIds, multiple]);

	useEffect(() => {
		if (onChange &&
			controlledValue) {
			onChange(null, controlledValue as T | T[], null);
		}
	}, [controlledValue]);
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
					multiple={multiple}
					freeSolo={freeSolo}
					loading={isLoading && open}
					{...(checkboxes && { disableCloseOnSelect: true })}
					options={parsedOptions}
					open={open}
					onOpen={() => setOpen(true)}
					onClose={() => setOpen(false)}
					value={controlledValue ? controlledValue : multiple ? [] : null}
					
                    
                    /* @ts-ignore */
                    isOptionEqualToValue={isOptionEqualToValue}
					
                    autoHighlight
					getOptionLabel={(option: any) => {
						return renderAttribute && !renderText
							? option[renderAttribute]
							: (renderText ? renderText(option) : option)
					}
					}
					renderOption={_renderOption}
					onChange={(event: any, rawValue, _reason) => {
						updateControlledValue(rawValue as T | T[], 'onChange');
					}}
					renderInput={(params) => {
						return (
                            <TextField
                                key={params.id}
                                {...params}
                                label={selectLabel}
                                variant='outlined'
                                onChange={(ev) => {

									if(useDefaultSearch !== true) {
									const searchValue = ev.target.value;

									if (
										searchValue &&
										searchValue !== '' &&
										searchValue.length >= minSearch
									) {
									
										debounce(() => setQ(searchValue), timerSearch);
									}
								
									}
								}}
                                {...renderInputTextFieldProps}
                                slotProps={{
                                    ...params.slotProps,

                                    input: {
                                        ...params.slotProps.input,
                                        autoComplete: 'new-password',
                                        endAdornment: (
                                            <>
                                                {isLoading ? (
                                                    <CircularProgress color='inherit' size={20} />
                                                ) : null}
                                                {params.slotProps.input.endAdornment}
                                            </>
                                        ),
                                    }
                                }} />
                        );
					}}
					{...rest}
				/>
			)}
        </>
    );
};
export const MemoizedSearchableSelectCheckboxes = React.memo(
	SearchableSelectCheckboxes,
	() => {
		// never refresh
		return true;
	},
) as typeof SearchableSelectCheckboxes;

export default SearchableSelectCheckboxes;
