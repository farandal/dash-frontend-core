import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';

/**
 * IAppResourceConfig extends IDashAutoAdminResourceConfig.
 * it allows to add at domain level, some additional resourceConfig props to be used in cases not supported by dash-auto-admin
 */
export interface IAppResourceConfig extends IDashAutoAdminResourceConfig {
	/** IDashAutoAdminResourceConfig Custom prop used in domain ResourceLayout; adds JSX.Elements appended to the layout menu*/
	navActions?: JSX.Element[];
	/** */
	hidden?: boolean;
	/** */
	resourceMenuPosition?: string;
	/** */
	resourceMenuDisabled?: boolean;
	/** */
	redirect?: string;
}
export default IAppResourceConfig;
