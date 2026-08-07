import React from 'react';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import {
	PasswordInput,
} from 'react-admin';
import { Box } from '@mui/material';

/**
 * Generic password + confirm-password field pair for the shared user
 * resource schema. Moved from kt-ecommerce (components/User/Password.tsx) -
 * no kitchntabs- or vanexa-specific logic. Renamed from "Password" to avoid
 * ambiguity with other password-related components in this package.
 */
export type PasswordComponent = IDashAutoAdminCustomFieldComponent;
export const PasswordShow: React.FC<PasswordComponent> = (_props) => {
	return <></>;
};
export const PasswordEdit: React.FC<PasswordComponent> = (_props) => {

	return (
		<>
			<Box>
				<PasswordInput
					sx={{ width: '100%' }}
					autoComplete='off'
					source='Contraseña'
					name='password'
				/>
			</Box>
			<Box>
				<PasswordInput
					sx={{ width: '100%' }}
					autoComplete='off'
					source='Confirmar Contraseña'
					name='password_confirmation'
				/>
			</Box>
		</>
	);
};
export const PasswordCreate: React.FC<PasswordComponent> = (_props) => {


	return (
		<>
			<Box>
				<PasswordInput
					sx={{ width: '100%' }}
					source='Contraseña'
					name='password'
				/>
			</Box>
			<Box>
				<PasswordInput
					sx={{ width: '100%' }}
					source='Confirmar Contraseña'
					name='password_confirmation'
				/>
			</Box>
		</>
	);
};
const PasswordFields = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
	switch (method) {
		case 'edit':
			return <PasswordEdit attribute={attribute} method={method} resourceConfig={resourceConfig} />;
		case 'create':
			return <PasswordCreate attribute={attribute} method={method} resourceConfig={resourceConfig} />;
		case 'view':
			return <PasswordShow attribute={attribute} method={method} resourceConfig={resourceConfig} />;
	}
};
export default PasswordFields;
