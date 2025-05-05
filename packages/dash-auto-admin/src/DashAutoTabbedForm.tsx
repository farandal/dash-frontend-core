/* TODO: commented code note - handling of axios error response to parse the error to the appropiate format the react-hook-form was disabled without further testing.  */
import { useCallback, useEffect, useState } from 'react';
import {
	useResourceContext,
	useRecordContext,
	TabbedForm,
	SimpleForm,
} from 'react-admin';

import { DashAutoFormGroups, IDashAutoAdminResourceConfig, validate } from '.';
import { DashAutoFormTabs } from '.';
import { DashAutoFormLayout } from '.';
import { useDataProvider } from 'react-admin';

import { IDashAutoAdminForm } from './DashAutoAdminForm';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { IDASHAppState } from 'dash-admin-state';
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
}) => {
    
	const resource = useResourceContext();
	const record = useRecordContext();
    const debug = true;
	
       // Add this to access form methods including setError
       const formContext = useFormContext();
    
       const dataProvider = useDataProvider();
 
	const formGroupMode = mode === 'create' && resourceConfig?.formGroupModes?.create
		? resourceConfig.formGroupModes.create
		: mode === 'edit' && resourceConfig?.formGroupModes?.edit
		? resourceConfig.formGroupModes.edit
		: resourceConfig?.formGroupMode
		? resourceConfig.formGroupMode
		: 'tabs';

	//const [update,{error:updateError,isLoading:updateLoading,isError:updateErrored}] = useCreate();

	/*
  https://marmelab.com/react-admin/Validation.html#server-side-validation
  To be implemented with Auto Admin must follow the following shape:
  Server-side validation is supported out of the box for pessimistic mode only. 
  It requires that the dataProvider throws an error with the following shape:
  {
      body: {
          errors: {
              title: ['An article with this title already exists','The title must be unique.'],
              date: ['The date is required'],
          }
      }
  }
  */

    const formData = useSelector(
        (
            state: IDASHAppState<any, any, IDashAutoAdminResourceConfig>,
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
                
         
                // TODO: [BUG] - Error: useCreate mutation requires a non-empty resource
                /*const results = await create(
                    resource,
                    values,
                    { returnPromise: true },
                );*/

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

				/*if (!axios.isAxiosError(error)) {
					const parsedErrors = {};
					Object.keys(error).forEach((key) => {
						if (Array.isArray(error[key]))
							return (parsedErrors[key] = error[key].join(' , '));
						return (parsedErrors[key] = error[key]);
					});
					return parsedErrors;
				}*/
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
				/*const results = await update(
					resource,
					{ id: record.id, data: values, previousData: record },
					{ returnPromise: true },
				);*/

                const { data } = await dataProvider.update(resource+"/"+record.id, { 
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

	/*
  const defaultToolbar = () => {

    //const { reset } = useFormContext();

    return <Toolbar>
      {mode === "edit" && (
        <SaveButton
          key={"edit-btn"}
          alwaysEnable={
            resourceConfig?.saveButtonAlwaysEnabled === true ? true : false
          }
          label="Guardar"
        />
      )}
      {mode === "create" && <SaveButton key={"create-btn"} label="Crear" />}
      {resourceConfig?.listDeleteButton?.enabled && (
        <DeleteButton key={"delete-btn"} label="Eliminar" />
      )}
      
    </Toolbar>
  }
  */

   /* useEffect(() => {
        // This code runs when the component mounts
        console.log('Component mounted');

        // This function is the cleanup function
        return () => {
            // This code runs when the component unmounts
            debugger;
            console.log('Component unmounted');
        };
    }, []); // Empty dependency array means this effect runs only on mount and unmount
    */


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
                /*
                mutationOptions={{
                    onError: (error) => {
                        debugger;
                        // Extract validation errors from response
                        if (error.response?.data?.errors) {
                            const fieldErrors = error.response.data.errors;
                            
                            // React-admin will automatically set these errors on the form fields
                            return fieldErrors;
                        }
                        
                        // Forward to custom error handler if provided
                        if (onError) {
                            onError(error);
                        }
                    }
                }}*/
			>
				{resourceConfig.createComponent(resourceConfig)}
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
                /*mutationOptions={{
                    onError: (error) => {
                        debugger;
                        // Extract validation errors from response
                        if (error.response?.data?.errors) {
                            const fieldErrors = error.response.data.errors;
                            
                            // React-admin will automatically set these errors on the form fields
                            return fieldErrors;
                        }
                        
                        // Forward to custom error handler if provided
                        if (onError) {
                            onError(error);
                        }
                    }
                }}*/
			>
				{resourceConfig.editComponent(resourceConfig)}
			</SimpleForm>
		);
	}

	if (formGroupMode === 'tabs') {
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
                syncWithLocation={false}
                //warnWhenUnsavedChanges
                defaultValues={mode === "create" ? formData : {...record,...formData}}
                /* mutationOptions seems to have been deprectated from Forms, moved to  react-admin SaveButton, implemented at is at DashAutoAdminSaveButton. */
                /*mutationOptions={{
                    onError: (error) => {
                        debugger;
                        // Extract validation errors from response
                        if (error.response?.data?.errors) {
                            const fieldErrors = error.response.data.errors;
                            
                            // React-admin will automatically set these errors on the form fields
                            return fieldErrors;
                        }
                        
                        // Forward to custom error handler if provided
                        if (onError) {
                            onError(error);
                        }
                    }
                }}*/
			>
                {/* It has to be a function and not a Functional component, because it returns an array of JSX elements without parent container */}
                {/* The downside, is can't implement hooks within the DashAutoFormTabs component */}
				{DashAutoFormTabs({
					schema: resourceConfig.schema,
					resource: resourceConfig,
					options: { mode: mode, isDrawer: isDrawer },
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
               /* mutationOptions seems to have been deprectated from Forms, moved to  react-admin SaveButton, implemented at is at DashAutoAdminSaveButton. */
                
                /*mutationOptions={{
                    onError: (error) => {
                        debugger;
                        // Extract validation errors from response
                        if (error.response?.data?.errors) {
                            const fieldErrors = error.response.data.errors;
                            
                            // React-admin will automatically set these errors on the form fields
                            return fieldErrors;
                        }
                        
                        // Forward to custom error handler if provided
                        if (onError) {
                            onError(error);
                        }
                    }
                }}*/
			>
				{DashAutoFormGroups(resourceConfig.schema, resourceConfig, {
					mode: mode,
					isDrawer: isDrawer,
				})}
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
                /*mutationOptions={{
                    onError: (error) => {
                        debugger;
                        // Extract validation errors from response
                        if (error.response?.data?.errors) {
                            const fieldErrors = error.response.data.errors;
                            
                            // React-admin will automatically set these errors on the form fields
                            return fieldErrors;
                        }
                        
                        // Forward to custom error handler if provided
                        if (onError) {
                            onError(error);
                        }
                    }
                }}*/
			>
				{DashAutoFormLayout(resourceConfig.schema, resourceConfig, {
					mode: mode,
					isDrawer: isDrawer,
				})}
			</SimpleForm>
		);
	}
};

export default DashAutoTabbedForm;