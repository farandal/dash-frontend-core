import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';
import { JSX } from 'react';
/**
 * Extends the `IDashAutoAdminResourceConfig` interface to provide additional configuration options for an application resource.
 * 
 * - `navActions`: Optional array of JSX.Element that will be appended to the layout menu.
 * - `hidden`: Optional boolean that determines if the resource should be hidden from the UI.
 * - `resourceMenuPosition`: Optional string that specifies the position of the resource menu.
 * - `resourceMenuDisabled`: Optional boolean that determines if the resource menu should be disabled.
 * - `redirect`: Optional string that specifies a redirect path for the resource.
 */
export interface IAppResourceConfig extends IDashAutoAdminResourceConfig {
	/** IDashAutoAdminResourceConfig Custom prop used in domain ResourceLayout; adds JSX.Elements appended to the layout menu*/
	navActions?: JSX.Element[];
	hidden?: boolean;
	resourceMenuPosition?: string;
	resourceMenuDisabled?: boolean;
	redirect?: string;
}
export default IAppResourceConfig;
