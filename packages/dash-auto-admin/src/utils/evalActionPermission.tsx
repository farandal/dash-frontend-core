import IDashAutoAdminResourceConfig from '../interfaces/IDashAutoAdminResourceConfig';

const evalActionPermission = (
	resourceConfig: IDashAutoAdminResourceConfig,
	action?: any,
): boolean => {
	let result = true;
	if (action === null || action === undefined) return true;
	if (!action) return false;
	if (typeof action === 'function') result = action(resourceConfig);
	return result;
};

export default evalActionPermission;
