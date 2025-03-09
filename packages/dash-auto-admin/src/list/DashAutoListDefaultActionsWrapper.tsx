
import { PropsWithChildren } from 'react';
import {
	Card,
} from '@mui/material';
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

	if (!hasToolbarItems) return <>{children}</>;
	/* @ts-ignore : TODO Children type mismatch */
	return <Card className='top-toolbar-default'>{children}</Card>;
};

export default DashAutoListDefaultListActionsWrapper;