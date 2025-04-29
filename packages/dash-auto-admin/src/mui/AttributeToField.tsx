import { InputLabel } from '@mui/material';

import {
	ImageInput,
	FileInput,
	DateTimeInput,
	ArrayField,
	BooleanField,
	ChipField,
	Datagrid,
	DateField,
	NumberField,
	ImageField,
	ReferenceArrayField,
	ReferenceField,
	SingleFieldList,
	TextField,
	FileField,
	FunctionField,
} from 'react-admin';

import IDashAutoAdminAttribute from '../interfaces/IDashAutoAdminAttribute';
import IDashAutoAdminFormOptions from '../interfaces/IDashAutoAdminFormOptions';

import { UserAction } from '../wrappers';
import ListStringsField from './components/ListStringField';
import IRecord from '../interfaces/IRecord';
import React from 'react';
import IDashAutoAdminResourceConfig from '../interfaces/IDashAutoAdminResourceConfig';
import IDashAutoAdminCustomFieldComponent from '../interfaces/IDashAutoAdminCustomFieldComponent';
import isEnum from '../utils/isEnum';
import replaceParams from '../utils/replaceParams';
import { useParams } from 'react-router';

export const AttributeToField = (
	method: 'view' | 'list' | 'create' | 'edit',
	resourceConfig: IDashAutoAdminResourceConfig,
	input: IDashAutoAdminAttribute,
	index?: number,
	options?: IDashAutoAdminFormOptions,
	resource?: string,
	record?: IRecord,
) => {

	const params = useParams();
	
	const sortableField = input.sortable === true ? true : false;

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

	record = options?.record ? options.record : record;
	/*if(typeof resourceConfig.customShowField === "function" && ["view"].includes(method) && input.useCustomShowField === true ) {
    return <FunctionField
        key={`function_field_${index}`}
        label={input.label}
        sortable={sortableField}
        {...(sortableField && { sortBy: input.listAttribute || input.attribute })}
        render={record => {
          return <resourceConfig.customShowField
            key={`custom_component_${index}`}
            {...(record && { record: record })}
            method={method}
            attribute={input}
          />
        }
        }
      />
  }*/

	//export const AttributeToField: React.FC<IAttributeToField> = ({ input }) => {
	// @TODO: Ningun componente de input se puede dibujar en el metodo view, porque no hay un formulario (react hook controller)

	if (
		options &&
		options.useReadOnlyInputAsTextField === true &&
		input.readOnly
	) {
		return (
			<ComponentWrapper
				key={index}
				label={input.label}
				sortable={sortableField}
				source={input.listAttribute ? input.listAttribute : input.attribute}
				{...(record && { record: record })}
				method={method}
				attribute={input}
                resourceConfig={resourceConfig}
			>
				<TextField
					//fullWidth
					{...(record && { record: record })}
					sortable={sortableField}
					{...(sortableField && {
						sortBy: input.listAttribute || input.attribute,
					})}
					key={index}
					label={input.label}
					source={input.listAttribute ? input.listAttribute : input.attribute}
					{...{
						...input.fieldProps,
						editable: false,
						InputProps: { readOnly: true },
					}}
					disabled
					/*options={{...input.fieldProps,editable:false, InputProps:{readOnly: true}}}*/
				/>
			</ComponentWrapper>
		);
	} else if (options && options.readOnlyComponent && input.readOnly) {
		return (
			<ComponentWrapper
				{...(record && { record: record })}
				method={method}
				attribute={input}
				key={index}
				label={input.label}
				sortable={sortableField}
				source={input.listAttribute ? input.listAttribute : input.attribute}
                resourceConfig={resourceConfig}
			>
				<options.readOnlyComponent
					// fullWidth
					key={index}
					{...(record && { record: record })}
					sortable={sortableField}
					{...(sortableField && {
						sortBy: input.listAttribute || input.attribute,
					})}
					input={input}
					label={input.label}
					source={input.listAttribute ? input.listAttribute : input.attribute}
					{...{
						...input.fieldProps,
						editable: false,
						InputProps: { readOnly: true },
					}}
					/*options={{...input.fieldProps,editable:false, InputProps:{readOnly: true}}}*/
				/>
			</ComponentWrapper>
		);
	}

    // CUSTOM COMPONENT
	if (
		(input.custom && input.component) ||
		(input.type === 'component' && input.component)
	) {

        if(method === "create") {
         
            console.log("input.custom", input.custom);
        }
		/*if (options?.mode === "edit") {
      
      return record ?
        
        <UserAction 
            key={index}
            {...(record && { record: record })}  
            method={"edit"} 
            attribute={input} 
        />

        : 
        
        <FunctionField
          key={index}
          label={input.label}
          sortable={input.sortable === true ? true : false}
          render={record => {
              return <UserAction record={record} method={"edit"} attribute={input} />
            }
          }
        />

    }*/
     
		return (
			<FunctionField
				key={`function_field_${index}`}
				label={input.label}
				sortable={sortableField}
				{...(sortableField && {
					sortBy: input.listAttribute || input.attribute,
				})}
				render={(r) => {
					return <ComponentWrapper
							{...(r && { record: r })}
							method={method}
							attribute={input}
							key={index}
							label={input.label}
							sortable={sortableField}
							source={
								input.listAttribute ? input.listAttribute : input.attribute
							}
                            resourceConfig={resourceConfig}
						>
							<UserAction
								key={`custom_component_${index}`}
								{...(r && { record: r })}
								method={method}
								attribute={input}
                                resourceConfig={resourceConfig}
							/>
						</ComponentWrapper>
                       
				}}
			/>
		);
	}
   
	if (Array.isArray(input.type) && input.type.length > 0) {
		const inputType: string | IDashAutoAdminAttribute = input.type[0];

		/* Force the label to be the attribute name */
		if (!input.label) {
			input.label = input.attribute;
		}
		/* Array of enum values – We use a SelectArrayInput */
		if (isEnum(inputType)) {
			return (
				<ComponentWrapper
					{...(record && { record: record })}
					method={method}
					attribute={input}
					key={index}
					label={input.label}
					sortable={sortableField}
					source={input.listAttribute ? input.listAttribute : input.attribute}
                    resourceConfig={resourceConfig}
				>
					<ListStringsField
						key={index}
						label={input.label}
						source={input.listAttribute ? input.listAttribute : input.attribute}
						map={inputType}
					/>
				</ComponentWrapper>
			);
		}

		if (typeof inputType === 'string') {

			const _params = {...params,...(location.hash.match(/\d+/g) || []).map(Number).reduce((acc, curr, index) => {
				acc[index] = curr;
				return acc;
			}, {})};
		
			const _inputType = replaceParams(_params,inputType);
			
			const [reference, sourceName] = _inputType.split('.');
           
			return (
				<ComponentWrapper
					{...(record && { record: record })}
					method={method}
					attribute={input}
					key={index}
					label={input.label}
					sortable={sortableField}
					source={input.listAttribute ? input.listAttribute : input.attribute}
                    resourceConfig={resourceConfig}
				>
					<>
						<ReferenceArrayField
							//fullWidth
							key={index}
							sortable={sortableField}
							{...(sortableField && {
								sortBy: input.listAttribute || input.attribute,
							})}
							label={input.label} /*link='show'*/
							source={
								input.listAttribute ? input.listAttribute : input.attribute
							}
							reference={reference}
						>
							<SingleFieldList /*link='show'*/>
								<ChipField source={sourceName} /*link='show'*/ />
							</SingleFieldList>
						</ReferenceArrayField>
					</>
				</ComponentWrapper>
			);
		} else {
			const inputTypeArray = input.type as IDashAutoAdminAttribute[];
			return (
				<ComponentWrapper
					{...(record && { record: record })}
					method={method}
					attribute={input}
					key={index}
					label={input.label}
					sortable={sortableField}
					source={input.listAttribute ? input.listAttribute : input.attribute}
                    resourceConfig={resourceConfig}
				>
					<>
						<ArrayField
							key={index}
							//fullWidth
							sortable={sortableField}
							{...(sortableField && {
								sortBy: input.listAttribute || input.attribute,
							})}
							label={input.label}
							source={
								input.listAttribute ? input.listAttribute : input.attribute
							}
						>
							<Datagrid>
								{inputTypeArray.map((attribute, idx) =>
									AttributeToField(
										method,
										resourceConfig,
										attribute,
										idx,
										options,
									),
								)}
							</Datagrid>
						</ArrayField>
					</>
				</ComponentWrapper>
			);
		}
	}

	if (typeof input.type === 'string') {

		const _params = {...params,...(location.hash.match(/\d+/g) || []).map(Number).reduce((acc, curr, index) => {
			acc[index] = curr;
			return acc;
		}, {})};

        
		const  _inputType = replaceParams(_params,input.type);
		const [reference, sourceName] = _inputType.split('.');

        // TODO: pagination in ra was moved, and searchField must be optional, its being appended in all field. 
        // filters function deprecated for now.
		/*
        
        const filter: any = {};
		filter.pagination = input.pagination;
		filter.searchField = input.searchField;

        */


		// console.log("input pagination", input.pagination, input);
		if (input && input.multiple === false) {

				const componentWrapperProps = {
					...(record && { record: record }),
					method,
					attribute: input,
					//key: index,
					label: input.label,
					sortable: sortableField,
					source: input.listAttribute ? input.listAttribute : input.attribute,
					resourceConfig
				}

				const componentProps = {
					//key: index,
					...(record && { record: record }),
					sortable: sortableField,
					...(sortableField && {
						sortBy: input.listAttribute || input.attribute,
					}),
					label: input.label,
					link: 'show',
					source: input.listAttribute ? input.listAttribute : input.attribute,
					reference: reference
				}			
                
                //console.log("AttributeToField: ReferenceField",componentProps);                                                                                                                                                               return (
				
                return <ComponentWrapper
					{...componentWrapperProps}
				>
					<ReferenceField
						{...componentProps}
					/>
					{/*<TextField
							{...(record && { record: record })}
							source={sourceName}
						/>
					</ReferenceField>*/}
				</ComponentWrapper>
			
		}

        const componentWrapperProps = {
            ...(record && { record: record }),
            method: method,
            attribute: input,
            //key: index,
            label: input.label,
            sortable: sortableField,
            source: input.listAttribute ? input.listAttribute : input.attribute,
            resourceConfig: resourceConfig
        }		
        
        const componentProps = {
			//key: index,
			...(record && { record: record }),
            sortable: sortableField,
			...(sortableField && {
				sortBy: input.listAttribute || input.attribute,
			}),
			//pagination: filter.pagination,
			//filter: filter,
			label: input.label,
			source: input.listAttribute ? input.listAttribute : input.attribute,
			reference: reference
		}
        //console.log("AttributeToField: ReferenceArrayField",componentProps);       
		return (
			<ComponentWrapper {...componentWrapperProps} >
			<ReferenceArrayField {...componentProps} >
                            <SingleFieldList /*link='show'*/>
								<ChipField source={sourceName} /*link='show'*/ />
							</SingleFieldList>
            </ReferenceArrayField>	
			</ComponentWrapper>
		);
	}

	switch (input.type) {
		case Number:
			//console.log("Number",input);

			return (
				<FunctionField
					label={input.label}
					sortable={sortableField}
					{...(sortableField && {
						sortBy: input.listAttribute || input.attribute,
					})}
					key={`function_field_${index}`}
					render={(r) => {
						return (
							<ComponentWrapper
								{...(r && { record: r })}
								method={method}
								attribute={input}
								key={index}
								label={input.label}
								sortable={sortableField}
								source={
									input.listAttribute ? input.listAttribute : input.attribute
								}
                                resourceConfig={resourceConfig}
							>
								<NumberField
									key={`number_field_${index}`}
									label={input.label}
									{...(record && { record: record })}
									//fullWidth
									sortable={input.sortable === true ? true : false}
									source={
										input.listAttribute ? input.listAttribute : input.attribute
									}
									/*options={input.fieldProps}*/
									{...input.fieldProps}
								/>
							</ComponentWrapper>
						);
					}}
				/>
			);
		/*return record ?
        <NumberField 
          fullWidth 
          record={record} 
          sortable={input.sortable === true ? true : false} 
          key={index} 
          label={input.label} 
          source={input.listAttribute ? input.listAttribute : input.attribute} 
          {...input.fieldProps} 
       />
    : 
      
    <FunctionField
          label={input.label}
          sortable={input.sortable === true ? true : false}
          render={(record) => <NumberField 
                                    record={record} 
                                    fullWidth 
                                    sortable={input.sortable === true ? true : false} 
                                    key={index} 
                                    label={input.label} 
                                    source={input.listAttribute ? input.listAttribute : input.attribute} 
                                    {...input.fieldProps} 
                                />
                  }
      />*/

		case Boolean: // LIST
			//console.log("Boolean",input);
			return record ? (
				<>
					{input?.showLabel !== false && (
						<ComponentWrapper
							{...(record && { record: record })}
							method={method}
							attribute={input}
							key={index}
							label={input.label}
							sortable={sortableField}
							source={
								input.listAttribute ? input.listAttribute : input.attribute
							}
                            resourceConfig={resourceConfig}
						>
							<InputLabel
								htmlFor={
									input.listAttribute ? input.listAttribute : input.attribute
								}
							>
								{input.label}
							</InputLabel>
						</ComponentWrapper>
					)}
					<ComponentWrapper
						{...(record && { record: record })}
						method={method}
						attribute={input}
						key={index}
						label={input.label}
						sortable={sortableField}
						source={input.listAttribute ? input.listAttribute : input.attribute}
                        resourceConfig={resourceConfig}
					>
						<BooleanField
							sortable={sortableField}
							{...(sortableField && {
								sortBy: input.listAttribute || input.attribute,
							})}
							record={record}
							key={index}
							id={input.listAttribute ? input.listAttribute : input.attribute}
							label={input.label}
							source={
								input.listAttribute ? input.listAttribute : input.attribute
							}
							/*options={input.fieldProps}*/
							{...input.fieldProps}
						/>
					</ComponentWrapper>
				</>
			) : (
				<FunctionField
					label={input.label}
					sortable={sortableField}
					{...(sortableField && {
						sortBy: input.listAttribute || input.attribute,
					})}
					render={(r) => (
						<>
							{/*input?.showLabel !== false && <InputLabel htmlFor={input.listAttribute ? input.listAttribute : input.attribute}>{input.label}</InputLabel>*/}
							<ComponentWrapper
								{...(r && { record: r })}
								method={method}
								attribute={input}
								key={index}
								label={input.label}
								sortable={sortableField}
								source={
									input.listAttribute ? input.listAttribute : input.attribute
								}
                                resourceConfig={resourceConfig}
							>
								<BooleanField
									record={record}
									/*sortable={false}*/
									key={index}
									id={
										input.listAttribute ? input.listAttribute : input.attribute
									}
									label={input.label}
									source={
										input.listAttribute ? input.listAttribute : input.attribute
									}
									/*options={input.fieldProps}*/
									{...input.fieldProps}
								/>
							</ComponentWrapper>
						</>
					)}
				/>
			);

		case DateTimeInput:
		case Date:
			return (
				<ComponentWrapper
					{...(record && { record: record })}
					method={method}
					attribute={input}
					label={input.label}
					sortable={sortableField}
					source={input.listAttribute ? input.listAttribute : input.attribute}
					key={index}
                    resourceConfig={resourceConfig}
				>
					<DateField
						{...(record && { record: record })}
						key={index}
						sortable={sortableField}
						{...(sortableField && {
							sortBy: input.listAttribute || input.attribute,
						})}
						label={input.label}
						showTime={
							(input.fieldProps && input.fieldProps.showTime) || false
						}
						source={input.listAttribute ? input.listAttribute : input.attribute}
						/*options={input.fieldProps}*/
						{...input.fieldProps}
					/>
				</ComponentWrapper>
			);

		case ImageInput:
			return (
				<ComponentWrapper
					{...(record && { record: record })}
					method={method}
					attribute={input}
					key={index}
					label={input.label}
					sortable={sortableField}
					source={input.listAttribute ? input.listAttribute : input.attribute}
                    resourceConfig={resourceConfig}
				>
					<ImageField
						{...(record && { record: record })}
						sortable={sortableField}
						{...(sortableField && {
							sortBy: input.listAttribute || input.attribute,
						})}
						//fullWidth
						key={index}
						source={input.attribute}
						label={input.label}
					/>
				</ComponentWrapper>
			);

		case FileInput:
			return (
				<ComponentWrapper
					{...(record && { record: record })}
					method={method}
					attribute={input}
					key={index}
					label={input.label}
					sortable={sortableField}
					source={input.listAttribute ? input.listAttribute : input.attribute}
                    resourceConfig={resourceConfig}
				>
					<FileField
						{...(record && { record: record })}
						sortable={sortableField}
						{...(sortableField && {
							sortBy: input.listAttribute || input.attribute,
						})}
						//fullWidth
						key={index}
						source={input.listAttribute ?? input.attribute}
						title={input.listAttribute}
						download={true}
					/>
				</ComponentWrapper>
			);
	}

	/* if(typeof resourceConfig.customShowField === "function" && ["view"].includes(method) ) {
    return <FunctionField
        key={`function_field_${index}`}
        label={input.label}
        sortable={sortableField}
        {...(sortableField && { sortBy: input.listAttribute || input.attribute })}
        render={record => {
          return <resourceConfig.customShowField
            key={`custom_component_${index}`}
            {...(record && { record: record })}
            method={method}
            attribute={input}
          />
        }
        }
      />
  }*/
const textFieldProps = {
    ...(record && { record: record }),
    //fullWidth
    sortable: sortableField,
    ...(sortableField && {
        sortBy: input.listAttribute || input.attribute,
    }),
    //key: index,
    label: input.label,
    source: input.listAttribute ? input.listAttribute : input.attribute,
    /*options={input.fieldProps}*/
    ...input.fieldProps,
    ...(input.slotProps ? { slotProps: input.slotProps } : {})
}    

    //console.log("AttributeToField: TextField",textFieldProps);

	return (
		<ComponentWrapper
			label={input.label}
			sortable={sortableField}
			source={input.listAttribute ? input.listAttribute : input.attribute}
			{...(record && { record: record })}
			method={method}
			attribute={input}
			//key={index}
            resourceConfig={resourceConfig}
		>
			<TextField
				{...textFieldProps}
			/>
		</ComponentWrapper>
	);
};
