import { TabbedShowLayout } from 'react-admin';
import { IDashAutoAdminResourceConfig } from '.';
import IDashAutoAdminFormOptions from './interfaces/IDashAutoAdminFormOptions';
import { AutoTabs as MuiAutoTabbedForm } from './mui/AutoTabs';

const AutoTabs = (
	resourceConfig: IDashAutoAdminResourceConfig,
	options?: IDashAutoAdminFormOptions,
) => {
	const _AutoTabs = MuiAutoTabbedForm;

	return (
		<TabbedShowLayout  >
			{_AutoTabs(resourceConfig, resourceConfig.schema, options)}
		</TabbedShowLayout>
	);
};

export default AutoTabs;
