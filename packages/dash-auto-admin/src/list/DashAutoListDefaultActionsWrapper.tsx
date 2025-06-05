
import { JSX, PropsWithChildren } from 'react';
import IDashAutoAdminResourceConfig from '../interfaces/IDashAutoAdminResourceConfig';


export interface IDashAutoListActionsWrapper extends PropsWithChildren {
	resourceConfig: IDashAutoAdminResourceConfig,
	autoFilters?: JSX.Element[]
}
const DashAutoListDefaultListActionsWrapper: React.FC<IDashAutoListActionsWrapper> = ({
	resourceConfig,
	autoFilters,
	children,
}) => {
	
    const hasToolbarItems: boolean =
		(autoFilters && autoFilters.length) ||
		resourceConfig.create ||
		resourceConfig.exporter ||
		resourceConfig.customToolbarElements
			? true
			: false;

	if (!hasToolbarItems) return children;
	
	return <div className='top-toolbar-default'>{children}</div>;


};

export default DashAutoListDefaultListActionsWrapper;