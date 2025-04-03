import IApplicationLayoutMainAction from './IDashApplicationLayoutMainAction';
import IApplicationLayoutMenuItem from './IDashApplicationLayoutMenuItem';
import IDashAutoAdminAttribute from './IDashAutoAdminAttribute';
import { IDashAutoAdminReference } from './IDashAutoAdminReference';
import IDashAutoAdminListActions from './IDashAutoAdminListActions';
import IAutoGridButton, { IDeleteAutoGridButton, IEditAutoGridButton, IViewAutoGridButton } from './IDashAutoGridButton';
import IGroupExtraData from './IGroupExtraData';
import IReferenceFilter from './IReferenceFilter';
import IDashAutoAdminCustomFieldComponent from './IDashAutoAdminCustomFieldComponent';
import { IDashAutoDrawerPublicProps } from '../DashAutoDrawer';
import React, { FC, JSX, ReactNode, ReactPortal } from 'react';

import { PaginationProps, Datagrid, ListProps, DatagridProps } from 'react-admin/src';

import { IDashAutoLayoutRenderFunction } from '../DashAutoLayout';
import { IDashAutoListActionsWrapper } from '../list/DashAutoListDefaultActionsWrapper';
import { IDashAutoAdminDataGrid } from '../list/DashAutoListDatagridWrapper';
import { IToolbarFilters } from '../list/DashAutoListTopToolbar';
import { IToolbarFiltersHandler } from '../list/DashAutoListFilterFormWithButton';
import { OverridableComponent } from '@mui/material/OverridableComponent';
import { SvgIconTypeMap } from '@mui/material';
type ReactNodeWithoutPortal = Exclude<ReactNode, ReactPortal>;

/*
This interface defines the configuration options for an auto-admin resource in the React Auto Admin library. It includes properties for defining the model, label, icon, group, references, schema, search, custom components, buttons, toolbars, layouts, and various other options to customize the behavior of the resource.
The interface is used to configure the behavior of the auto-admin components, such as the list, edit, create, and show views, as well as the overall layout and functionality of the resource.
*/

export default interface IDashAutoAdminResourceConfig {
    redirect?: string;
    hidden?: boolean;
    resourceMenuDisabled?: boolean;
	/** */
	model: string;
	/** */
	label?: string;
	//icon?: JSX.Element | ComponentType<any>;
	/** */
	//icon?:  React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | OverridableComponent<SvgIconTypeMap<{}, "svg">> & { muiName: string; };
	/** */
    icon?: React.ComponentType<any> | React.ReactElement | OverridableComponent<SvgIconTypeMap<{}, "svg">> & { muiName: string };	
    /** */
    group?: string;
	/** */
	groupsData?: IGroupExtraData[];
	/** */
	references?: IDashAutoAdminReference[];
	/** */
	referenceFilters?: IReferenceFilter[];
	/* 
	deprecated in favor of FilterFormComponent
	customResourceFiltersComponent?: (
		referenceFilters?: IReferenceFilter[],
	) => ReactNode;
	*/
	/** */
	schema: IDashAutoAdminAttribute[];
	/** */
	listSchema?: IDashAutoAdminAttribute[];
	/** */
	editSchema?: IDashAutoAdminAttribute[];
	/** */
	createSchema?: IDashAutoAdminAttribute[];
	/** */
	showSchema?: IDashAutoAdminAttribute[];
	/** */
	exporter?: any;
	/** */
	search?: boolean;
	/** */
	component: (
		resourceConfig: IDashAutoAdminResourceConfig,
		children?: any,
	) => ReactNode;
	/** */
	roles?: string[];
	/** */
	isFormData?: boolean;
	/** */
	listDeleteButton?: IDeleteAutoGridButton;
	/** */
	listEditButton?: IEditAutoGridButton;
	/** */
	listViewButton?: IViewAutoGridButton;
	/** */
	customListButtons?: IAutoGridButton[];
	/** */
	customToolbarElements?: (filters: ReactNode[]) => any;
	/** */
	customToolbarActions?: (filters: ReactNode[]) => any;
	/** */
	customListActions?: FC<IDashAutoAdminListActions>; //(resourceConfig:IDashAutoAdminResourceConfig,listProps:any,isLoading:boolean,data?:any) => JSX.Element;
	/** */
	listActionsWrapper?: React.FC<IDashAutoListActionsWrapper>;
	/** Enables soft deletes controller, to force delete records or reinstall them. */
    trash?: boolean;
    /** */
	drawer?: boolean;
	/** */
	drawerOptions?: {
        /* TODO! show or view? */
		/** */
		view?: boolean;
        /** */
		show?: boolean;
		/** */
		edit?: boolean;
		/** */
		create?: boolean;
	}
	/** */
	drawerProps?: IDashAutoDrawerPublicProps;
	/** */
	formGroupMode?: 'tabs' | 'groups' | 'layout';
    formGroupModes?: {
        create?: 'tabs' | 'groups' | 'layout';
        edit?: 'tabs' | 'groups' | 'layout';
    }
	/** */
	saveButton?: boolean;
	/** */
	saveButtonAlwaysEnabled?: boolean;
	/** */
	closeDrawerAfterSave?: boolean;
	/** Optional: hides id from List if true. */
	hideSchemaId?: boolean;
	/** Optional: reset filters on location change. */
	resetFiltersOnLocationChange?: boolean;
	/** Optional: hides default filter toolbar (useful together with customResourceFiltersComponent). */
	hideDefaultFilters?: boolean;
	/** Custom record id param name in url; it only works in custom routes related to auto-admin. Initially required to enable nested resources. */
	idParamName?: string;
	/** */
	mutationMode?: 'pessimistic' | 'optimistic' | 'undoable';
	/**
	 * FieldWrapper. Allows to specify a component to wrap around the field.
	 * Notice that you must implement a custom logic if you want to exclude the wrapper from certain conditions.$
	 * For example, you could apply the wrapper only on the show method:.
	 * 
	 * @example
	 * FieldWrapper: ({ children, record, method, attribute }) => {
    return method === "show" ? 
      <fieldset>
        <legend>{attribute.label || attribute.attribute}</legend>
        {children}
      </fieldset>
     : 
      children
  }  
	 */
	/**
	 * FieldWrapper extends an FC<IDashAutoAdminCustomFieldComponent> including the record, method and attribute (attribute schema)
	 * its purpose is to add a custom wrapper to all the fields around the React Auto Admin field.
	 */
	fieldWrapper?: ({
		record,
		method,
		attribute,
		children,
	}: IDashAutoAdminCustomFieldComponent) => JSX.Element;
	/** DataGridProps extends Partial<DatagridProps> from React Admin. */
	dataGridProps?: Partial<DatagridProps>;
	/** DataGridComponent replaces the default <AutoDataGrid/> wrapped in a <List/>; use the listComponent to replace the complete list view. */
	dataGridComponent?: React.FC<IDashAutoAdminDataGrid>;
	/** DataGridRootComponent replaces the root React Admin GridComponent. */
	dataGridRootComponent?: typeof Datagrid;
	/**
	 * DataGridWrapper extends an FC<PropsWithChildren> component
	 * its purpose is to add a custom wrapper around the DataGrid in list views
	 * its props are not defined because they depend on the DataGrid being implemented
	 * they extends an FC<PropsWithChildren>
	 * by default is react-admin DataGrid, but it can be overwritten by the custom datagrid component.
	 */
	dataGridWrapper?: (props: any) => JSX.Element;
	/** ListProps extends Partial<ListProps> from React Admin. */
	listProps?: Partial<ListProps>;
	/** Pagination is an optional component that aims to replace the default Pagination component that extends React Admin PaginationProps. */
	Pagination?: FC<PaginationProps>;
	/** */
	paginationProps?: Partial<PaginationProps>;
	/** FilterFormComponent replaces entirely the default <FilterForm> React-admin component. */
	//FilterFormComponent?: FC<{ resourceConfig: IDashAutoAdminResourceConfig }>;
	FilterFormComponent?:  React.ForwardRefExoticComponent<IToolbarFilters & React.RefAttributes<IToolbarFiltersHandler>>;
	/** */
	filterButtonPosition?: 'buttons-toolbar' | 'filters-container'
	/** */
	filterWithSubmit?: boolean;
	/** Post Formatter */
	postFormatter?: (
		params: any,
		method: 'getList' | 'update' | 'create' | 'import',
	) => { [x: string]: any };
	/** Params Formatter */
	paramsFormatter?: (params: any) => { [x: string]: any };
	/** Form Post Formatter */
	formPostFormatter?: (params: any, form: FormData) => FormData;
	/** Before submit */
	beforeSubmit?: (values: any) => any;

	/** */
	redirectAfterUpdate?: 'list' | 'view' | 'edit' | boolean;
	/** */
	redirectAfterCreate?: 'list' | 'view' | 'edit' | 'create' | boolean;
	/** */
	onError?: (mode:'list' | 'view' | 'edit' | 'create', error:any) => void | FC<{ 
		/** */
		mode:'list' | 'view' | 'edit' | 'create', 
		/** */
		error:any }>;
    
	/** */
	resetFormAfterSubmit?: boolean;

	/** */
	showDialogAfterSubmit?: boolean;
	/** */
	showNotifyAfterSubmit?: boolean;

	/** */
	refreshAfter?: boolean;

	/** */
	mainAction?: IApplicationLayoutMainAction;
	/** */
	menu?:
	| IApplicationLayoutMenuItem[]
	| ((
		resourceConfig?: IDashAutoAdminResourceConfig) => IApplicationLayoutMenuItem[]);

	/** */
	create?: boolean | ((resourceConfig: IDashAutoAdminResourceConfig) => boolean);
	/** */
	list?: boolean | ((resourceConfig: IDashAutoAdminResourceConfig) => boolean);
	/** */
	edit?: boolean | ((resourceConfig: IDashAutoAdminResourceConfig) => boolean);
	/** */
	delete?: boolean | ((resourceConfig: IDashAutoAdminResourceConfig) => boolean);
	/** */
	view?: boolean | ((resourceConfig: IDashAutoAdminResourceConfig) => boolean);

	/** Disable/hide toolbar. */
	toolbar?: boolean;
	/** */
	toolbarEditButton?: IAutoGridButton;
	/** */
	toolbarViewButton?: IAutoGridButton;
	/** */
	toolbarListButton?: IAutoGridButton;
	/** */
	toolbarDeleteButton?: IAutoGridButton;
	/** */
	toolbarSaveButton?: IAutoGridButton;
	/** */
	toolbarCreateButton?: IAutoGridButton;
	/** */
	toolbarExportButton?: IAutoGridButton;

	/** Disable/hide bottom toolbar. */
	bottomToolbar?: boolean;
	/** */
	bottomToolbarSaveButton?: IAutoGridButton;
	/** */
	bottomToolbarDeleteButton?: IAutoGridButton;


	/** */
	showSavedQueries?: boolean;

	/** */
	BulkActions?:
	| JSX.Element
	| ReactNode
	| (() => JSX.Element | ReactNode);
	/** */
	RowActions?:
	| JSX.Element
	| ReactNode
	| (() => JSX.Element | ReactNode);

	//toolbarShow?: boolean | ((resourceConfig: IDashAutoAdminResourceConfig) => boolean);
	//toolbarList?: boolean | ((resourceConfig: IDashAutoAdminResourceConfig) => boolean);
	//toolbarDelete?: boolean | ((resourceConfig: IDashAutoAdminResourceConfig) => boolean);
	//toolbarSave?: boolean | ((resourceConfig: IDashAutoAdminResourceConfig) => boolean);

	/** */
	customRoutes?: (resourceConfig: IDashAutoAdminResourceConfig) => JSX.Element;
	/** */
	showComponent?: (resourceConfig: IDashAutoAdminResourceConfig) => JSX.Element;
	/** List Component replaces the complete list component only wrapped by the specified layout; e.g: reference filters will not be applied. */
	listComponent?: (
		resourceConfig: IDashAutoAdminResourceConfig,
		onError?: (data: any) => void,
		onSubmit?: (data: any) => void,
	) => JSX.Element;
	
	
	/** */
	editComponent?: (resourceConfig: IDashAutoAdminResourceConfig) => JSX.Element;
	/** */
	createComponent?: (resourceConfig: IDashAutoAdminResourceConfig) => JSX.Element;

	/** */
	createLayout?: (render: IDashAutoLayoutRenderFunction) => JSX.Element;
	/** */
	editLayout?: (render: IDashAutoLayoutRenderFunction) => JSX.Element;
	/** */
	showLayout?: (render: IDashAutoLayoutRenderFunction) => JSX.Element;
	/** Generally the error handler is performed in the ResourceTemplate, in case no ResourceTemplate and defualt react-admin beheaviour is implemented, default value will be true. */
	processErrors?: boolean;
	/** */
	resetSelectedIdsOnLoad?: boolean;

	/** */
	AutoEditTopToolbarElements?: (
		resourceConfig: IDashAutoAdminResourceConfig,
	) => JSX.Element;
	/** */
	AutoCreateTopToolbarElements?: (
		resourceConfig: IDashAutoAdminResourceConfig,
	) => JSX.Element;
	/** */
	AutoEditBottomToolbarElements?: (
		resourceConfig: IDashAutoAdminResourceConfig
	) => JSX.Element;
	/** */
	AutoCreateBottomToolbarElements?: (
		resourceConfig: IDashAutoAdminResourceConfig,
	) => JSX.Element;
}
