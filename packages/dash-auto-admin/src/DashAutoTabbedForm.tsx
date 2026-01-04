/* TODO: commented code note - handling of axios error response to parse the error to the appropiate format the react-hook-form was disabled without further testing.  */
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import {
	useResourceContext,
	useRecordContext,
	TabbedForm,
	SimpleForm,
} from 'react-admin';

import { DashAutoFormGroups, IDashAutoAdminResourceConfig, groupByTabs, validate } from '.';
import { DashAutoFormTabs } from '.';
import { DashAutoFormLayout } from '.';
import { useDataProvider } from 'react-admin';

import { IDashAutoAdminForm } from './DashAutoAdminForm';
import { DashAutoAdminFormProvider } from './context/DashAutoAdminFormContext';

import { useSelector } from 'react-redux';
//import { IDASHAppState } from 'dash-admin-state';
import { Loading } from 'react-admin';
import { useFormContext, useFormState } from 'react-hook-form';


export type IDashAutoTabbedForm = IDashAutoAdminForm;

/**
 * The `DashAutoTabbedForm` component is a React functional component that renders a tabbed form for a Dash Auto Admin resource.
 * It handles the logic for creating, updating, and submitting the form data, as well as managing the form mode (create or edit).
 * The component uses the `react-admin` library to provide the necessary functionality for the form.
 *
 * @param {IDashAutoTabbedForm} props - The component props, including the resource configuration, submit and error handlers, toolbar, mode, and whether the form is being rendered in a drawer.
 * @returns {JSX.Element} - The rendered tabbed form component.
 */
const DashAutoTabbedForm: React.FC<IDashAutoTabbedForm> = ({
	resourceConfig,
	onSubmit,
	beforeSubmit,
	onError,
	toolbar,
	mode,
	isDrawer = false,
	locale,
}) => {
    
	const resource = useResourceContext();
	const record = useRecordContext();
    const debug = true;
    const dataProvider = useDataProvider();
 
	let formGroupMode = mode === 'create' && resourceConfig?.formGroupModes?.create
		? resourceConfig.formGroupModes.create
		: mode === 'edit' && resourceConfig?.formGroupModes?.edit
		? resourceConfig.formGroupModes.edit
		: resourceConfig?.formGroupMode
		? resourceConfig.formGroupMode
		: 'tabs';

    // Calculate the number of visible tabs for the current mode
    const getVisibleTabCount = () => {
        const tabGroups = groupByTabs(resourceConfig.schema);
        return tabGroups.filter((group) => {
            const filteredAttributes = group.filter((attr) => {
                if (mode === 'create') {
                    return attr?.inCreate !== false;
                } else if (mode === 'edit') {
                    return attr?.inEdit !== false;
                }
                // For any other mode, include all
                return true;
            });
            return filteredAttributes.length > 0;
        }).length;
    };

    const visibleTabCount = useMemo(() => getVisibleTabCount(), [resourceConfig.schema, mode, locale]);

    // Fallback to layout if only one visible tab for the current mode
    if (formGroupMode === "tabs" && visibleTabCount <= 1) {
        formGroupMode = 'layout';
    }
    const formData = useSelector(
        (
            //state: IDASHAppState<any, any, IDashAutoAdminResourceConfig>,
            state: any
        ) => {
            
            return state.formData || {};
        },
    );

	const onCreateSave = useCallback(
		async (values) => {
          
            if (debug) console.log('onCreateSave called with values:', values);
            if (!resource) {
                throw new Error('Resource is required');
            }

			try {
                if (beforeSubmit) {
                    values = beforeSubmit(values);
                }
                
         

                const { data } = await dataProvider.create(resource, { 
                    data: values 
                });
               
                if (onSubmit) {
                    onSubmit(data);
                }
			} catch (error) {
             
				if (onError) {
					onError(error);
				}

			
			}
		},
		[resource, beforeSubmit, dataProvider, onSubmit, onError]
	);

	const onUpdateSave = useCallback(
		async (values) => {
        
            if (debug) console.log('onUpdateSave called with values:', values);
			try {
				if (beforeSubmit) {
					values = beforeSubmit(values);
				}
				

                const { data } = await dataProvider.update(resource+"/"+record.id, { 
                    id: record?.id,
                    data: values,
                    previousData: record
                });
       
				if (onSubmit) {
					onSubmit(data);
				}
			} catch (error) {
     
				if (onError) {
					onError(error);
				}
             
			}
		},
		[resource, record, beforeSubmit, dataProvider, onSubmit, onError]
	);

	let onSave = onCreateSave;	
    switch (mode) {
		case 'edit':
			onSave = onUpdateSave;
			break;
		case 'create':
			onSave = onCreateSave;
			break;
	}

    // 🔧 FIX: Memoize ContextComponent to prevent unstable reference on each render
    // Previously this was creating a new component reference on each render,
    // causing React to unmount and remount the entire component tree
    const ContextComponent = useMemo(() => {
        return resourceConfig.contextComponent || (({children}: {children: ReactNode}) => <>{children}</>);
    }, [resourceConfig.contextComponent, locale]);

    // 🔧 FIX: Memoize the context value to prevent unnecessary re-renders
    // The onSave and mode values only change when their dependencies change
    const formContextValue = useMemo(() => ({ onSave, mode, locale }), [onSave, mode, locale]);
  

    if(!formData) return <Loading/>

	if (
		mode === 'create' &&
		typeof resourceConfig?.createComponent === 'function'
	) {
		return (
			<SimpleForm
				key="create-form"
				//redirect={false}
                
				toolbar={toolbar || null}
				onSubmit={onSave}
				validate={validate(resourceConfig.schema)}
                reValidateMode="onBlur"
				className={'auto-admin-grouped-form'}
             
			>
                <DashAutoAdminFormProvider value={formContextValue}>
                    <ContextComponent mode={mode} resourceConfig={resourceConfig}>
                        {resourceConfig.createComponent(resourceConfig)}
                    </ContextComponent>
                </DashAutoAdminFormProvider>
				
			</SimpleForm>
		);
	}

	if (mode === 'edit' && typeof resourceConfig?.editComponent === 'function') {
		return (
			<SimpleForm
				key="edit-form"
				warnWhenUnsavedChanges
				//redirect={false}
				toolbar={toolbar || null}
				onSubmit={onSave}
				validate={validate(resourceConfig.schema)}
                reValidateMode="onBlur"
				className={'auto-admin-grouped-form'}
               
			>
                <DashAutoAdminFormProvider value={formContextValue}>
                    <ContextComponent mode={mode} resourceConfig={resourceConfig}>
                        {resourceConfig.editComponent(resourceConfig)}
                    </ContextComponent>
                </DashAutoAdminFormProvider>
				
			</SimpleForm>
		);
	}

    // 🔧 FIX: Create a memoized wrapper component for TabbedForm
    // This prevents React from treating it as a new component on each render
    const TabbedFormWrapper = useMemo(() => {
        const Wrapper = ({ children }: { children: ReactNode }) => (
            <DashAutoAdminFormProvider value={formContextValue}>
                <ContextComponent mode={mode} resourceConfig={resourceConfig}>
                    {children}
                </ContextComponent>
            </DashAutoAdminFormProvider>
        );
        return Wrapper;
    }, [formContextValue, ContextComponent, mode, resourceConfig, locale]);

	if (formGroupMode === 'tabs' && groupByTabs(resourceConfig.schema).length > 1) {
        //console.log(record,formData, {...record,...formData});
       
		return (
			<>
         
			<TabbedForm
				key="tabbed-form"
				toolbar={toolbar || null}
				onSubmit={onSave}
				validate={validate(resourceConfig.schema)}
				className={'tabbed-form-custom dash-auto-admin-tabbed-form'}
                resetOptions={{ keepDirtyValues: true }}
                syncWithLocation={resourceConfig.syncTabsWithLocation || false}
                
                defaultValues={mode === "create" ? formData : {...record,...formData}}
                component={TabbedFormWrapper}
                //component={(props) => props.children}
			>
              
                {/* It has to be a function and not a Functional component, because it returns an array of JSX elements without parent container */}
                {/* The downside, is can't implement hooks within the DashAutoFormTabs component */}
				{DashAutoFormTabs({
					schema: resourceConfig.schema,
					resourceConfig: resourceConfig,
					options: { mode: mode, isDrawer: isDrawer, locale: locale },
				})}
                
			</TabbedForm>
      
            </>
		);
	}

	if (formGroupMode === 'groups') {
		return (
			<SimpleForm
				key="groups-form"
				//redirect={false}
				toolbar={toolbar || null}
				onSubmit={onSave}
				validate={validate(resourceConfig.schema)}
                reValidateMode="onBlur"
				className={'auto-admin-grouped-form'}
            
			>
                <DashAutoAdminFormProvider value={formContextValue}>
                    <ContextComponent mode={mode} resourceConfig={resourceConfig}>
                        {DashAutoFormGroups({schema:resourceConfig.schema, resourceConfig, options:{
                            mode: mode,
                            isDrawer: isDrawer,
                        }})}
                    </ContextComponent>
                </DashAutoAdminFormProvider>
			</SimpleForm>
		);
	}

	if (formGroupMode === 'layout') {
		return (
			<SimpleForm
				key="layout-form"
				//redirect={false}
				toolbar={toolbar || null}
				onSubmit={onSave}
				validate={validate(resourceConfig.schema)}
                reValidateMode="onBlur"
				className={'auto-admin-grouped-form'}
                
			>
                <DashAutoAdminFormProvider value={formContextValue}>
                    <ContextComponent mode={mode} resourceConfig={resourceConfig}>
                        {DashAutoFormLayout({schema:resourceConfig.schema, resourceConfig:resourceConfig, options:{
                            mode: mode,
                            isDrawer: isDrawer,
                        }})}
                    </ContextComponent>
                </DashAutoAdminFormProvider>
			</SimpleForm>
		);
	}
};

export default DashAutoTabbedForm;