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
}: IListActive) => {
	const [ ,setLoading] = useState<boolean>(true);
	const [update, { isLoading: updateLoading }] =
		useUpdate();
	const record: any = useRecordContext();
	const onError = (error: any) => {
		console.error(error);
	};

    const onChange = useCallback(
        async (value: boolean) => {
            window.dispatchEvent(
                new MessageEvent('dash-global-loader', { data: true })
            );
            
            try {
                await update(
                    resourceConfig.model + '/change-status/' + record.id,
                    {
                        id: record.id,
                        data: { is_active: value },
                        previousData: record,
                    },
                    {
                        onSuccess: () => {
                            // Force a refresh of the record context
                            record.is_active = value;
                        },
                        onSettled: (data, error) => {
                            if (error) onError(error);
                            window.dispatchEvent(
                                new MessageEvent('dash-global-loader', { data: false })
                            );
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
	}, [record]);
	const is_active = record?.is_active ? true : false;
	const textSwitch = record?.is_active ? disableLabel : enableLabel;
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
                           
							onChange={(e, value) => onChange(value)}
							{...(is_active === true && { defaultChecked: true })}
						/>{is_active ? activeLabel : inactiveLabel}
					</Box>
				</div>
			)
		default:
			return <>{attribute.label}: {is_active ? activeLabel : inactiveLabel}</>;
	}
};

export default ListActive;