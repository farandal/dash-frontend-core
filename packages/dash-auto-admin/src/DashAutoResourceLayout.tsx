import React, { PropsWithChildren, memo } from 'react';
import IDashAutoAdminResourceConfig from './interfaces/IDashAutoAdminResourceConfig';

/**
 * Defines the interface for the default resource layout component in the Dash Auto Admin application.
 * 
 * This interface extends the `PropsWithChildren` type, which means the component can accept child elements.
 * 
 * The interface defines two properties:
 * 
 * 1. `resourceConfig`: An object of type `IDashAutoAdminResourceConfig` that contains the configuration for the current resource.
 * 2. `ResourceMenu`: A React functional component that renders the side navigation menu for the resource.
 */
export interface IDashDefaultResourceLayout extends PropsWithChildren {
	/** React Auto Admin Resource Config */
	resourceConfig: IDashAutoAdminResourceConfig;
	ResourceMenu: React.FC<PropsWithChildren<{ resourceConfig: IDashAutoAdminResourceConfig }>>,
}

/**
 * Renders the default resource layout for the Dash Auto Admin application. To serve as an example, this will not fit for all client UI needs.
 * 
 * The resource layout provides a side navigation around the main content, which can include views such as 'show', 'edit', 'list', and 'view'.
 * 
 * @param props - The component props, including the resource configuration and the ResourceMenu component.
 * @param props.resourceConfig - The configuration for the current resource.
 * @param props.ResourceMenu - A React component that renders the side navigation menu.
 * @param props.children - The main content to be displayed, such as the 'show', 'edit', 'list', or 'view' components.
 * @returns The rendered resource layout.
 */
const DashDefaultResourceLayout: React.FC<IDashDefaultResourceLayout> = (props) => {
	const { resourceConfig, ResourceMenu, children } = props;

	return (
		<div className='dash-app-module'>
			<div className='dash-module-horizontal-box' style={{ maxWidth: '100%' }}>
				<ResourceMenu resourceConfig={resourceConfig} />
				<div className='dash-module-box-content'>{children}</div>
			</div>
		</div>
	);
};


export default memo(
	DashDefaultResourceLayout,
	(props, nextProps) =>
		props === nextProps,
);

