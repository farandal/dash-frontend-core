import * as React from 'react';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import { useRecordContext } from 'react-admin';
import { SingleImageUploader } from 'dash-components';
import { useFormContext } from 'react-hook-form';

export type AvatarComponent = IDashAutoAdminCustomFieldComponent;

export const AvatarHandler: React.FC<AvatarComponent> = (props) => {
	const { method, attribute } = props;
	const record = useRecordContext();
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
				{...method === "edit" && { currentUrl: `${record.image_path}`} }
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

/**
 * Generic user-avatar upload field for the shared user resource schema.
 *
 * Moved from kt-ecommerce (components/User/Avatar.tsx) - purely generic
 * (dash-auto-admin/dash-components/react-hook-form only, no kitchntabs- or
 * vanexa-specific logic), so it belongs alongside userSchema.tsx here rather
 * than duplicated per domain. Renamed from "Avatar" to avoid colliding with
 * dash-admin's unrelated components/user/AvatarComponent.tsx (the topbar
 * user-menu avatar widget - a different component for a different purpose).
 */
const AvatarUploadField = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
	switch (method) {
		case 'edit':
			return <AvatarHandler attribute={attribute} method={method} resourceConfig={resourceConfig} />;
		case 'create':
			return <AvatarHandler attribute={attribute} method={method} resourceConfig={resourceConfig} />;
		case 'view':
			return <></>;
	}
};
export default AvatarUploadField;
