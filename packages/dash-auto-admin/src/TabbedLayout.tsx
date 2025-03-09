import { TabbedShowLayout } from 'react-admin';
import IDashAutoAdminAttribute from './interfaces/IDashAutoAdminAttribute';
import { IDashAutoAdminReference } from './interfaces/IDashAutoAdminReference';
import AutoReferenceTab from './DashAutoReferenceTab';
import AutoTabs from './DashAutoTabs';
import IDashAutoAdminResourceConfig from './interfaces/IDashAutoAdminResourceConfig';

export interface ITabbedLayout {
	resourceConfig: IDashAutoAdminResourceConfig;
	schema: IDashAutoAdminAttribute[];
	references?: IDashAutoAdminReference[];
}

const TabbedLayout: React.FC<ITabbedLayout> = ({
	resourceConfig,
	schema,
	references,
	..._props
}) => {
	//   console.log("references",references);
	return (
		<TabbedShowLayout >
			{AutoTabs(resourceConfig)}
			{references && references.map((reference) => AutoReferenceTab(reference))}
		</TabbedShowLayout>
	);
};

export default TabbedLayout;
