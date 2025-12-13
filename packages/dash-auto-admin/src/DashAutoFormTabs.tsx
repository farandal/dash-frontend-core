import { FormTab } from 'react-admin';
import IDashAutoAdminAttribute from './interfaces/IDashAutoAdminAttribute';
import IDashAutoAdminFormOptions from './interfaces/IDashAutoAdminFormOptions';
import groupByTabs from './utils/groupByTabs';
import AttributeToInput from './mui/AttributeToInput';
import IDashAutoAdminResourceConfig from './interfaces/IDashAutoAdminResourceConfig';
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
 * 
 * If there is only one tab group, it renders the inputs directly without the FormTab wrapper.
 */

const DashAutoFormTabs = ({
    schema,
    resourceConfig,
    options
}: IAutoForm) => {

    const isDrawer = options.isDrawer === true ? true : false;
   

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
  
   
    };
    

    options = {...options, handleChange};

    // Helper to render inputs for a group
    const renderInputs = (mode: 'create' | 'edit' | 'view', grouppedAttributes: IDashAutoAdminAttribute[]) => {
        return grouppedAttributes.map((attribute, i) => (
            <div key={`input-${i}`}>
                {AttributeToInput(mode, resourceConfig, attribute, i, options)}
            </div>
        ));
    };

    // Helper to filter attributes based on mode and drawer
    const filterAttributes = (
        groupOfAttributes: IDashAutoAdminAttribute[],
        mode: 'create' | 'edit' | 'view'
    ) => {
        let filtered = groupOfAttributes.filter((attribute) => {
            switch (mode) {
                case 'create':
                    return attribute?.inCreate !== false;
                case 'edit':
                    return attribute?.inEdit !== false;
                case 'view':
                    return attribute?.inShow !== false;
                default:
                    return true;
            }
        });

        if (isDrawer) {
            filtered = filtered.filter((attribute) => attribute?.inDrawer !== false);
        }

        return filtered;
    };

    // Get all tab groups
    const tabGroups = groupByTabs(schema);

    // Filter tab groups to only include those with visible attributes for current mode
    const getFilteredTabGroups = (mode: 'create' | 'edit' | 'view') => {
        return tabGroups
            .map((group) => ({
                original: group,
                filtered: filterAttributes(group, mode),
            }))
            .filter((g) => g.filtered.length > 0);
    };

    switch (options.mode) {
        case 'create': {
            const filteredGroups = getFilteredTabGroups('create');
            
            // If only one tab group, render inputs directly without FormTab wrapper
            if (filteredGroups.length === 1) {
                return <>{renderInputs('create', filteredGroups[0].filtered)}</>;
            }
            
            // Multiple tabs - wrap each in FormTab
            return filteredGroups.map((group, idx) => (
                <FormTab
                    key={`tab-${group.original[0].tab || idx}`}
                    value={idx}
                    label={group.original[0].tab || options?.label || resourceConfig?.label}
                >
                    {renderInputs('create', group.filtered)}
                </FormTab>
            ));
        }

        case 'edit': {
            const filteredGroups = getFilteredTabGroups('edit');
            
            // If only one tab group, render inputs directly without FormTab wrapper
            if (filteredGroups.length === 1) {
                return <>{renderInputs('edit', filteredGroups[0].filtered)}</>;
            }
            
            // Multiple tabs - wrap each in FormTab
            return filteredGroups.map((group, idx) => (
                <FormTab
                    key={`tab-${group.original[0].tab || idx}`}
                    value={idx}
                    label={group.original[0].tab || options?.label || resourceConfig?.label}
                >
                    {renderInputs('edit', group.filtered)}
                </FormTab>
            ));
        }

        case 'view': {
            const filteredGroups = getFilteredTabGroups('view');
            
            // If only one tab group, render inputs directly without FormTab wrapper
            if (filteredGroups.length === 1) {
                return <>{renderInputs('view', filteredGroups[0].filtered)}</>;
            }
            
            // Multiple tabs - wrap each in FormTab
            return filteredGroups.map((group, idx) => (
                <FormTab
                    key={`tab-${group.original[0].tab || idx}`}
                    value={idx}
                    label={group.original[0].tab || options?.label || resourceConfig?.label}
                >
                    {renderInputs('view', group.filtered)}
                </FormTab>
            ));
        }
    }
};


DashAutoFormTabs.whyDidYouRender = true;

export default DashAutoFormTabs;