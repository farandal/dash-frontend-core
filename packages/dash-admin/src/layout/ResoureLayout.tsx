import React, { PropsWithChildren, useMemo } from 'react';
import ResourceMenu from './ResourceMenu';
import IAppResourceConfig from '../interfaces/IAppResourceConfig';
import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';

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
    /** Current locale */
    locale?: string;
}

// Memoized ResourceMenu component
const MemoizedResourceMenu = React.memo(({ 
	resourceConfig,
    locale
}: { 
	resourceConfig: IAppResourceConfig;
    locale?: string;
}) => (
	<ResourceMenu resourceConfig={resourceConfig} locale={locale} />
), (prevProps, nextProps) => {
	return prevProps.resourceConfig === nextProps.resourceConfig && prevProps.locale === nextProps.locale;
});

const ResourceLayout: React.FC<IResourceLayout> = (props) => {
	const { resourceConfig, children, locale } = props;

	// Memoize the destructured values to prevent unnecessary recalculations
	const { resourceMenuDisabled, resourceMenuPosition } = useMemo(() => ({
		resourceMenuDisabled: resourceConfig.resourceMenuDisabled ?? false,
		resourceMenuPosition: resourceConfig.resourceMenuPosition ?? 'top'
	}), [resourceConfig.resourceMenuDisabled, resourceConfig.resourceMenuPosition]);

	// Memoize the condition for showing the menu
	const shouldShowMenu = useMemo(() => {
      
		return (resourceConfig.mainAction ||
			(resourceConfig.menu && resourceConfig.menu.length > 0)) &&
			!resourceMenuDisabled;
	}, [
		resourceConfig.mainAction,
		resourceConfig.menu,
		resourceMenuDisabled
	]);

	// Memoize the header content
	const headerContent = useMemo(() => {
		if (!shouldShowMenu) return null;

		return (
			<div className='dash-module-box-header'>
				<div className='dash-module-sidenav dash-d-none dash-d-lg-flex'>
					<MemoizedResourceMenu resourceConfig={resourceConfig} locale={locale} />
				</div>
			</div>
		);
	}, [shouldShowMenu, resourceConfig]);

	return (
		<div className='dash-app-module'>
			<div className='dash-module-horizontal-box' style={{ maxWidth: '100%' }}>
				{headerContent}
				<div className='dash-module-box-content'>
					{children}
				</div>
			</div>
		</div>
	);
};

// Memoize the entire component
export default React.memo(ResourceLayout, (prevProps, nextProps) => {
	// Compare resourceConfig reference and locale
	const propsEqual = prevProps.resourceConfig === nextProps.resourceConfig && 
                      prevProps.locale === nextProps.locale;
	
	// Debug logging (remove in production)
	if (!propsEqual) {
		console.log('ResourceLayout re-rendering:', {
			resourceConfigChanged: prevProps.resourceConfig !== nextProps.resourceConfig,
            localeChanged: prevProps.locale !== nextProps.locale
		});
	}

	return propsEqual;
});
