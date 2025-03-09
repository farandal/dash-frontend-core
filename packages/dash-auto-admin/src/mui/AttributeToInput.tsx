import {
	ArrayInput,
	ImageInput,
	FileInput,
	BooleanInput,
	DateInput,
	DateTimeInput,
	NumberInput,
	SelectArrayInput,
	SelectInput,
	ChipField,
	ImageField,
	PasswordInput,
	ReferenceArrayInput,
	ReferenceInput,
	SimpleFormIterator,
	SingleFieldList,
	TextInput,
	useRecordContext,
} from 'react-admin';

import { InputAdornment, InputLabel } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';

import IDashAutoAdminAttribute from '../interfaces/IDashAutoAdminAttribute';
import IDashAutoAdminFormOptions from '../interfaces/IDashAutoAdminFormOptions';

import { UserAction } from '../wrappers';
import { FunctionField } from 'react-admin';
import { FileField } from 'react-admin';

import React, { JSX, useEffect } from 'react';
import IDashAutoAdminResourceConfig from '../interfaces/IDashAutoAdminResourceConfig';
import IDashAutoAdminCustomFieldComponent from '../interfaces/IDashAutoAdminCustomFieldComponent';
import enumToChoices from '../utils/enumToChoices';
import isEnum from '../utils/isEnum';
import { useLocation, useParams } from 'react-router';
import replaceParams from '../utils/replaceParams';
import { useSelector } from 'react-redux';
import { IDASHAppState } from 'dash-admin-state';


//export type ICustomRAButton<T extends RaRecord> = ShowButtonProps;
export interface IGroupExtraData {
	name: string;
	icon?: JSX.Element;
}

export interface IFieldWrapper {
	method: 'list' | 'view' | 'create' | 'edit';
	index: React.Key;
	input: IDashAutoAdminAttribute;
	children: JSX.Element;
}

const FunctionFieldWrapper = ({
	index,
	method,
	input,
	children,
	..._props
}: IFieldWrapper): JSX.Element => {
	const sortable = input?.sortable === true ? true : false;
	if (method === 'edit') {
		return (
			<div
				className={`auto-admin-field auto-admin-field-${method}`}
				key={index}
			>
				<FunctionField
					//key={index}
					label={input?.label || input.attribute}
					sortable={sortable}
					{...(sortable && { sortBy: input.listAttribute || input.attribute })}
					render={(record) => {
                     
						return React.cloneElement(children, { record: record });
					}}
				/>
			</div>
		);
	}
	return (
		<div className={`auto-admin-field auto-admin-field-${method}`} key={index}>
			{children}
		</div>
	);
};

/** 
 * The `AttributeToInput` function is a React component that renders an input field based on the provided `IDashAutoAdminAttribute` object. 
 * It handles various input types, including strings, numbers, booleans, dates, and enums. The function also supports custom components, reference inputs, and array inputs.
 * 
 * The function takes the following parameters:
 * - `method`: The current operation mode, such as 'list', 'view', 'create', or 'edit'.
 * - `resourceConfig`: The configuration object for the current resource.
 * - `input`: The `IDashAutoAdminAttribute` object that defines the input field.
 * - `index`: An optional index value for the input field.
 * - `options`: An optional object that provides additional configuration and field options.
 * 
 * The function returns a JSX element that represents the input field, wrapped in a `FunctionFieldWrapper` component. The `FunctionFieldWrapper` component handles the rendering of the input field based on the current operation mode.
*/
const AttributeToInput = (
	method: 'list' | 'view' | 'create' | 'edit',
	resourceConfig: IDashAutoAdminResourceConfig,
	input: IDashAutoAdminAttribute,
	index?: number,
	options?: IDashAutoAdminFormOptions,
) => {
	//export const AttributeToInput: React.FC<IAttributeToInput> = ({ input }) => {
	/*let filter: any = {};
  filter.pagination = input.pagination;
  filter.searchField = input.searchField;*/

	//const sortableField = input.sortable === true ? true : false;
 
	const mode = options?.mode || 'view';

	const record = useRecordContext();
	const location = useLocation();

	const params = useParams();

	const ComponentWrapper =
		resourceConfig?.fieldWrapper &&
		typeof resourceConfig.fieldWrapper === 'function'
			? resourceConfig.fieldWrapper
			: ({
				_record,
				_method,
				_attribute,
                _resourceConfig,
				children,
			}: IDashAutoAdminCustomFieldComponent) => {
				return children;
			};

	switch (input.type) {
		case 'string':
			input.type = String;
            input.fieldOptions = {
                ...(input.fieldOptions || {}),
                fullWidth: input?.fieldOptions?.fullWidth ?? true,            
            };
			break;
        case 'textarea':
            
			input.type = String;
            input.multiple = true;
            input.fieldOptions = {
                ...(input.fieldOptions || {}),
                multiline: input?.fieldOptions?.multiline ?? true,
                rows: input?.fieldOptions?.rows ?? 4,
                fullWidth: input?.fieldOptions?.fullWidth ?? true,            
            };
                
            
        
			//input.variant = "textarea";
			break;
		case 'number':
		case 'integer':
			input.type = Number;
			break;
		case 'boolean':
			input.type = Boolean;
			break;
		case 'date':
			input.type = Date;
			break;
	}

	if (options && options.useReadOnlyInputAsTextField && input.readOnly) {
		return (
			<FunctionFieldWrapper index={index} method={mode} input={input}>
				<ComponentWrapper
					key={index}
					label={input.label}
					source={input.listAttribute || input.attribute}
					{...(record && { record: record })}
					method={method}
					attribute={input}
                    resourceConfig={resourceConfig}
				>
					<TextInput
                      
						fullWidth
						{...(record && { record: record })}
						key={index}
						label={input.label}
						source={input.listAttribute || input.attribute}
						{...{
							...input.fieldOptions,
							editable: false,
							InputProps: {
								readOnly: true,
								endAdornment: (
									<InputAdornment position='start'>
										<Visibility />
									</InputAdornment>
								),
							},
						}}
                       
						/*options={{...input.fieldOptions,editable:false, InputProps:{readOnly: true}}}*/
					/>
				</ComponentWrapper>
			</FunctionFieldWrapper>
		);
	} else if (options && options.readOnlyComponent && input.readOnly) {
		return (
			<FunctionFieldWrapper index={index} method={mode} input={input}>
				<ComponentWrapper
					{...(record && { record: record })}
					method={method}
					attribute={input}
					key={index}
					label={input.label}
					source={input.listAttribute || input.attribute}
                    resourceConfig={resourceConfig}
				>
					<options.readOnlyComponent
						fullWidth
						key={index}
						{...(record && { record: record })}
						input={input}
						label={input.label}
						source={input.listAttribute || input.attribute}
						{...{
							...input.fieldOptions,
							editable: false,
							InputProps: { readOnly: true },
						}}
						/*options={{...input.fieldOptions,editable:false, InputProps:{readOnly: true}}}*/
					/>
				</ComponentWrapper>
			</FunctionFieldWrapper>
		);
	}

	/* Force the attribute name to be the label, if not label provided */
	if (!input.label) input.label = input.attribute;

	if (
		(input.custom && input.component) ||
		(input.type === 'component' && input.component)
	) {
        
		return (
			<FunctionFieldWrapper index={index} method={mode} input={input}>
               
				<UserAction
					record={record}
					key={index}
					method={mode}
					attribute={input}
                    resourceConfig={resourceConfig}
				/>
              
			</FunctionFieldWrapper>
		);
	}

	if (Array.isArray(input.type) && input.type.length > 0) {
		const inputType: string | IDashAutoAdminAttribute = input.type[0];
		/* Array of enum values – We use a SelectArrayInput */
		if (isEnum(inputType)) {
			return (
				<FunctionFieldWrapper index={index} method={mode} input={input}>
					<SelectArrayInput
						key={index}
						fullWidth
						label={input.label}
						source={input.attribute}
						choices={enumToChoices(inputType)}
						{...input?.fieldOptions}
                        onChange={e => {
                            if(options?.handleChange) {
                                options.handleChange(e);
                            } 
                            if(input.fieldOptions?.onChange) {
                                input.fieldOptions.onChange(e)
                            }
                        }}
                       
					/>
				</FunctionFieldWrapper>
			);
		}
		/* Recurse */

		if (typeof inputType === 'string') {

			const _params = { ...params, ...(location.hash.match(/\d+/g) || []).map(Number).reduce((acc, curr, currentIndex) => {
				acc[currentIndex] = curr;
				return acc;
			}, {}) };
		
			const _inputType = replaceParams(_params, inputType);
			const [reference, sourceName] = _inputType.split('.');
			const safeIfNull = (choice: any) =>
				(choice ? choice[sourceName] : '?') || '??';

			//   let filter:any = {};
			//   if(input.pagination) filter.pagination = input.pagination;
			//   if(input.searchField) filter.searchField = input.searchField;
			if (input && input.multiple === false && input.component) {
				const CustomComponent = input.component;
				return (
					<FunctionFieldWrapper index={index} method={mode} input={input}>
						<ReferenceInput
							key={index}
							fullWidth
							allowEmpty
							//sort={{ field: 'name', order: 'asc' }}
							filter
							pagination={false}
							label={input.label}
							reference={reference}
							source={input.attribute}
							//queryOptions={{ refetchOnWindowFocus: false }}
							{...input.componentProps}
						>
							<CustomComponent
								optionText={safeIfNull}
								//queryOptions={{ refetchOnWindowFocus: false }}
								method={'edit'} // edit because its AttributeToInput
								attribute={input}
                                onChange={e => {
                                    if(options?.handleChange) {
                                        options.handleChange(e);
                                    } 
                                    if(input.fieldOptions?.onChange) {
                                        input.fieldOptions.onChange(e)
                                    }
                                }}
                                resourceConfig={resourceConfig}
							/>
						</ReferenceInput>
					</FunctionFieldWrapper>
				);
			}

			return (
				<FunctionFieldWrapper index={index} method={mode} input={input}>
					<ReferenceArrayInput
						key={index}
						fullWidth
						filter
						/*allowEmpty*/
						pagination={false}
						label={input.label}
						reference={reference}
						source={input.attribute}
						{...input.componentProps}
						//queryOptions={{ refetchOnWindowFocus: false }}
					>
						{/*input.component === 'AutocompleteInput'  ? <AutocompleteInput  optionText={safeIfNull} /> : <SelectInput optionText={safeIfNull}  />*/}

						<SingleFieldList /*link='show'*/>
							<ChipField source={sourceName} /*link='show'*/ />
						</SingleFieldList>
						{/* <input.component  optionText={safeIfNull} /> */}
					</ReferenceArrayInput>
				</FunctionFieldWrapper>
			);
		} else {
			const inputTypeArray = input.type as IDashAutoAdminAttribute[];

			return (
				<FunctionFieldWrapper index={index} method={mode} input={input}>
					<ArrayInput
						key={index}
						//fullWidth
						label={input.label}
						source={input.attribute}
						//queryOptions={{ refetchOnWindowFocus: false }}
					>
						<SimpleFormIterator>
							{inputTypeArray.map((attribute, idx) =>
								AttributeToInput(method, resourceConfig, attribute, idx),
							)}
						</SimpleFormIterator>
					</ArrayInput>
				</FunctionFieldWrapper>
			);
		}
	}

	if (input && input.type === ImageInput) {
		return (
			<FunctionFieldWrapper index={index} method={mode} input={input}>
				<ImageInput
					key={index}
					placeholder={'Arrástre una imágen o haga click aquí para seleccionar'}
					source={input.attribute}
					label={input.label}
					accept='image/*'
					{...input.fieldOptions}
					//queryOptions={{ refetchOnWindowFocus: false }}
                    
				>
					<ImageField source='src' title='title' />
				</ImageInput>
			</FunctionFieldWrapper>
		);
	}

	if (input && input.type === FileInput) {
		<FunctionFieldWrapper index={index} method={mode} input={input}>
			<FileInput
				key={index}
				placeholder={'Arrástre un archivo o haga click aquí para seleccionar'}
				source={input.attribute}
				label={input.label}
				{...input.fieldOptions}
			>
				<FileField source='src' title='title' />
			</FileInput>
		</FunctionFieldWrapper>;
	}

  
	/* Special cases – Passing strings, passing enums */
	if (typeof input.type === 'string') {

        
		/* table.field */

		const _params = { ...params, ...(location.pathname.match(/\d+/g) || []).map(Number).reduce((acc, curr, currentIndex) => {
			acc[currentIndex] = curr;
			return acc;
		}, {}) };


		const _inputType = replaceParams(_params, input.type);
		const [reference, sourceName] = _inputType.split('.');
		const CustomComponent = input.component || SelectInput;
		if (input && input.multiple === false) {
			return (
				<FunctionFieldWrapper index={index} method={mode} input={input}>
					<ReferenceInput
						key={index}
						fullWidth
						allowEmpty
						filters
						label={input.label}
						source={input.attribute}
						reference={reference}
						sort={{ field: sourceName, order: 'ASC' }}
						//queryOptions={{ refetchOnWindowFocus: false }}
						{...input.componentProps}
					>
						<CustomComponent
							optionText={sourceName}
							//queryOptions={{ refetchOnWindowFocus: false }}
							method={'edit'} // edit because its AttributeToInput
							attribute={input}
							fullWidth
							label={input?.label || ''}
							{...input.fieldOptions}
                            onChange={e => {
                               
                                if(options?.handleChange) {
                                    options.handleChange(e);
                                } 
                                if(input.fieldOptions?.onChange) {
                                    input.fieldOptions.onChange(e)
                                }
                            }}
                            resourceConfig={resourceConfig}
						/>
					</ReferenceInput>
				</FunctionFieldWrapper>
			);
		}

		return (
			<FunctionFieldWrapper index={index} method={mode} input={input}>
				<ReferenceArrayInput
					key={index}
					reference={reference}
					source={input.attribute}
					//queryOptions={{ refetchOnWindowFocus: false }}
					{...input.componentProps}
				>
					{/*<input.component optionText={sourceName} />*/}
					{/*<SingleFieldList >
              <ChipField source={sourceName}  />
         </SingleFieldList>*/}
					<SelectArrayInput
						optionText={sourceName}
						//queryOptions={{ refetchOnWindowFocus: false }}
						fullWidth
						label={input?.label || ''}
						{...input.fieldOptions}
                        onChange={e => {
                            if(options?.handleChange) {
                                options.handleChange(e);
                            } 
                            if(input.fieldOptions?.onChange) {
                                input.fieldOptions.onChange(e)
                            }
                        }}
					/>
				</ReferenceArrayInput>
			</FunctionFieldWrapper>
		);
	}

	switch (input.type) {
		case Number:
			return (
				<FunctionFieldWrapper index={index} method={mode} input={input}>
					<NumberInput
						key={index}
						fullWidth
						label={input.label}
						source={input.attribute}
						/*options={input.fieldOptions}*/
						{...input.fieldOptions}
                        onChange={e => {
                            if(options?.handleChange) {
                                options.handleChange(e);
                            } 
                            if(input.fieldOptions?.onChange) {
                                input.fieldOptions.onChange(e)
                            }
                        }}
					/>
				</FunctionFieldWrapper>
			);

		case Boolean:
			return (
				<FunctionFieldWrapper index={index} method={mode} input={input}>
					<>
						{input?.showLabel !== false && (
							<InputLabel htmlFor={input.listAttribute || input.attribute}>
								{input.label}
							</InputLabel>
						)}
						<BooleanInput
							record={record}
							key={index}
							id={input.listAttribute || input.attribute}
							label={input.label}
							source={input.listAttribute || input.attribute}
							{...input.fieldOptions}
                            onChange={e => {
                                if(options?.handleChange) {
                                    options.handleChange(e);
                                } 
                                if(input.fieldOptions?.onChange) {
                                    input.fieldOptions.onChange(e)
                                }
                            }}
						/>
					</>
				</FunctionFieldWrapper>
			);

		case Date:
			return input.fieldOptions && input.fieldOptions.showTime ? (
				<FunctionFieldWrapper index={index} method={mode} input={input}>
					<DateTimeInput
						key={index}
						label={input.label}
						source={input.attribute}
						/*options={{ ...input.fieldOptions, ampm: false }}*/
						{...input.fieldOptions}
					/>
				</FunctionFieldWrapper>
			) : (
				<FunctionFieldWrapper index={index} method={mode} input={input}>
					<DateInput
						key={index}
						label={input.label}
						source={input.attribute}
						/*options={input.fieldOptions}*/
						{...input.fieldOptions}
                        onChange={e => {
                            if(options?.handleChange) {
                                options.handleChange(e);
                            } 
                            if(input.fieldOptions?.onChange) {
                                input.fieldOptions.onChange(e)
                            }
                        }}
					/>
				</FunctionFieldWrapper>
			);
	}
	if (isEnum(input.type)) {
		return (
			<FunctionFieldWrapper index={index} method={mode} input={input}>
				<SelectInput
					key={index}
					label={input.label}
					source={input.attribute}
					choices={enumToChoices(input.type)}
					//queryOptions={{ refetchOnWindowFocus: false }}
					options={input.fieldOptions}
                    onChange={e => {
                        if(options?.handleChange) {
                            options.handleChange(e);
                        } 
                        if(input.fieldOptions?.onChange) {
                            input.fieldOptions.onChange(e)
                        }
                    }}
				/>
			</FunctionFieldWrapper>
		);
	}

	if (input.isPassword) {
		return (
			<FunctionFieldWrapper index={index} method={mode} input={input}>
				<PasswordInput
					key={index}
					label={input.label}
					source={input.attribute}
					/*options={input.fieldOptions}*/
				/>
			</FunctionFieldWrapper>
		);
	}

	return (
		<FunctionFieldWrapper index={index} method={mode} input={input}>
       
			<TextInput
				key={index}
				label={input.label}
				source={input.listAttribute || input.attribute}
				{...input.fieldOptions}
                onChange={e => {
                  
                    if(options?.handleChange) {
                        options.handleChange(e);
                    } 
                    if(input.fieldOptions?.onChange) {
                        input.fieldOptions.onChange(e)
                    }
                }}
			/>
		</FunctionFieldWrapper>
	);
};

export default AttributeToInput;
