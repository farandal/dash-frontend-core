/**
 * Profile menu generator for user navigation.
 *
 * Moved here from kt-utils (getProfileMenu.ts) per the profile/user resource
 * refactor - it is consumed by resources/User/profileResource.tsx, which now
 * also lives in this package, and doesn't depend on anything kitchntabs- or
 * vanexa-specific beyond the 'Cliente' role check below (kept verbatim - both
 * domains currently use it identically; a domain that needs a different
 * profile menu can still override profileResource.menu after importing it).
 */

import { dashStorage } from 'dash-utils';
import type IApplicationLayoutMenuItem from 'dash-auto-admin/src/interfaces/IDashApplicationLayoutMenuItem';

/**
 * Generates the profile menu based on user roles
 */
const getProfileMenu = (resourceConfig?: any): IApplicationLayoutMenuItem[] => {
    const userStr = dashStorage.getItem('user');
    const rolesStr = dashStorage.getItem('roles');

    const user = userStr ? JSON.parse(userStr) : null;
    const roles: any[] = rolesStr ? JSON.parse(rolesStr) : [];

    const profileMenu: IApplicationLayoutMenuItem[] = [
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
