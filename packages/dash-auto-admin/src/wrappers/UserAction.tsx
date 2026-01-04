import { WithRecord, Button } from 'react-admin';
import IDashAutoAdminAttribute from '../interfaces/IDashAutoAdminAttribute';
import IDashAutoAdminCustomFieldComponent from '../interfaces/IDashAutoAdminCustomFieldComponent';
import ActionCallback from '../types/ActionCallback';

import React from 'react';
import isFC from '../utils/isFC';

/**
 * A React functional component that renders a user action based on the provided attribute.
 * 
 * If the attribute has a custom component, it will render that component with the provided props.
 * If the attribute has an action callback, it will render a button that calls the callback when clicked.
 * 
 * @param param0 - An object containing the following properties:
 *   - attribute: An IDashAutoAdminAttribute object that defines the user action.
 *   - method: The method type ('list', 'view', 'edit', or 'create') for the user action.
 *   - record: An optional record object to pass to the custom component or action callback.
 * @returns A React element representing the user action, or null if the attribute is not valid.
 */


const UserAction: React.FC<IDashAutoAdminCustomFieldComponent> = (props) => {
    const { method, attribute, resourceConfig, record, options } = props;
    const DEBUG = false;
   
   DEBUG &&  console.log('🔧 UserAction - component:', attribute.component);
   DEBUG &&  console.log('🔧 UserAction - isFC(attribute.component):', isFC(attribute.component));
   DEBUG &&  console.log('🔧 UserAction - method:', method);
   
    const locale = options?.locale || (props as any).locale;
    
    if (attribute.component && isFC(attribute.component)) {
       DEBUG &&  console.log('🔧 UserAction - Rendering custom component');
     
        const Action = attribute.component as React.FC<IDashAutoAdminCustomFieldComponent>;

        return <Action
                method={method}
                attribute={attribute}
                resourceConfig={resourceConfig}
                {...record && { record: record }}
                {...attribute?.componentProps}
                locale={locale}
                options={options}
            />
    }

    if (typeof attribute.action === 'function') {
        
        const callback = attribute.action as ActionCallback;
        return (
            <WithRecord
                label={attribute.label}
                render={(record) => (
                    <Button value={attribute.label} onClick={() => callback(record.id)}>
                        <>{attribute.label}</>
                    </Button>
                )}
            />
        );
    }

    return null;
};

export default UserAction;
