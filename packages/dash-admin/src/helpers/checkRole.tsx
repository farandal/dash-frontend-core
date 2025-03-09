import { getCookie } from '../utils/cookies';

/**
 * Checks if the current user has the specified roles or permissions.
 *
 * @param permissions - An array of permission names to check.
 * @param roles - An array of role names to check.
 * @returns True if the user has the specified roles or permissions, false otherwise.
 */
const checkRole = (permissions, roles) => {
	const debug = false;
	if (debug) console.info('Check Roles', permissions, roles);
	
	if ((Array.isArray(roles) && roles.includes('*'))) return true;

	const userRoles = localStorage.getItem('roles');
	const userPermissions = localStorage.getItem('permissions');

	
	const processedPermissions = {
		roles: Array.isArray(JSON.parse(userRoles)) ? JSON.parse(userRoles).map((item) => item.name) : [],
		list: userPermissions ? JSON.parse(userPermissions) : {},
	};

	if (debug) console.info('Checking if processedPermissions exists', processedPermissions);
	if (!processedPermissions) return false;
	
	if (!Object.prototype.hasOwnProperty.call(processedPermissions, 'roles')) return false;

	if (!roles) return true;


	const cookie_tenant_id = getCookie('tenant_id');
	if (roles.includes('HAS_ADMIN_ID') && !cookie_tenant_id) return false;


	if (processedPermissions.roles.includes('SYSTEM_ADMIN')) return true;

	return roles.find((role) => processedPermissions.roles.includes(role));
};

export default checkRole;