import React, { act, useCallback, useEffect, useState } from 'react';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
/*import { ICommunes } from '@app/interfaces/ICommunes'; */
import { useRecordContext, useUpdate } from 'react-admin';
import { Switch, Box } from '@mui/material';
import { FormControlLabel } from '@mui/material';
import { AttributeToField } from 'dash-auto-admin/src/mui/AttributeToField';
import AttributeToInput from 'dash-auto-admin/src/mui/AttributeToInput';

export interface IListActive extends IDashAutoAdminCustomFieldComponent {
	activeLabel?: string;
	inactiveLabel?: string;
	enableLabel?: string;
	disableLabel?: string;
}

const ListActive = ({
	method,
    attribute,
    resourceConfig,
    activeLabel = 'Activo',
    inactiveLabel = 'Inactivo',
    enableLabel = 'Activar',
    disableLabel = 'Desactivar',
    showLabel = false,
}: IListActive) => {
	const [ ,setLoading] = useState<boolean>(true);
	const [update, { isLoading: updateLoading }] = useUpdate();
	const record: any = useRecordContext();
	const [is_active, setIsActive] = useState<boolean>(false);
	const onError = (error: any) => {
		console.error(error);
	};

    const onChange = useCallback(
        async (value: boolean) => {
            /*window.dispatchEvent(
                new MessageEvent('dash-global-loader', { data: true })
            );*/
            
            try {
                await update(
                    resourceConfig.model + '/partial/' + record.id,
                    {
                        id: record.id,
                        data: { [attribute.attribute]: value },
                        previousData: record,
                        meta: {
                            method: 'POST',
                        }
                    },

                    {
                        onSuccess: () => {
                            // Force a refresh of the record context
                            setIsActive(value);
                        },
                        onSettled: (data, error) => {
                            if (error) onError(error);
                           /* window.dispatchEvent(
                                new MessageEvent('dash-global-loader', { data: false })
                            );*/
                        },
                    }
                );
            } catch (error) {
                onError(error);
            }
        },
        [update, record]
    );

	useEffect(() => {
		setLoading(false);
       
		if (record && attribute && attribute.attribute in record) {
			setIsActive(!!record[attribute.attribute]);
		}
	}, [record, attribute]);

	//const textSwitch = record[attribute.attribute] ? disableLabel : enableLabel;
	
    switch (method) {
		case 'create':
        case 'edit':
			return AttributeToInput(method, resourceConfig, {...attribute,custom:false,type:Boolean})
		case 'view':
            return AttributeToField(method, resourceConfig, {...attribute,custom:false,type:Boolean})
        case 'list':
			return (
				<div>
					<Box>
						<Switch
                           size='small'
							onChange={(e, value) => onChange(value)}
							checked={is_active}
						/>{showLabel ? (is_active ? activeLabel : inactiveLabel) : <></>}
					</Box>
				</div>
			)
		default:
			return <>{attribute.label}: {is_active ? activeLabel : inactiveLabel}</>;
	}
};

export default ListActive;