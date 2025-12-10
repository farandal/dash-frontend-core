import React from 'react';
import { RichTextInput } from 'ra-input-rich-text';
import { RichTextField } from 'react-admin';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';

const RichTextFieldEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({
	method,
	attribute,
}) => {
	return <RichTextInput label={attribute.label} source={attribute.attribute} />;
};

const RichTextFieldWrapper = ({
	method,
	attribute,
	resourceConfig,
}: IDashAutoAdminCustomFieldComponent) => {
	switch (method) {
		case 'edit':
		case 'create':
			return <RichTextFieldEdit attribute={attribute} method={method} resourceConfig={resourceConfig} />;
		case 'view':
			return <RichTextField source={attribute.attribute} />;
	}
};

export default RichTextFieldWrapper;
