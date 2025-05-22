import React, { ReactNode } from 'react';

export interface IAppSidebar {
	navStyle: any;
	children?: ReactNode;
}
const AppSidebar: React.FC<IAppSidebar> = ({
	children,
	navStyle,
	...props
}) => <>Deprecated</>
export default AppSidebar;
