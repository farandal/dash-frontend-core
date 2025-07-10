import React, { useCallback, useEffect, useState } from 'react';
import { useRecordContext, useRefresh, CheckboxGroupInput, Loading, useEditContext } from 'react-admin';

import { Checkbox, Divider, FormHelperText } from '@mui/material';
import { Accordion, AccordionSummary, AccordionDetails, Typography, FormControlLabel } from '@mui/material';
// eslint-disable-next-line import/no-extraneous-dependencies
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
// eslint-disable-next-line import/no-extraneous-dependencies
import { useController, useFormContext, useFormState } from 'react-hook-form';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import { useAxios } from 'dash-axios-hook';

const PermissionsSelectorView: React.FC<IDashAutoAdminCustomFieldComponent> = ({
	_method,
	_attribute,
}) => {
	const record = useRecordContext();
	const [permissions, setPermissions] = useState<IPermissions[][]>([]);
	const [expanded, setExpanded] = useState<number | false>(0);

	const handleAccordionChange = (panel: number) => (event: React.SyntheticEvent, isExpanded: boolean) => {
		setExpanded(isExpanded ? panel : false);
	};

	useEffect(() => {
		if (record.permissions) {
			const groupedPermissions = record.permissions.reduce((acc, permission) => {
				const group = acc.find(g => g[0]?.group === permission.group);
				if (group) {
					group.push(permission);
				} else {
					acc.push([permission]);
				}
				return acc;
			}, [] as any[]);
			setPermissions(groupedPermissions);
		}
	}, [record]);

	return (
		<>
			{permissions?.map((tab, index) => (
				<Accordion 
					key={index}
					expanded={expanded === index}
					onChange={handleAccordionChange(index)}
				>
					<AccordionSummary expandIcon={<ExpandMoreIcon />}>
						<Typography>
							<b>{tab[0]?.group.charAt(0).toUpperCase() + tab[0]?.group.slice(1)}</b>
						</Typography>
					</AccordionSummary>
					<AccordionDetails>
						{tab.map((item, i) => (
							<div key={i}>
								<Typography>{item.name.split('.').pop()}</Typography>
							</div>
						))}
					</AccordionDetails>
				</Accordion>
			))}
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

const PermissionsSelectorBase: React.FC<IDashAutoAdminCustomFieldComponent> = ({
    _method,
    _attribute,
    _resourceConfig,
    record = null
}) => {
    const [permissionsData, setPermissionsData] = useState<IPermissions[][]>([]);
    const [parsedValues, setParsedValues] = useState([]);
    const axios = useAxios();
    const refresh = useRefresh();

    const form = useFormContext();
    const formState = useFormState();

    const permissionObjectsController = useController({ 
        name: 'permission_objects',
    });

    // Memoize the groupPermissionsData function
    const groupPermissionsData = useCallback((permissionItems: IPermissionItem[]) => {
        return permissionItems.reduce((acc, item) => {
            const group = acc.find(g => g[0].group === item.group);
            if (group) {
                const nameExists = group.some(existingItem => existingItem.name === item.name);
                if (!nameExists) {
                    group.push(item);
                }
            } else {
                acc.push([item]);
            }
            return acc;
        }, [] as IPermissionItem[][]);          
    }, []);

    // Memoize the getPermissions function with useCallback
    const getPermissions = useCallback(async () => {
        try {
            const { data } = await axios.get(
                'system/permissions/availablePermissions',
            );
            setPermissionsData(groupPermissionsData(data));
        } catch (error) {
            console.error('Failed to fetch permissions:', error);
        }
    }, [axios, groupPermissionsData]);

    useEffect(() => {
        if (formState.isSubmitSuccessful) {
            refresh();
        }
    }, [formState.isSubmitSuccessful, refresh]);

    // Use the memoized getPermissions in useEffect with proper dependencies
		useEffect(() => {
			if (formState.isSubmitSuccessful) {
				refresh();
			}
		}, [formState.isSubmitSuccessful]);

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

				setParsedValues(parsedCheckedFiltered);
			} else {
				setParsedValues([]);
			}
	
		}, [permissionsData, record]);

		const [expanded, setExpanded] = useState<number | false>(0);

		const handleAccordionChange = (panel: number) => (event: React.SyntheticEvent, isExpanded: boolean) => {
			setExpanded(isExpanded ? panel : false);
		};

		if (!permissionsData || !permissionsData.length) return <Loading />;
		if (record === null) return <Loading />;

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
								<b>{tab[0]?.group.charAt(0).toUpperCase() + tab[0]?.group.slice(1)}</b>
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

	const PermissionsSelectorEdit: React.FC<IDashAutoAdminCustomFieldComponent> = (props) => {
		const {record} = useEditContext();
		return <PermissionsSelectorBase {...props} record={record} />;
	};

	const PermissionsSelectorCreate: React.FC<IDashAutoAdminCustomFieldComponent> = (props) => {
		return <PermissionsSelectorBase {...props} record={{}} />;
	};

const PermissionsSelector = ({
	method,
	attribute,
    resourceConfig
}: IDashAutoAdminCustomFieldComponent) => {
	switch (method) {
		case 'edit':
            return <PermissionsSelectorEdit attribute={attribute} method={method} resourceConfig={resourceConfig} />;
		case 'create':
			return <PermissionsSelectorCreate attribute={attribute} method={method} resourceConfig={resourceConfig} />;
		case 'view':
			return <PermissionsSelectorView attribute={attribute} method={method} resourceConfig={resourceConfig} />;
	}
};

export default PermissionsSelector;