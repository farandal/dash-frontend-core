import { PropsWithChildren } from 'react';
import IDashAutoAdminResourceConfig from './IDashAutoAdminResourceConfig';

export interface IDashAutoAdminListActions extends PropsWithChildren {
	/** */
	resourceConfig: IDashAutoAdminResourceConfig;
	/** */
	listProps: any;
	//isLoading: boolean;
	//data: any;
}

export default IDashAutoAdminListActions;
