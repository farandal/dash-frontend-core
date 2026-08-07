import * as React from 'react';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import { FileField, FileInput, useRecordContext } from 'react-admin';
import { Box } from '@mui/material';
import { WithRecord } from 'react-admin';
import SingleImageUploader from './SingleImageUploader';
import { useFormContext } from 'react-hook-form';
import AvatarMui from '@mui/material/Avatar';

export type AvatarComponent = IDashAutoAdminCustomFieldComponent;

export const AvatarHandler: React.FC<AvatarComponent> = (props) => {
	const { method, attribute } = props;
	const record = useRecordContext();
	const _attributeName = attribute.listAttribute || attribute.attribute;
	const {
		setValue,
		formState: { errors },
	} = useFormContext();

	const onChange = (file: File) => {
		setValue(attribute.attribute, file, { shouldDirty: true });
	};
    
	return (
		<>
			<SingleImageUploader
				classNamePrefix='dash-profile'
				{...(method === "edit" && record && record[_attributeName]
					? { currentUrl: record[_attributeName] }
					: {})}
				onChange={onChange}
			/>
			{errors[attribute.attribute] && (
				<span style={{ color: 'red' }}>
					{errors[attribute.attribute]?.message?.toString() || 'Error'}
				</span>
			)}
		</>
	);
};

export const AvatarDisplay: React.FC<AvatarComponent> = (props) => {
	const { attribute } = props;
	const record = useRecordContext();
	const _attributeName = attribute.listAttribute || attribute.attribute;
	const imageUrl = record?.[_attributeName];
   
	return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center"
            }}>
            <AvatarMui src={imageUrl} alt="avatar" />
        </Box>
    );
};

const Avatar = ({ method, attribute,resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
	switch (method) {
		case 'edit':
        case 'create':
			return <AvatarHandler attribute={attribute} method={method} resourceConfig={resourceConfig} />;
		case 'view':
        case 'list':
			return <AvatarDisplay  attribute={attribute} method={method} resourceConfig={resourceConfig} />;
	}
};
export default Avatar;

