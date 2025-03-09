/* deprecated used in domain */
//import { IApplicationLayoutMenuItem } from '@dash-auto-admin/interfaces';

import { IApplicationLayoutMenuItem } from "../layout/ApplicationLayout";

const getProfileMenu = (resourceConfig): IApplicationLayoutMenuItem[] => {
	const user = JSON.parse(localStorage.getItem('user'));
	const roles: any[] = JSON.parse(localStorage.getItem('roles'));

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
