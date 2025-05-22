/** Core */
export { default as DashAutoList } from './DashAutoList';
export { default as DashAutoDrawer } from './DashAutoDrawer';
export { default as DashAutoCreate } from './DashAutoCreate';
export { default as DashAutoEdit } from './DashAutoEdit';
export { default as DashAutoFormGroups } from './DashAutoFormGroups';
export { default as DashAutoFormLayout } from './DashAutoFormLayout';
export { default as DashAutoAdminForm } from './DashAutoAdminForm';
export { default as DashAutoFormTabs } from './DashAutoFormTabs';
export { default as DashAutoReferenceTab } from './DashAutoReferenceTab';
export { default as DashAutoTabs } from './DashAutoTabs';
export { default as DashAutoLayout } from './DashAutoLayout';

export { default as DashAutoTitle } from './common/DashAutoTitle';

/** Interfaces */
export type { default as IDashAutoAdminCustomFieldComponent } from './interfaces/IDashAutoAdminCustomFieldComponent';
export type { default as ICustomResourceSubComponent } from './interfaces/ICustomResourceSubComponent';
export type { default as IDashAutoAdminAttribute } from './interfaces/IDashAutoAdminAttribute';
export type { default as IDashAutoAdminResourceConfig } from './interfaces/IDashAutoAdminResourceConfig';
export type { IDashAutoLayoutRenderFunction } from './DashAutoLayout';
export type { IDashAutoAdminDataGrid } from './list/DashAutoListDatagridWrapper';
export type { IDashAutoList } from './DashAutoList';

/** Utils */
export { default as isComponent } from './utils/isComponent';
export { default as isFC } from './utils/isFC';
export { default as isEnum } from './utils/isEnum';
export { default as invertMap } from './utils/invertMap';
export { default as enumToChoices } from './utils/enumToChoices';
export { default as groupByTabs } from './utils/groupByTabs';
export { default as validate } from './utils/validate';

export { default as DashRedirect } from './DashRedirect';

export { default as evalActionPermission } from './utils/evalActionPermission';

export { 
  ComponentRegistryProvider, 
  useComponentRegistry 
} from './DashAutoAdminComponentRegistry';
export type { 
  ComponentRegistryContextType, 
  ComponentRegistryProviderProps 
} from './DashAutoAdminComponentRegistry';

export interface IDashAutoAdminSettings {
	/** */
	library: 'mui';
	/** */
	defaultTabName: string;
}

export const AutoAdminSettings: IDashAutoAdminSettings = {
	library: 'mui',
	defaultTabName: 'Data',
};
