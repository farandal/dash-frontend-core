import { FormTab } from 'react-admin';
import IDashAutoAdminAttribute from './interfaces/IDashAutoAdminAttribute';
import IDashAutoAdminFormOptions from './interfaces/IDashAutoAdminFormOptions';
import groupByTabs from './utils/groupByTabs';
import AttributeToInput from './mui/AttributeToInput';
import IDashAutoAdminResourceConfig from './interfaces/IDashAutoAdminResourceConfig';
import { useDispatch, useSelector } from 'react-redux';
import { IDASHAppState } from 'dash-admin-state';
import { CLEAR_FORM_DATA, SET_FORM_DATA } from 'dash-admin-state/src/redux/actions/ActionTypes';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

interface IAutoForm {
	schema: IDashAutoAdminAttribute[],
	resourceConfig: IDashAutoAdminResourceConfig,
	options?: IDashAutoAdminFormOptions,
}

/** 
 * The `DashAutoFormTabs` component is responsible for rendering the form tabs in the Dash Auto Admin interface. 
 * It takes in a `schema` of `IDashAutoAdminAttribute` objects, a `resource` of `IDashAutoAdminResourceConfig`, and optional `options` of `IDashAutoAdminFormOptions`. 
 * The component handles different form modes ('create', 'edit', 'view') and renders the appropriate form tabs based on the provided schema and options. 
 * It also features a form data state management using Redux and handles changes to form inputs for Tabbed Forms.
 */

const DashAutoFormTabs = ({
    schema,
    resourceConfig,
    options
}: IAutoForm) => {

    const isDrawer = options.isDrawer === true ? true : false;
    const dispatch = useDispatch();
    

    const handleChange = (event) => {
      
        const { name, value, type } = event.target;

        // Handle different input types
        let payloadValue;
        switch (type) {
            case 'checkbox':
                // For checkboxes, the value is a boolean
                payloadValue = event.target.checked; // Use checked for checkbox inputs
                break;
            case 'select':
                // For select inputs, you might need to handle differently if you have multiple selections
                payloadValue = value; // For single select
                break;
            case 'text':
            case 'number':
            case 'email':
                // For text, number, and email inputs
                payloadValue = value;
                break;
            // Add cases for other input types as needed
            default:
                payloadValue = value; // Fallback for other input types
                break;
        }
  
        dispatch({ type: SET_FORM_DATA, payload: { [name]: payloadValue } });
    };
    

    options = {...options, handleChange};

    switch (options.mode) {
        case 'create':
            return groupByTabs(schema).map((groupOfAttributes, idx) => {

                let grouppedAttributes = groupOfAttributes.filter(
                    (attribute) => attribute?.inCreate !== false,
                );

                if (isDrawer) {
                    grouppedAttributes = grouppedAttributes.filter(
                        (attribute) => attribute?.inDrawer !== false,
                    );
                }
                return (
                    grouppedAttributes.length && (
                        <FormTab
                            key={`tab-${groupOfAttributes[0].tab || idx}`}
                            value={idx}
							/*icon={IconResolver(groupOfAttributes[0].tab)}*/ label={
                                groupOfAttributes[0].tab || options?.label || ''
                            }
                        >
                            {grouppedAttributes.map((attribute, i) => (
                                <div key={`input-${i}`}>
                                    {AttributeToInput('create', resourceConfig, attribute, i, options)}
                                </div>
                            ))}

                        </FormTab>
                    )
                );
            });

        case 'edit':
            return groupByTabs(schema).map((groupOfAttributes, idx) => {
                let grouppedAttributes = groupOfAttributes.filter(
                    (attribute) => attribute?.inEdit !== false,
                );
                if (isDrawer) {
                    grouppedAttributes = grouppedAttributes.filter(
                        (attribute) => attribute?.inDrawer !== false,
                    );
                }

                return (
                    grouppedAttributes.length && (
                        <FormTab
                            key={`tab-${groupOfAttributes[0].tab || idx}`}
                            value={idx}
							/*icon={IconResolver(groupOfAttributes[0].tab)}*/ label={
                                groupOfAttributes[0].tab || options?.label || ''
                            }
                        >
                            {grouppedAttributes.map((attribute, i) => (
                                <div key={`input-${i}`}>
                                    {AttributeToInput('edit', resourceConfig, attribute, i, options)}
                                </div>
                            ))}


                        </FormTab>
                    )
                );
            });

        case 'view':
            return groupByTabs(schema).map((groupOfAttributes, idx) => {
                let grouppedAttributes = groupOfAttributes.filter(
                    (attribute) => attribute?.inShow !== false,
                );
                if (isDrawer) {
                    grouppedAttributes = grouppedAttributes.filter(
                        (attribute) => attribute?.inDrawer !== false,
                    );
                }
                //console.log("groupOfAttributes, view",groupOfAttributes);
                return (
                    grouppedAttributes.length && (
                        <FormTab
                            key={`tab-${groupOfAttributes[0].tab || idx}`}
                            value={idx}
							/*key={idx} icon={IconResolver(groupOfAttributes[0].tab)}*/ label={
                                groupOfAttributes[0].tab || options?.label || ''
                            }
                        >
                            {grouppedAttributes.map((attribute, i) => (
                                <div key={`input-${i}`}>
                                    {AttributeToInput('view', resourceConfig, attribute, i, options)}
                                </div>
                            ))}
                        </FormTab>
                    )
                );
            });
    }
};

export default DashAutoFormTabs;