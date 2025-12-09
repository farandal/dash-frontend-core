/**
 * Profile menu generator for user navigation
 */

import { dashStorage } from 'dash-utils';
import type { IAppLayoutMenuItem } from './interfaces';

/**
 * Generates the profile menu based on user roles
 */
const getProfileMenu = (resourceConfig?: any): IAppLayoutMenuItem[] => {
    const userStr = dashStorage.getItem('user');
    const rolesStr = dashStorage.getItem('roles');
    
    const user = userStr ? JSON.parse(userStr) : null;
    const roles: any[] = rolesStr ? JSON.parse(rolesStr) : [];

    const profileMenu: IAppLayoutMenuItem[] = [
        {
            title: 'Perfil',
            redirect: '/profile',
        },
    ];

    const isCliente = roles
        ? roles.map((role) => role.name).includes('Cliente')
        : false;

    if (isCliente) {
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
    }

    return profileMenu;
};

export default getProfileMenu;
export { getProfileMenu };
