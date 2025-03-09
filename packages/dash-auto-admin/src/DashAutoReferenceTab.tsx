import { AutoReferenceTab as MuiAutoReferenceTab } from './mui/AutoReferenceTab';
import { IDashAutoAdminReference } from './interfaces/IDashAutoAdminReference';

export const DashAutoReferenceTab = (reference: IDashAutoAdminReference) => {
	const _AutoReferenceTab = MuiAutoReferenceTab;
	return _AutoReferenceTab(reference);
};

export default DashAutoReferenceTab;
