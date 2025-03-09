import useAxios from '../../hooks/axios';

import React, { useCallback, useEffect, useState } from 'react';
import { useRecordContext, useRefresh, CheckboxGroupInput, Loading } from 'react-admin';

import { Checkbox, Divider, FormHelperText } from '@mui/material';
import { Accordion, AccordionSummary, AccordionDetails, Typography, FormControlLabel } from '@mui/material';
// eslint-disable-next-line import/no-extraneous-dependencies
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
// eslint-disable-next-line import/no-extraneous-dependencies
import { useController, useFormContext, useFormState } from 'react-hook-form';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';


const PermissionsSelectorView: React.FC<IDashAutoAdminCustomFieldComponent> = ({
	_method,
	_attribute,
}) => {
	const record = useRecordContext();
	const [permissions, setPermissions] = useState<IPermissions[][]>([]);

	useEffect(() => {
		if (record.permissions) {
			const _permissions = [];
			record.permissions.forEach((attribute: any) => {
				let added = false;
				permissions?.forEach((tab) => {
					const name = tab[0]?.group;

					if (name === attribute?.group) {
						tab.push(attribute);
						added = true;
					}
				});
				if (!added) {
					_permissions.push([attribute]);
				}
			});
			setPermissions(permissions);
		}
	}, [record]);

	return (
		<>
			{permissions?.map((tab, index) => {
				return (
					<div key={index}>
						
						<FormHelperText>Permisos de {tab[0]?.group}</FormHelperText>
						<span>
							{tab.map(
								(item, i) =>
									`${item.name} ${i !== tab.length - 1 ? ' | ' : ''}`,
							)}
						</span>
						{index !== permissions.length - 1 && <Divider />}
					</div>
				);
			})}
		</>
	);
};

interface IPermissions {
	group: string;
	name: string;
}

interface IPermissionItem {
	group: string;
	name: string;
	checked?: boolean;
	value?: string;
}

const PermissionsSelectorEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({
	_method,
	_attribute,
}) => {
	const [permissionsData, setPermissionsData] = useState<IPermissions[][]>([]);
	const [ReactCheckedPermissions, setCheckedPermissions] =
		useState<IPermissions[][]>(undefined);
	const [parsedValues, setParsedValues] = useState([]);
	const { axios } = useAxios();
	const refresh = useRefresh();
	const record = useRecordContext();
	const form = useFormContext();
	const formState = useFormState();
    
	const permissionObjectsController = useController({ 
		name: 'permission_objects',
		//control: form.control
	});
	const groupPermissionsData = useCallback((permissionItems: IPermissionItem[]) => {
		return permissionItems.reduce((acc, item) => {
			// Find the group in the accumulator
			const group = acc.find(g => g[0].group === item.group);
			if (group) {
				// Only add if the item name doesn't exist in this group
				const nameExists = group.some(existingItem => existingItem.name === item.name);
				if (!nameExists) {
					group.push(item);
				}
			} else {
				// If group does not exist, create a new group with the item
				acc.push([item]);
			}
			return acc;
		}, [] as IPermissionItem[][]);          
	}, []);
    
	const getPermissions = async () => {
		const { data } = await axios.get(
			'system/permissions/availablePermissions',
		);
		setPermissionsData(groupPermissionsData(data));
	};

	useEffect(() => {
		
		if (formState.isSubmitSuccessful) {
			// getPermissions();
			refresh();
		}
	}, [record, formState.isSubmitSuccessful]);

	useEffect(() => {
		getPermissions();
	}, []);
  
	useEffect(() => {

		if (record && record?.id && record.permissions) {
			const checked = permissionsData.map((tab) => {
				return tab.map((permission) => {
					return {
						group: permission.group,
						name: permission.name,
						checked: record.permissions.some((element) => element.route_name === permission.name ),
					};
				});
			});

			const parsedCheckedFiltered = [];
				
			checked.map((checkedItem) => {
				const found = [];
				checkedItem.forEach((item) => item.checked && found.push(item));
				return found.map((item) =>
					parsedCheckedFiltered.push({
						...item,
						value: JSON.stringify(checkedItem),
					}),
				);
			});

			setCheckedPermissions(parsedCheckedFiltered);
			setParsedValues(parsedCheckedFiltered);

		} else {
			setCheckedPermissions([]);
		}
	
	}, [permissionsData, record]);

	// Add state to track expanded panel
	const [expanded, setExpanded] = useState<number | false>(0);

	// Handle accordion change
	const handleAccordionChange = (panel: number) => (event: React.SyntheticEvent, isExpanded: boolean) => {
		setExpanded(isExpanded ? panel : false);
	};

	if (!permissionsData || permissionsData.length < 1) return <Loading />;
	if (!record) return <Loading />;

    
	return <>
		{permissionsData.map((tab, index) => {
			const checkedBool = parsedValues.filter((element: any) => element?.group === tab[0].group).length === tab.length;
			return (
				<Accordion 
					key={index}
					expanded={expanded === index}
					onChange={handleAccordionChange(index)}
				>
					<AccordionSummary expandIcon={<ExpandMoreIcon />}>
						<Typography>
							<b>Recurso: {tab[0]?.group.charAt(0).toUpperCase() + tab[0]?.group.slice(1)}</b>
								
						</Typography>
					</AccordionSummary>
					<AccordionDetails>

						<FormControlLabel
							value="end"
							control={<Checkbox
								checked={checkedBool}
								onChange={(event) => {
									event.stopPropagation(); 
									const _checked = event.target.checked;
									form.setValue('dirty', true, { shouldDirty: true });
									if (_checked) {
										const parsed = [
											...parsedValues,
											...tab.map((item) => ({
												checked: true,
												group: item.group,
												name: item.name,
												value: JSON.stringify(item),
											})),
										];
										setParsedValues(parsed);
										permissionObjectsController.field.onChange(parsed);
									} else {
										const filtered = parsedValues.filter(
											(ele) => ele.group !== tab[0]?.group,
										);
										permissionObjectsController.field.onChange(filtered);
										setParsedValues(filtered);
									}
								}}
							/>}
							label="Seleccionar Todos"
							labelPlacement="end"
						/>
							
                            

                
						<CheckboxGroupInput
							source={'permission_objects'}
							parse={(raw) => {
								try {
									const _return = [];
									raw.forEach((permission) => {
										const name = permission;
										let found;
										permissionsData.some((_tab) => {
											const founded = _tab.find((toFind) => toFind.name === name);
											if (founded) {
												found = {
                                                    group: founded.group,
                                                    name: founded.name
                                                };
                                                return founded;
											}
										});
										_return.push(found);
									});
									setParsedValues(_return.filter((item) => item !== undefined));
									return _return.filter((item) => item !== undefined);
								} catch (error) {
									console.log(error);
									return raw;
								}
							}}
							format={(_raw) => {
								try {
									const _return = parsedValues
										? parsedValues.map((item) => item?.name)
										: undefined;
									return _return;
								} catch (error) {
									console.log(error);
								}
							}}
							label={
								tab[0]?.group.charAt(0).toUpperCase() + tab[0]?.group.slice(1)
							}
							choices={tab.map((item, i) => ({
								...item,
								value: JSON.stringify(item),
								id: `${item.group}_${item.name}_${i}`,
							}))}
							optionText={(_record) => {
								return `${_record.name.split('.').pop()}`; 
							}}
							optionValue='name'
						/>
					</AccordionDetails>
				</Accordion>
			);
		})}
	</>;
};


const PermissionsSelector = ({
	method,
	attribute,
}: IDashAutoAdminCustomFieldComponent) => {
	switch (method) {
		case 'edit':
		case 'create':
			return <PermissionsSelectorEdit attribute={attribute} method={method} />;
		case 'view':
			return <PermissionsSelectorView attribute={attribute} method={method} />;
	}
};

export default PermissionsSelector;