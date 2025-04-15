import * as React from 'react';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import { FileField, FileInput, useRecordContext } from 'react-admin';
import { Box } from '@mui/material';
import { WithRecord } from 'react-admin';
import SingleImageUploader from './SingleImageUploader';
import { useFormContext } from 'react-hook-form';

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
				//{...method === "edit" && { currentUrl:record[_attributeName]} }
                {...method === "edit" && { currentUrl: `${record.image_path}`} }
                /*...method === "edit" && { currentUrl: `${new URL(record.image_url).origin}/${record.image_path}`} */
               
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
const Avatar = ({ method, attribute,resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
	switch (method) {
		case 'edit':
			return <AvatarHandler attribute={attribute} method={method} resourceConfig={resourceConfig} />;
		case 'create':
			return <AvatarHandler attribute={attribute} method={method} resourceConfig={resourceConfig} />;
		case 'view':
			return <></>;
	}
};
export default Avatar;
