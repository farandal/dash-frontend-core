import { FC } from 'react';
import { EditButton } from 'react-admin';
import { DeleteButton } from 'react-admin';
import { DeleteWithConfirmButton } from 'react-admin';
import { WithRecord } from 'react-admin';
import { ShowButton } from 'react-admin';
import IToolbarButton from '../../interfaces/IToolbarButton';
import DashResourceButton from './DashResourceButton';
/**
 * Renders a view button for a list of resources, based on the provided resource configuration.
 * If the resource configuration does not have a `view` property set to `false`, and there is no `listViewButton` property,
 * a default `ShowButton` component is rendered.
 * If the `listViewButton` property is enabled, either the custom component specified in `listViewButton.component` is rendered,
 * or a default `ShowButton` component is rendered with the props specified in `listViewButton.props`.
 * If the `listViewButton` property is not enabled, `null` is returned.
 * 
 * @param props - The props for the `ListViewButton` component.
 * @param props.resourceConfig - The resource configuration object.
 * @returns {React.ReactElement} A React component.
 */
export const ListViewButton:FC<IToolbarButton> = (props) => {
	const { resourceConfig } = props;
	let Component = ShowButton;
	if (!resourceConfig) return <Component/>;
	if ( resourceConfig.listViewButton) {
		if ( resourceConfig.listViewButton.component ) Component = resourceConfig.listViewButton.component;
		if (resourceConfig.listViewButton.enabled === false || resourceConfig?.view === false) return <></>;
        if(!resourceConfig.listViewButton?.size) { resourceConfig.listViewButton.size = 'small' };
        
	}


	/*const btnProps = { 
		...resourceConfig.listViewButton?.props || {}, 
		...(resourceConfig.drawer === true && resourceConfig.drawerOptions?.view !== false ? {
			mode: 'show',
			navigation: 'virtualhash',
			navigate: (record) => {
      
				return 'inline/' + record.id + '/show';
			},
		} : {}),
	};*/

    const btnProps = { 
        mode: 'show',
        resourceConfig: resourceConfig,
		...resourceConfig.listViewButton?.props || {},
       
    }

	//if (resourceConfig.drawer === true && resourceConfig.drawerOptions?.view !== false) {
		//return <DashResourceButton {...btnProps} ><Component /></DashResourceButton>;
	//}
    
	//return <Component {...btnProps} />;

     return <DashResourceButton {...btnProps}  resourceConfig={resourceConfig} {...resourceConfig.listDeleteButton?.props || {}} />;

};


/**
 * Renders an edit button for a list of resources, based on the provided resource configuration.
 * If the resource configuration does not have an `edit` property set to `false`, and there is no `listEditButton` property,
 * a default `EditButton` component is rendered.
 * If the `listEditButton` property is enabled, either the custom component specified in `listEditButton.component` is rendered,
 * or a default `EditButton` component is rendered with the props specified in `listEditButton.props`.
 * If the `listEditButton` property is not enabled, `null` is returned.
 * 
 * @param props - The props for the `ListEditButton` component.
 * @param props.resourceConfig - The resource configuration object.
 * @returns {React.ReactElement} A React component.
 */
export const ListEditButton:FC<IToolbarButton> = (props) => {
	const { resourceConfig } = props;
	let Component = EditButton;
	

    if (!resourceConfig) {
        return <Component />;
    }


	if ( resourceConfig.listEditButton) {
		if ( resourceConfig.listEditButton.component ) Component = resourceConfig.listEditButton.component;
		if (resourceConfig.listEditButton.enabled === false || resourceConfig?.edit === false) return <></>;
        if(resourceConfig.listViewButton && !resourceConfig.listViewButton?.size) { resourceConfig.listViewButton.size = 'small' };
	}

    return <DashResourceButton mode='edit' resourceConfig={resourceConfig} {...resourceConfig.listViewButton?.props || {}} />;

	//if (resourceConfig.drawer === true && resourceConfig.drawerOptions?.edit !== false) {
		//return <DashResourceButton mode='edit' resourceConfig={resourceConfig} {...resourceConfig.listViewButton?.props || {}} ><Component  /></DashResourceButton>;
	//}

	//return <Component />;
};

/**
 * Renders a delete button for a list of resources, based on the provided resource configuration.
 * If the resource configuration does not have a `delete` property set to `false`, and there is no `listDeleteButton` property,
 * a default `DeleteButton` component is rendered.
 * If the `listDeleteButton` property is enabled, either the custom component specified in `listDeleteButton.component` is rendered,
 * or a default `DeleteButton` component is rendered with the props specified in `listDeleteButton.props`.
 * If the `listDeleteButton` property is not enabled, `null` is returned.
 * If the `listDeleteButton.props.confirm` property is set, a `DeleteWithConfirmButton` component is rendered instead.
 * 
 * @param props - The props for the `ListDeleteButton` component.
 * @param props.resourceConfig - The resource configuration object.
 * @returns {React.ReactElement} A React component.
 */
export const ListDeleteButton:FC<IToolbarButton> = (props) => {
	const { resourceConfig } = props;
	let Component = DeleteButton;
	if (!resourceConfig) return <Component/>;
	if ( resourceConfig.listDeleteButton) {
		if ( resourceConfig.listDeleteButton.component ) Component = resourceConfig.listDeleteButton.component;
		if (resourceConfig.listDeleteButton.enabled === false || resourceConfig?.delete === false) return <></>;
        if(!resourceConfig.listViewButton?.size) { resourceConfig.listViewButton.size = 'small' };
	}

  
	/*if (resourceConfig.listDeleteButton?.confirm) {
		return <WithRecord
			render={(record) => (
				<DeleteWithConfirmButton  {...resourceConfig.listDeleteButton?.props || {}} record={record} />
			)}
		/>;
	}
	return <DeleteButton {...resourceConfig.listDeleteButton?.props || {}} />;*/

    //return <DashResourceButton mode='destroy' resourceConfig={resourceConfig} {...resourceConfig.listDeleteButton?.props || {}} ><Component  /></DashResourceButton>;

    return <DashResourceButton mode='destroy' resourceConfig={resourceConfig} {...resourceConfig.listDeleteButton?.props || {}} />;

};