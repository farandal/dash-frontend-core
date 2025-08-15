/* deprecated used in domain */
//import { IApplicationLayoutMenuItem } from '@dash-auto-admin/interfaces';

import { IApplicationLayoutMenuItem } from "../layout/ApplicationLayout";
import { dashStorage } from 'dash-utils';

const getProfileMenu = (resourceConfig): IApplicationLayoutMenuItem[] => {
	const user = JSON.parse(dashStorage.getItem('user'));
	const roles: any[] = JSON.parse(dashStorage.getItem('roles'));

	const profileMenu = [
		{
			title: 'Perfil',
			redirect: '/profile',
		},
	];

	const isCliente = roles
		? roles.map((role) => role.name).includes('Cliente')
		: false;

	isCliente &&
		profileMenu.push(
			{
				title: 'Comunas',
				redirect: '/profile/commune',
			},
			{
				title: 'Centros Logísticos',
				redirect: '/profile/logistic-center',
			},
			{
				title: 'Notificaciones',
				redirect: '/profile/notification',
			},
		);

	return profileMenu;
};

export default getProfileMenu;
