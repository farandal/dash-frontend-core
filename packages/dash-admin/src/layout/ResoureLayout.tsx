import React, { PropsWithChildren } from 'react';
import ResourceMenu from './ResourceMenu';
import IAppResourceConfig from '../interfaces/IAppResourceConfig';

/**
 * Resource Layout
 *
 * @description The resource is the wrapper for all the views methods available in the ResourceTemplate such as ['show','edit','list','view']
 * its parent HoC is the ResourceTemplate
 * The main goal is to provide a side navigation around the main content.
 *
 * Notice: side styles are not implemented in DASH V2 project
 *
 * @param {IResourceLayout} props - Functional Component Props
 * @param {IDashAutoAdminResourceConfig} props.resourceConfig - Resource Config
 * @param {string} props.position - "top"
 * @param {boolean} props.showToolbar - default true, shows or hide the navigation toolbar
 * @param {JSX.Element} props.children - Children content such as Show, Edit, DataGrid
 *
 * @returns {JSX.Element} - JSX element
 */

export interface IResourceLayout extends PropsWithChildren {
	/** React Auto Admin Resource Config */
	resourceConfig: IAppResourceConfig;
}

const ResourceLayout: React.FC<IResourceLayout> = (props) => {
	const { resourceConfig, children } = props;

	const { resourceMenuDisabled = false, resourceMenuPosition = 'top' } =
		resourceConfig; 

	return (
		<div className='dash-app-module'>
			<div className='dash-module-horizontal-box' style={{ maxWidth: '100%' }}>
            
				{(resourceConfig.mainAction ||
					(resourceConfig.menu && resourceConfig.menu.length > 0)) &&
					!resourceMenuDisabled && (
						<div className='dash-module-box-header'>
							<div className='dash-module-sidenav dash-d-none dash-d-lg-flex'>
                               
								<ResourceMenu resourceConfig={resourceConfig} />
							</div>
						</div>
					)}
				<div className='dash-module-box-content'>{children}</div>
			</div>
		</div>
	);
};

export default ResourceLayout;
